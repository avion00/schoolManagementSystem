import calendar
import uuid

from django.db import transaction
from django.db.models import Count, Prefetch
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from apps.accounts.services import provision_login
from apps.audit.services import record_audit
from apps.core.viewsets import TenantModelViewSet

from .models import StaffAttendance, Teacher, TeacherAssignment
from .serializers import (
    StaffAttendanceBulkSerializer,
    StaffAttendanceSerializer,
    TeacherAssignmentSerializer,
    TeacherSerializer,
)
from .services import PRESENT_LIKE, staff_attendance_summary

_MANAGE = {
    "list": "teacher.view",
    "retrieve": "teacher.view",
    "create": "teacher.manage",
    "update": "teacher.manage",
    "partial_update": "teacher.manage",
    "destroy": "teacher.manage",
}


def _ensure_not_future(date):
    if date > timezone.localdate():
        raise ValidationError({"date": "Attendance cannot be recorded for a future date."})


class TeacherViewSet(TenantModelViewSet):
    queryset = Teacher.objects.select_related("primary_subject", "user").prefetch_related(
        Prefetch(
            "assignments",
            queryset=TeacherAssignment.objects.select_related("class_level", "section", "subject"),
        )
    )
    serializer_class = TeacherSerializer
    audit_label = "teacher"
    permission_required = {
        **_MANAGE,
        "overview": "teacher.view",
        "create_login": "user.manage",
    }
    filterset_fields = ["status", "department", "employment_type", "gender", "primary_subject"]
    search_fields = ["full_name", "employee_id", "email", "phone", "department", "designation"]
    ordering_fields = ["full_name", "employee_id", "joining_date", "created_at"]

    def perform_update(self, serializer):
        super().perform_update(serializer)
        teacher = serializer.instance
        # Leaving staff lose portal access; returning staff get it back.
        if teacher.user_id and "status" in serializer.validated_data:
            active = teacher.status in (Teacher.Status.ACTIVE, Teacher.Status.ON_LEAVE)
            if teacher.user.is_active != active:
                teacher.user.is_active = active
                teacher.user.save(update_fields=["is_active"])

    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        if instance.user_id:
            instance.user.is_active = False
            instance.user.save(update_fields=["is_active"])

    @action(detail=True, methods=["get"])
    def overview(self, request, pk=None):
        teacher = self.get_object()
        today = timezone.localdate()
        attendance = StaffAttendance.objects.filter(teacher=teacher)
        monthly = []
        for row in (
            attendance.filter(date__year=today.year)
            .values_list("date__month", "status").annotate(n=Count("id"))
        ):
            month, status, n = row
            monthly.append({"month": month, "status": status, "count": n})
        return Response({
            "teacher": TeacherSerializer(teacher, context={"request": request}).data,
            "assignments": TeacherAssignmentSerializer(
                teacher.assignments.all(), many=True, context={"request": request}
            ).data,
            "attendance": staff_attendance_summary(attendance),
            "attendance_this_month": staff_attendance_summary(
                attendance.filter(date__year=today.year, date__month=today.month)
            ),
            "attendance_by_month": monthly,
        })

    @action(detail=True, methods=["post"], url_path="create-login")
    @transaction.atomic
    def create_login(self, request, pk=None):
        """Provision a portal login for this teacher (Teacher role)."""
        teacher = self.get_object()
        if teacher.user_id:
            raise ValidationError("Teacher already has a login.")
        user, password = provision_login(
            email=request.data.get("email") or teacher.email,
            full_name=teacher.full_name, organization_id=teacher.organization_id,
            role_name="Teacher", password=request.data.get("password"),
        )
        teacher.user = user
        teacher.updated_by = request.user
        teacher.save(update_fields=["user", "updated_by", "updated_at"])
        record_audit(
            action="teacher.create_login", actor=request.user, instance=teacher,
            request=request, organization=request.user.organization,
        )
        return Response({
            "user_id": str(user.id), "email": user.email, "temporary_password": password,
        })


