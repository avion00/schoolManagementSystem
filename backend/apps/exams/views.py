from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from apps.audit.services import record_audit
from apps.core.viewsets import TenantModelViewSet

from .models import Exam, ExamSubject, GradeBand, GradeScale, Mark
from .serializers import (
    ExamSerializer,
    ExamSubjectSerializer,
    GradeBandSerializer,
    GradeScaleSerializer,
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


class ExamViewSet(TenantModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    audit_label = "exam"
    permission_required = {
        **_MANAGE,
        "lock": "exam.marks.lock",
        "unlock": "exam.marks.lock",
        "publish": "exam.result.publish",
        "unpublish": "exam.result.publish",
    }
    filterset_fields = ["academic_year", "is_published", "is_locked"]
    search_fields = ["name", "term"]

    def _set_flag(self, request, field, value, action_name):
        exam = self.get_object()
        # Workflow: enter marks -> lock -> publish. Published results stay locked.
        if action_name == "publish" and not exam.is_locked:
            raise ValidationError("Lock the exam's marks before publishing results.")
        if action_name == "unlock" and exam.is_published:
            raise ValidationError("Unpublish the results before unlocking marks.")
        setattr(exam, field, value)
        exam.updated_by = request.user
        exam.save(update_fields=[field, "updated_by", "updated_at"])
        record_audit(
            action=f"exam.{action_name}", actor=request.user, instance=exam,
            request=request, organization=request.user.organization,
        )
        return Response(ExamSerializer(exam).data)

    @action(detail=True, methods=["post"])
    def lock(self, request, pk=None):
        return self._set_flag(request, "is_locked", True, "lock")

    @action(detail=True, methods=["post"])
    def unlock(self, request, pk=None):
        return self._set_flag(request, "is_locked", False, "unlock")

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        return self._set_flag(request, "is_published", True, "publish")

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        return self._set_flag(request, "is_published", False, "unpublish")


def _ensure_unlocked(exam):
    if exam.is_locked:
        raise ValidationError("This exam is locked and cannot be changed.")


class ExamSubjectViewSet(TenantModelViewSet):
    queryset = ExamSubject.objects.select_related("exam", "class_level", "subject").all()
    serializer_class = ExamSubjectSerializer
    audit_label = "exam_subject"
    permission_required = _MANAGE
    filterset_fields = ["exam", "class_level", "subject"]

    def perform_destroy(self, instance):
        _ensure_unlocked(instance.exam)
        super().perform_destroy(instance)


class MarkViewSet(TenantModelViewSet):
    queryset = Mark.objects.select_related("exam_subject", "student").all()
    serializer_class = MarkSerializer
    audit_label = "mark"
    permission_required = {
        "list": "exam.view",
        "retrieve": "exam.view",
        "create": "exam.marks.enter",
        "update": "exam.marks.enter",
        "partial_update": "exam.marks.enter",
        "destroy": "exam.marks.enter",
    }
    filterset_fields = ["exam_subject", "student"]

    def perform_destroy(self, instance):
        _ensure_unlocked(instance.exam_subject.exam)
        super().perform_destroy(instance)
