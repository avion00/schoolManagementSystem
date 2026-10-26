import uuid

from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from apps.academics.models import ClassLevel, Section
from apps.audit.services import record_audit
from apps.core.sequences import next_document_number
from apps.core.viewsets import TenantModelViewSet
from apps.rbac.services import user_has_permission
from apps.students.models import Student
from apps.students.services import attendance_summary
from apps.teachers.services import student_scope_q

from . import services
from .models import Exam, ExamRoom, ExamSubject, GradeBand, GradeScale, Mark
from .serializers import (
    ExamRoomSerializer,
    ExamSerializer,
    ExamSubjectSerializer,
    GradeBandSerializer,
    GradeScaleSerializer,
    MarkBulkSerializer,
    MarkSerializer,
)

_MANAGE = {
    "list": "exam.view",
    "retrieve": "exam.view",
    "create": "exam.create",
    "update": "exam.create",
    "partial_update": "exam.create",
    "destroy": "exam.create",
}


def _uuid_param(request, name, required=False):
    raw = request.query_params.get(name)
    if not raw:
        if required:
            raise ValidationError({name: "This parameter is required."})
        return None
    try:
        return uuid.UUID(raw)
    except ValueError:
        raise ValidationError({name: "Must be a valid id."})


def _ensure_unlocked(exam):
    if exam.is_locked:
        raise ValidationError("This exam is locked and cannot be changed.")


class GradeScaleViewSet(TenantModelViewSet):
    queryset = GradeScale.objects.prefetch_related("bands").all()
    serializer_class = GradeScaleSerializer
    audit_label = "grade_scale"
    permission_required = _MANAGE
    search_fields = ["name"]


class GradeBandViewSet(TenantModelViewSet):
    queryset = GradeBand.objects.select_related("scale").all()
    serializer_class = GradeBandSerializer
    audit_label = "grade_band"
    permission_required = _MANAGE
    filterset_fields = ["scale"]


class ExamRoomViewSet(TenantModelViewSet):
    queryset = ExamRoom.objects.all()
    serializer_class = ExamRoomSerializer
    audit_label = "exam_room"
    permission_required = _MANAGE
    search_fields = ["name", "building"]