class TeacherAssignmentViewSet(TenantModelViewSet):
    queryset = TeacherAssignment.objects.select_related(
        "teacher", "academic_year", "class_level", "section", "subject"
    ).all()
    serializer_class = TeacherAssignmentSerializer
    audit_label = "teacher_assignment"
    permission_required = _MANAGE
    filterset_fields = ["teacher", "academic_year", "class_level", "section", "subject", "is_class_teacher"]


class StaffAttendanceViewSet(TenantModelViewSet):
    queryset = StaffAttendance.objects.select_related("teacher").all()
    serializer_class = StaffAttendanceSerializer
    audit_label = "staff_attendance"
    permission_required = {
        "list": "staff_attendance.view",
        "retrieve": "staff_attendance.view",
        "summary": "staff_attendance.view",
        "monthly": "staff_attendance.view",
        "create": "staff_attendance.manage",
        "update": "staff_attendance.manage",
        "partial_update": "staff_attendance.manage",
        "destroy": "staff_attendance.manage",
        "bulk": "staff_attendance.manage",
    }
    filterset_fields = {
        "teacher": ["exact"], "status": ["exact"], "date": ["exact", "gte", "lte"],
    }

    def perform_create(self, serializer):
        _ensure_not_future(serializer.validated_data["date"])
        super().perform_create(serializer)

    def perform_update(self, serializer):
        if "date" in serializer.validated_data:
            _ensure_not_future(serializer.validated_data["date"])
        super().perform_update(serializer)

    @action(detail=False, methods=["post"])
    @transaction.atomic
    def bulk(self, request):
        """Take the staff register for one day (create or update each teacher)."""
        org_id = self._require_org()
        serializer = StaffAttendanceBulkSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        date = serializer.validated_data["date"]
        _ensure_not_future(date)
        user = request.user
        results = []
        for rec in serializer.validated_data["records"]:
            obj, created = StaffAttendance.objects.update_or_create(
                organization_id=org_id, teacher=rec["teacher"], date=date,
                defaults={
                    "status": rec["status"], "check_in": rec["check_in"],
                    "check_out": rec["check_out"], "remark": rec["remark"], "updated_by": user,
                },
                create_defaults={
                    "status": rec["status"], "check_in": rec["check_in"],
                    "check_out": rec["check_out"], "remark": rec["remark"],
                    "updated_by": user, "created_by": user,
                },
            )
            results.append({"teacher": str(rec["teacher"].id), "status": obj.status, "created": created})
        record_audit(
            action="staff_attendance.bulk", actor=user, request=request,
            organization=user.organization, changes={"date": str(date), "count": len(results)},
        )
        return Response({"date": str(date), "results": results})

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """Counts for the filtered range, e.g. ?date=2026-10-26 or ?date__gte=…&date__lte=…"""
        return Response(staff_attendance_summary(self.filter_queryset(self.get_queryset())))

    @action(detail=False, methods=["get"])
    def monthly(self, request):
        """Register grid: every active teacher × every day of ?year=&month=."""
        today = timezone.localdate()
        try:
            year = int(request.query_params.get("year", today.year))
            month = int(request.query_params.get("month", today.month))
            days = calendar.monthrange(year, month)[1]
        except (ValueError, calendar.IllegalMonthError):
            raise ValidationError("Provide a valid year and month.")
        teachers = Teacher.objects.filter(organization_id=request.user.organization_id)
        if "teacher" in request.query_params:
            try:
                teachers = teachers.filter(pk=uuid.UUID(request.query_params["teacher"]))
            except ValueError:
                raise ValidationError({"teacher": "Must be a valid id."})
        records = {}
        for teacher_id, date, status in self.get_queryset().filter(
            date__year=year, date__month=month
        ).values_list("teacher_id", "date", "status"):
            records.setdefault(teacher_id, {})[date.day] = status
        rows = []
        for t in teachers:
            marks = records.get(t.id, {})
            rows.append({
                "teacher": str(t.id), "name": t.full_name, "employee_id": t.employee_id,
                "records": {str(day): marks.get(day) for day in range(1, days + 1)},
                "present": sum(1 for s in marks.values() if s in PRESENT_LIKE),
                "absent": sum(1 for s in marks.values() if s == "absent"),
                "leave": sum(1 for s in marks.values() if s == "leave"),
            })
        return Response({"year": year, "month": month, "days": days, "rows": rows})
