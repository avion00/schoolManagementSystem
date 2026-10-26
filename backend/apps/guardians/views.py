from django.db import transaction
from django.db.models import Prefetch
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from apps.accounts.services import provision_login
from apps.audit.services import record_audit
from apps.core.sequences import next_document_number
from apps.core.viewsets import TenantModelViewSet
from apps.rbac.services import user_permission_codes
from apps.students import services as student_services

from .models import Guardian, StudentGuardian
from .serializers import GuardianSerializer, StudentGuardianSerializer

_VIEW_MANAGE = {
    "list": "guardian.view",
    "retrieve": "guardian.view",
    "overview": "guardian.view",
    "create": "guardian.manage",
    "update": "guardian.manage",
    "partial_update": "guardian.manage",
    "destroy": "guardian.manage",
    "create_login": "user.manage",
}


class GuardianViewSet(TenantModelViewSet):
    queryset = Guardian.objects.select_related("user").prefetch_related(
        Prefetch(
            "student_links",
            queryset=StudentGuardian.objects.select_related(
                "student", "student__class_level", "student__section"
            ),
        )
    )
    serializer_class = GuardianSerializer
    audit_label = "guardian"
    permission_required = _VIEW_MANAGE
    filterset_fields = ["relation", "status", "gender"]
    search_fields = ["full_name", "phone", "alternate_phone", "email", "guardian_code"]
    ordering_fields = ["full_name", "created_at"]

    @transaction.atomic
    def perform_create(self, serializer):
        code = next_document_number(self._require_org(), "GRD")
        super().perform_create(serializer, guardian_code=code)

    def perform_update(self, serializer):
        super().perform_update(serializer)
        guardian = serializer.instance
        # Blocking/deactivating a guardian also suspends their portal login.
        if guardian.user_id and "status" in serializer.validated_data:
            guardian.user.is_active = guardian.status == Guardian.Status.ACTIVE
            guardian.user.save(update_fields=["is_active"])

    @transaction.atomic
    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        instance.student_links.update(is_active=False)
        if instance.user_id:
            instance.user.is_active = False
            instance.user.save(update_fields=["is_active"])

    @action(detail=True, methods=["get"])
    def overview(self, request, pk=None):
        """Guardian detail page: profile + per-child academic/finance cards."""
        guardian = self.get_object()
        can_fees = "fee.view" in user_permission_codes(request.user)
        children = []
        total_due = 0.0
        for link in guardian.student_links.all():
            student = link.student
            if not student.is_active:
                continue
            summary = student_services.child_summary(student)
            total_due += summary["outstanding_fees"]
            if not can_fees:
                summary["outstanding_fees"] = None
            children.append({
                "student": str(student.id), "name": student.full_name,
                "class_level_name": student.class_level.name,
                "section_name": student.section.name if student.section_id else None,
                "relation": link.relation, **summary,
            })
        return Response({
            "guardian": GuardianSerializer(guardian, context={"request": request}).data,
            "children": children,
            "total_outstanding_fees": total_due if can_fees else None,
        })

    @action(detail=True, methods=["post"], url_path="create-login")
    @transaction.atomic
    def create_login(self, request, pk=None):
        """Provision a parent-portal login for this guardian (Parent role)."""
        guardian = self.get_object()
        if guardian.user_id:
            raise ValidationError("Guardian already has a login.")
        if guardian.status != Guardian.Status.ACTIVE:
            raise ValidationError("Only active guardians can be given a login.")
        user, password = provision_login(
            email=request.data.get("email") or guardian.email,
            full_name=guardian.full_name, organization_id=guardian.organization_id,
            role_name="Parent", password=request.data.get("password"),
        )
        guardian.user = user
        guardian.updated_by = request.user
        guardian.save(update_fields=["user", "updated_by", "updated_at"])
        record_audit(
            action="guardian.create_login", actor=request.user, instance=guardian,
            request=request, organization=request.user.organization,
        )
        return Response({
            "user_id": str(user.id), "email": user.email, "temporary_password": password,
        })


class StudentGuardianViewSet(TenantModelViewSet):
    """Links between students and guardians (who is whose parent/guardian)."""

    queryset = StudentGuardian.objects.select_related("student", "guardian")
    serializer_class = StudentGuardianSerializer
    audit_label = "student_guardian"
    permission_required = {
        "list": "guardian.view",
        "retrieve": "guardian.view",
        "create": "guardian.manage",
        "update": "guardian.manage",
        "partial_update": "guardian.manage",
        "destroy": "guardian.manage",
    }
    filterset_fields = ["student", "guardian", "is_primary"]

    @transaction.atomic
    def perform_create(self, serializer):
        if serializer.validated_data.get("is_primary"):
            StudentGuardian.objects.filter(
                student=serializer.validated_data["student"], is_primary=True
            ).update(is_primary=False)
        super().perform_create(serializer)

    @transaction.atomic
    def perform_update(self, serializer):
        if serializer.validated_data.get("is_primary"):
            StudentGuardian.objects.filter(
                student=serializer.instance.student, is_primary=True
            ).exclude(pk=serializer.instance.pk).update(is_primary=False)
        super().perform_update(serializer)

    def perform_destroy(self, instance):
        instance.is_primary = False  # frees the one-primary-per-student slot
        instance.save(update_fields=["is_primary", "updated_at"])
        super().perform_destroy(instance)
