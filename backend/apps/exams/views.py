from rest_framework.decorators import action
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


class ExamSubjectViewSet(TenantModelViewSet):
    queryset = ExamSubject.objects.select_related("exam", "class_level", "subject").all()
    serializer_class = ExamSubjectSerializer
    audit_label = "exam_subject"
    permission_required = _MANAGE
    filterset_fields = ["exam", "class_level", "subject"]


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
