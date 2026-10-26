import calendar
import datetime
import uuid

from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from apps.audit.services import record_audit
from apps.communications.services import notify_absences
from apps.core.viewsets import TenantModelViewSet
from apps.rbac.services import user_has_permission
from apps.students.models import Student
from apps.teachers.services import student_scope_q

from . import services
from .models import Attendance, Holiday
from .serializers import AttendanceBulkSerializer, AttendanceSerializer, HolidaySerializer

REPORT = "attendance.report"


def _param_uuid(request, name, required=False):
    raw = request.query_params.get(name)
    if not raw:
        if required:
            raise ValidationError({name: "This parameter is required."})
        return None
    try:
        return uuid.UUID(raw)
    except ValueError:
        raise ValidationError({name: "Must be a valid id."})


def _param_date(request, name, default=None):
    raw = request.query_params.get(name)
    if not raw:
        return default
    try:
        return datetime.date.fromisoformat(raw)
    except ValueError:
        raise ValidationError({name: "Use YYYY-MM-DD."})


def _month(request):
    today = timezone.localdate()
    try:
        year = int(request.query_params.get("year", today.year))
        month = int(request.query_params.get("month", today.month))
        return year, month, calendar.monthrange(year, month)[1]
    except (ValueError, calendar.IllegalMonthError):
        raise ValidationError("Provide a valid year and month.")