class ExamViewSet(TenantModelViewSet):
    queryset = Exam.objects.select_related("academic_year", "grade_scale").all()
    serializer_class = ExamSerializer
    audit_label = "exam"
    permission_required = {
        **_MANAGE,
        "lock": "exam.marks.lock",
        "unlock": "exam.marks.lock",
        "publish": "exam.result.publish",
        "unpublish": "exam.result.publish",
        "completeness": "exam.view",
        "results": "exam.view",
        "report_card": "exam.view",
        "admit_cards": "exam.view",
    }
    filterset_fields = ["academic_year", "is_published", "is_locked", "status", "exam_type"]
    search_fields = ["name", "term", "code"]

    @transaction.atomic
    def perform_create(self, serializer):
        super().perform_create(serializer, code=next_document_number(self._require_org(), "EXM"))

    def perform_update(self, serializer):
        # Descriptive fields may change after lock; dates/scale/year may not.
        frozen = {"academic_year", "grade_scale", "start_date", "end_date"}
        if serializer.instance.is_locked and frozen & set(serializer.validated_data):
            raise ValidationError("This exam is locked; its year, dates and grade scale are fixed.")
        super().perform_update(serializer)

    def perform_destroy(self, instance):
        if instance.is_published or Mark.objects.filter(exam_subject__exam=instance).exists():
            raise ValidationError("An exam with marks or published results can't be deleted. Cancel it instead.")
        super().perform_destroy(instance)

    def _transition(self, request, action_name, **changes):
        exam = self.get_object()
        for field, value in changes.items():
            setattr(exam, field, value)
        exam.updated_by = request.user
        exam.save(update_fields=[*changes, "updated_by", "updated_at"])
        record_audit(
            action=f"exam.{action_name}", actor=request.user, instance=exam,
            request=request, organization=request.user.organization,
        )
        return Response(ExamSerializer(exam).data)

    @action(detail=True, methods=["post"])
    def lock(self, request, pk=None):
        return self._transition(request, "lock", is_locked=True)

    @action(detail=True, methods=["post"])
    def unlock(self, request, pk=None):
        if self.get_object().is_published:
            raise ValidationError("Unpublish the results before unlocking marks.")
        return self._transition(request, "unlock", is_locked=False)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        """Workflow: enter marks -> lock -> publish. Refuses while marks are
        missing unless `force: true` is sent (e.g. a student left mid-term)."""
        exam = self.get_object()
        if not exam.is_locked:
            raise ValidationError("Lock the exam's marks before publishing results.")
        gaps = services.completeness(exam)
        if gaps and not request.data.get("force"):
            # Plain Response (not ValidationError) keeps the counts as numbers.
            return Response({"detail": "Some marks are missing.", "missing": gaps}, status=400)
        return self._transition(
            request, "publish", is_published=True, published_at=timezone.now(),
            status=Exam.Status.COMPLETED,
        )

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        return self._transition(request, "unpublish", is_published=False, published_at=None)

    @action(detail=True, methods=["get"])
    def completeness(self, request, pk=None):
        gaps = services.completeness(self.get_object())
        return Response({"complete": not gaps, "missing": gaps})

    @action(detail=True, methods=["get"])
    def results(self, request, pk=None):
        """Ranked results for ?class_level= (optionally ?section=)."""
        exam = self.get_object()
        org = request.user.organization_id
        class_level = ClassLevel.objects.filter(
            organization_id=org, pk=_uuid_param(request, "class_level", required=True)
        ).first()
        if class_level is None:
            raise ValidationError({"class_level": "Class not found."})
        section_id = _uuid_param(request, "section")
        section = Section.objects.filter(organization_id=org, pk=section_id).first() if section_id else None
        data = services.compute_results(exam, class_level, section=section)
        if not (user_has_permission(request.user, "student.view.all") or request.user.is_superuser):
            allowed = {str(pk) for pk in Student.objects.filter(student_scope_q(request.user)).values_list("pk", flat=True)}
            data["rows"] = [r for r in data["rows"] if r["student"] in allowed]
        return Response(data)

    @action(detail=True, methods=["get"], url_path="report-card")
    def report_card(self, request, pk=None):
        """Everything a printable report card needs for ?student=."""
        exam = self.get_object()
        student = Student.objects.filter(
            organization_id=request.user.organization_id, pk=_uuid_param(request, "student", required=True)
        ).select_related("class_level", "section", "academic_year").first()
        if student is None:
            raise ValidationError({"student": "Student not found."})
        return Response(build_report_card(exam, student))

    @action(detail=True, methods=["get"], url_path="admit-cards")
    def admit_cards(self, request, pk=None):
        """Printable admit cards for ?class_level= (optionally ?section=)."""
        exam = self.get_object()
        class_level_id = _uuid_param(request, "class_level", required=True)
        section_id = _uuid_param(request, "section")
        papers = ExamSubject.objects.filter(exam=exam, class_level_id=class_level_id).select_related(
            "subject", "room"
        )
        schedule = [
            {
                "subject": p.subject.name, "date": p.exam_date, "start_time": p.start_time,
                "end_time": p.end_time, "reporting_time": p.reporting_time,
                "room": p.room.name if p.room_id else None,
            }
            for p in papers
        ]
        students = Student.objects.filter(
            organization_id=request.user.organization_id, class_level_id=class_level_id,
            status=Student.Status.ACTIVE,
        ).select_related("class_level", "section").order_by("section__name", "roll_number", "first_name")
        if section_id:
            students = students.filter(section_id=section_id)
        return Response({
            "exam": ExamSerializer(exam).data,
            "schedule": schedule,
            "cards": [
                {
                    "student": str(s.id), "name": s.full_name, "admission_number": s.admission_number,
                    "registration_number": s.registration_number, "roll_number": s.roll_number,
                    "class_level_name": s.class_level.name,
                    "section_name": s.section.name if s.section_id else None,
                    "symbol_number": f"{exam.code}-{s.admission_number}",
                }
                for s in students
            ],
        })


def build_report_card(exam, student):
    """One student's result in one exam, plus attendance — shared with portals."""
    paper = ExamSubject.objects.filter(exam=exam, marks__student=student).select_related("class_level").first()
    class_level = paper.class_level if paper else student.class_level
    data = services.compute_results(exam, class_level, student_ids=None)
    row = next((r for r in data["rows"] if r["student"] == str(student.id)), None)
    class_size = sum(1 for r in data["rows"] if r["rank"] is not None)
    return {
        "exam": ExamSerializer(exam).data,
        "student": {
            "id": str(student.id), "name": student.full_name,
            "admission_number": student.admission_number,
            "registration_number": student.registration_number,
            "roll_number": student.roll_number, "class_level_name": class_level.name,
            "section_name": student.section.name if student.section_id else None,
            "date_of_birth": student.date_of_birth,
            "guardian": student.primary_guardian.full_name if student.primary_guardian else None,
        },
        "result": row,
        "class_size": class_size,
        "attendance": attendance_summary(student),
        "grade_scale": GradeScaleSerializer(exam.grade_scale).data if exam.grade_scale_id else None,
    }


class ExamSubjectViewSet(TenantModelViewSet):
    queryset = ExamSubject.objects.select_related(
        "exam", "class_level", "subject", "room", "invigilator", "assistant_invigilator"
    ).annotate(marks_entered=Count("marks", filter=Q(marks__is_active=True)))
    serializer_class = ExamSubjectSerializer
    audit_label = "exam_subject"
    permission_required = {**_MANAGE, "conflicts": "exam.view"}
    filterset_fields = {
        "exam": ["exact"], "class_level": ["exact"], "subject": ["exact"], "room": ["exact"],
        "invigilator": ["exact"], "exam_date": ["exact", "gte", "lte"],
    }
    ordering_fields = ["exam_date", "start_time"]

    def perform_destroy(self, instance):
        _ensure_unlocked(instance.exam)
        if instance.marks.exists():
            raise ValidationError("This paper has marks; it can't be deleted.")
        super().perform_destroy(instance)

    @action(detail=False, methods=["get"])
    def conflicts(self, request):
        """All clashes among the papers of ?exam= (for the schedule page)."""
        exam_id = _uuid_param(request, "exam", required=True)
        out = []
        for paper in self.get_queryset().filter(exam_id=exam_id):
            data = {
                "exam_date": paper.exam_date, "start_time": paper.start_time, "end_time": paper.end_time,
                "room": paper.room, "invigilator": paper.invigilator,
                "assistant_invigilator": paper.assistant_invigilator, "class_level": paper.class_level,
            }
            for clash in services.schedule_conflicts(data, exclude_id=paper.pk, organization_id=paper.organization_id):
                out.append({"exam_subject": str(paper.id), "subject": paper.subject.name, "clash": clash})
        return Response({"count": len(out), "conflicts": out})


class MarkViewSet(TenantModelViewSet):
    queryset = Mark.objects.select_related("exam_subject", "exam_subject__exam", "student").all()
    serializer_class = MarkSerializer
    audit_label = "mark"
    permission_required = {
        "list": "exam.view",
        "retrieve": "exam.view",
        "sheet": ("exam.marks.enter", "exam.view"),
        "create": "exam.marks.enter",
        "bulk": "exam.marks.enter",
        "update": "exam.marks.enter",
        "partial_update": "exam.marks.enter",
        "destroy": "exam.marks.enter",
    }
    filterset_fields = ["exam_subject", "student", "exam_subject__exam"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_superuser or user.is_platform_admin or user_has_permission(user, "student.view.all"):
            return qs
        return qs.filter(student_scope_q(user, prefix="student__"))

    def _check_scope(self, paper, students):
        scope = services.can_enter_marks(self.request.user, paper)
        if scope is None:
            return
        allowed = set(Student.objects.filter(scope, pk__in=[s.pk for s in students]).values_list("pk", flat=True))
        outside = [s.admission_number for s in students if s.pk not in allowed]
        if outside:
            raise ValidationError(
                f"You don't teach {paper.subject.name} to: {', '.join(outside)}"
            )

    def perform_create(self, serializer):
        self._check_scope(serializer.validated_data["exam_subject"], [serializer.validated_data["student"]])
        super().perform_create(serializer)

    def perform_update(self, serializer):
        self._check_scope(serializer.instance.exam_subject, [serializer.instance.student])
        super().perform_update(serializer)

    def perform_destroy(self, instance):
        _ensure_unlocked(instance.exam_subject.exam)
        self._check_scope(instance.exam_subject, [instance.student])
        super().perform_destroy(instance)

    @action(detail=False, methods=["post"])
    @transaction.atomic
    def bulk(self, request):
        """Enter or update a whole paper's marks in one go."""
        org_id = self._require_org()
        serializer = MarkBulkSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        paper = serializer.validated_data["exam_subject"]
        records = serializer.validated_data["records"]
        self._check_scope(paper, [r["student"] for r in records])
        user = request.user
        fields = ("marks_obtained", "theory_marks", "practical_marks", "internal_marks", "is_absent", "remarks")
        created_count = 0
        for rec in records:
            values = {f: rec.get(f) for f in fields} | {"remarks": rec.get("remarks", ""), "updated_by": user}
            _, created = Mark.objects.update_or_create(
                organization_id=org_id, exam_subject=paper, student=rec["student"],
                defaults=values, create_defaults={**values, "created_by": user},
            )
            created_count += created
        record_audit(
            action="mark.bulk", actor=user, request=request, organization=user.organization,
            changes={"exam_subject": str(paper.id), "count": len(records)},
        )
        return Response({"saved": len(records), "created": created_count})

    @action(detail=False, methods=["get"])
    def sheet(self, request):
        """Marks-entry grid for ?exam_subject=: the students this user may grade,
        with any marks already entered."""
        paper = ExamSubject.objects.filter(
            organization_id=request.user.organization_id,
            pk=_uuid_param(request, "exam_subject", required=True),
        ).select_related("exam", "subject", "class_level").first()
        if paper is None:
            raise ValidationError({"exam_subject": "Paper not found."})
        students = Student.objects.filter(
            organization_id=paper.organization_id, class_level=paper.class_level,
            status=Student.Status.ACTIVE,
        )
        scope = services.can_enter_marks(request.user, paper)
        if scope is not None:
            students = students.filter(scope)
        marks = {m.student_id: m for m in Mark.objects.filter(exam_subject=paper, student__in=students)}
        rows = []
        for s in students.select_related("section").order_by("section__name", "roll_number", "first_name"):
            m = marks.get(s.id)
            rows.append({
                "student": str(s.id), "name": s.full_name, "roll_number": s.roll_number,
                "admission_number": s.admission_number, "registration_number": s.registration_number,
                "section_name": s.section.name if s.section_id else None,
                "mark": MarkSerializer(m).data if m else None,
            })
        return Response({
            "exam_subject": ExamSubjectSerializer(paper).data,
            "locked": paper.exam.is_locked,
            "components": {k: float(v) for k, v in paper.components.items()},
            "rows": rows,
            "entered": len(marks),
        })