class AttendanceViewSet(TenantModelViewSet):
    queryset = Attendance.objects.select_related(
        "student", "student__class_level", "student__section"
    ).all()
    serializer_class = AttendanceSerializer
    audit_label = "attendance"
    permission_required = {
        "list": REPORT,
        "retrieve": REPORT,
        "register": ("attendance.take", REPORT),
        "monthly": REPORT,
        "student_report": REPORT,
        "class_report": REPORT,
        "stats": REPORT,
        "create": "attendance.take",
        "bulk": "attendance.take",
        "update": "attendance.update",
        "partial_update": "attendance.update",
        "destroy": "attendance.update",
    }
    filterset_fields = {
        "date": ["exact", "gte", "lte"], "status": ["exact"], "student": ["exact"],
        "student__class_level": ["exact"], "student__section": ["exact"],
    }

    def get_queryset(self):
        """Teachers (no school-wide student access) see only their students' records."""
        qs = super().get_queryset()
        user = self.request.user
        if services.can_manage_all(user) or user_has_permission(user, "student.view.all"):
            return qs
        return qs.filter(student_scope_q(user, prefix="student__"))

    def _students_in_scope(self):
        qs = Student.objects.filter(organization_id=self.request.user.organization_id)
        user = self.request.user
        if services.can_manage_all(user) or user_has_permission(user, "student.view.all"):
            return qs
        return qs.filter(student_scope_q(user))

    # --- writes -----------------------------------------------------------

    def perform_create(self, serializer):
        data = serializer.validated_data
        services.check_date(self.request.user, self._require_org(), data["date"])
        services.check_students(self.request.user, [data["student"]])
        super().perform_create(serializer)
        if serializer.instance.status == "absent":
            notify_absences([serializer.instance.student], serializer.instance.date)

    def perform_update(self, serializer):
        instance = serializer.instance
        user = self.request.user
        services.check_date(user, instance.organization_id, instance.date)
        if "date" in serializer.validated_data:
            services.check_date(user, instance.organization_id, serializer.validated_data["date"])
        services.check_students(user, [serializer.validated_data.get("student", instance.student)])
        super().perform_update(serializer)

    def perform_destroy(self, instance):
        services.check_date(self.request.user, instance.organization_id, instance.date)
        services.check_students(self.request.user, [instance.student])
        super().perform_destroy(instance)

    @action(detail=False, methods=["post"])
    @transaction.atomic
    def bulk(self, request):
        """Mark attendance for many students on one date (take a class register)."""
        org_id = self._require_org()
        serializer = AttendanceBulkSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        date = serializer.validated_data["date"]
        records = serializer.validated_data["records"]
        user = request.user
        services.check_date(user, org_id, date)
        services.check_students(user, [r["student"] for r in records])
        previous = dict(
            Attendance.objects.filter(student__in=[r["student"] for r in records], date=date)
            .values_list("student_id", "status")
        )
        results, newly_absent = [], []
        for rec in records:
            values = {"status": rec["status"], "remark": rec.get("remark", ""), "updated_by": user}
            obj, created = Attendance.objects.update_or_create(
                organization_id=org_id, student=rec["student"], date=date,
                defaults=values, create_defaults={**values, "created_by": user},
            )
            if obj.status == "absent" and previous.get(rec["student"].id) != "absent":
                newly_absent.append(rec["student"])
            results.append(
                {"student": str(rec["student"].id), "status": obj.status, "created": created}
            )
        # Guardians hear about each absence once, after the register commits.
        transaction.on_commit(lambda: notify_absences(newly_absent, date))
        record_audit(
            action="attendance.bulk", actor=user, request=request,
            organization=user.organization,
            changes={"date": str(date), "count": len(results)},
        )
        return Response({"date": str(date), "results": results})

    # --- registers & reports ----------------------------------------------

    @action(detail=False, methods=["get"])
    def register(self, request):
        """Roster for ?section= (or ?class_level=) on ?date=, with any marks so far."""
        date = _param_date(request, "date", timezone.localdate())
        section = _param_uuid(request, "section")
        class_level = _param_uuid(request, "class_level")
        if not (section or class_level):
            raise ValidationError("Provide a section or class_level.")
        students = self._students_in_scope().filter(status=Student.Status.ACTIVE)
        students = students.filter(section_id=section) if section else students.filter(class_level_id=class_level)
        students = students.order_by("roll_number", "first_name")
        marks = {
            a.student_id: a for a in Attendance.objects.filter(student__in=students, date=date)
        }
        holiday = services.holiday_on(request.user.organization_id, date)
        return Response({
            "date": str(date),
            "holiday": holiday.name if holiday else None,
            "students": [
                {
                    "student": str(s.id), "name": s.full_name, "roll_number": s.roll_number,
                    "admission_number": s.admission_number,
                    "status": marks[s.id].status if s.id in marks else None,
                    "remark": marks[s.id].remark if s.id in marks else "",
                }
                for s in students
            ],
            "marked": len(marks),
        })

    @action(detail=False, methods=["get"])
    def monthly(self, request):
        """Students × days grid for a class/section and month."""
        year, month, days = _month(request)
        section = _param_uuid(request, "section")
        class_level = _param_uuid(request, "class_level")
        students = self._students_in_scope().filter(status=Student.Status.ACTIVE)
        if section:
            students = students.filter(section_id=section)
        elif class_level:
            students = students.filter(class_level_id=class_level)
        else:
            raise ValidationError("Provide a section or class_level.")
        students = list(students.order_by("roll_number", "first_name"))
        grid = {}
        for sid, date, status in Attendance.objects.filter(
            student__in=students, date__year=year, date__month=month
        ).values_list("student_id", "date", "status"):
            grid.setdefault(sid, {})[date.day] = status
        first, last = datetime.date(year, month, 1), datetime.date(year, month, days)
        holidays = Holiday.objects.filter(
            organization_id=request.user.organization_id, start_date__lte=last, end_date__gte=first
        )
        rows = []
        for s in students:
            marks = grid.get(s.id, {})
            counts = {st: sum(1 for v in marks.values() if v == st) for st in Attendance.Status.values}
            marked = len(marks)
            present = sum(counts[st] for st in services.PRESENT_LIKE)
            rows.append({
                "student": str(s.id), "name": s.full_name, "roll_number": s.roll_number,
                "records": {str(d): marks.get(d) for d in range(1, days + 1)},
                "counts": counts,
                "rate": round(present / marked * 100, 1) if marked else None,
            })
        return Response({
            "year": year, "month": month, "days": days,
            "holidays": HolidaySerializer(holidays, many=True).data,
            "rows": rows,
        })

    @action(detail=False, methods=["get"], url_path="student-report")
    def student_report(self, request):
        """One student's attendance: totals and month-by-month for a date range."""
        student_id = _param_uuid(request, "student", required=True)
        student = self._students_in_scope().filter(pk=student_id).first()
        if student is None:
            raise ValidationError({"student": "Student not found."})
        today = timezone.localdate()
        start = _param_date(request, "date_from", today.replace(month=1, day=1))
        end = _param_date(request, "date_to", today)
        qs = Attendance.objects.filter(student=student, date__range=(start, end))
        by_status = dict(qs.values_list("status").annotate(n=Count("id")))
        months = {}
        for date, status in qs.values_list("date", "status"):
            m = months.setdefault(f"{date.year}-{date.month:02d}", {"present": 0, "absent": 0, "total": 0})
            m["total"] += 1
            if status in services.PRESENT_LIKE:
                m["present"] += 1
            elif status == "absent":
                m["absent"] += 1
        return Response({
            "student": str(student.id), "name": student.full_name,
            "date_from": str(start), "date_to": str(end),
            "by_status": by_status, "total": sum(by_status.values()), "rate": services.rate(qs),
            "months": [{"month": k, **v} for k, v in sorted(months.items())],
        })

    @action(detail=False, methods=["get"], url_path="class-report")
    def class_report(self, request):
        """Rate per section over a date range (class comparison)."""
        today = timezone.localdate()
        start = _param_date(request, "date_from", today.replace(day=1))
        end = _param_date(request, "date_to", today)
        in_range = Q(attendances__date__range=(start, end), attendances__is_active=True)
        rows = (
            self._students_in_scope().filter(status=Student.Status.ACTIVE)
            .values("class_level__id", "class_level__name", "class_level__order", "section__id", "section__name")
            .annotate(
                students=Count("id", distinct=True),
                marked=Count("attendances", filter=in_range),
                present=Count("attendances", filter=in_range & Q(attendances__status__in=services.PRESENT_LIKE)),
            )
            .order_by("class_level__order", "section__name")
        )
        return Response({
            "date_from": str(start), "date_to": str(end),
            "rows": [
                {
                    "class_level": str(r["class_level__id"]), "class_level_name": r["class_level__name"],
                    "section": str(r["section__id"]) if r["section__id"] else None,
                    "section_name": r["section__name"], "students": r["students"],
                    "rate": round(r["present"] / r["marked"] * 100, 1) if r["marked"] else None,
                }
                for r in rows
            ],
        })

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Dashboard cards: today's counts, this month's rate, week-on-week change,
        and a 6-month trend."""
        today = _param_date(request, "date", timezone.localdate())
        qs = self.get_queryset()
        by_status = dict(qs.filter(date=today).values_list("status").annotate(n=Count("id")))
        week_start = today - datetime.timedelta(days=today.weekday())
        this_week = services.rate(qs.filter(date__range=(week_start, today)))
        last_week = services.rate(qs.filter(
            date__range=(week_start - datetime.timedelta(days=7), week_start - datetime.timedelta(days=1))
        ))
        trend = []
        y, m = today.year, today.month
        for _ in range(6):
            trend.append({"month": f"{y}-{m:02d}", "rate": services.rate(qs.filter(date__year=y, date__month=m))})
            y, m = (y - 1, 12) if m == 1 else (y, m - 1)
        return Response({
            "date": str(today),
            "today": {st: by_status.get(st, 0) for st in Attendance.Status.values},
            "monthly_rate": services.rate(qs.filter(date__year=today.year, date__month=today.month)),
            "weekly_change": (
                round(this_week - last_week, 1) if this_week is not None and last_week is not None else None
            ),
            "monthly_trend": list(reversed(trend)),
        })


class HolidayViewSet(TenantModelViewSet):
    """School calendar. Everyone in the organization can read it (portals too)."""

    queryset = Holiday.objects.all()
    serializer_class = HolidaySerializer
    audit_label = "holiday"
    permission_required = {
        "create": "academics.manage",
        "update": "academics.manage",
        "partial_update": "academics.manage",
        "destroy": "academics.manage",
    }
    filterset_fields = {"start_date": ["gte", "lte"], "end_date": ["gte", "lte"]}
    search_fields = ["name"]
