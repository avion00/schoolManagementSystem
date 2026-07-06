"""Reusable tenant-scoped CRUD viewset.

Every domain module (students, fees, exams…) subclasses TenantModelViewSet to get,
for free:
  - organization isolation on every read (school.md §6, §11.2)
  - per-action RBAC enforcement (school.md §5)
  - automatic organization / created_by / updated_by stamping on writes
  - soft delete instead of hard delete (school.md §13, §14.3)
  - audit log entries for create / update / delete (school.md §7.19)
"""
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from apps.audit.services import record_audit
from apps.core.permissions import HasPermission


class TenantModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, HasPermission]

    # action -> RBAC permission code. Unmapped actions require auth only.
    permission_required: dict[str, str] = {}
    # prefix used for audit action names, e.g. "student" -> "student.create"
    audit_label = "record"

    def get_permissions(self):
        # HasPermission reads `self.required_permission`.
        self.required_permission = self.permission_required.get(self.action)
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_superuser or getattr(user, "is_platform_admin", False):
            return qs
        return qs.filter(organization_id=user.organization_id)

    def _require_org(self):
        org_id = getattr(self.request.user, "organization_id", None)
        if org_id is None:
            raise ValidationError(
                "Your account is not attached to an organization; cannot write tenant data."
            )
        return org_id

    def perform_create(self, serializer):
        user = self.request.user
        org_id = self._require_org()
        obj = serializer.save(
            organization_id=org_id, created_by=user, updated_by=user
        )
        record_audit(
            action=f"{self.audit_label}.create", actor=user, instance=obj,
            request=self.request, organization=user.organization,
        )

    def perform_update(self, serializer):
        user = self.request.user
        obj = serializer.save(updated_by=user)
        record_audit(
            action=f"{self.audit_label}.update", actor=user, instance=obj,
            request=self.request, organization=user.organization,
        )

    def perform_destroy(self, instance):
        user = self.request.user
        instance.updated_by = user
        instance.soft_delete()  # never hard-delete tenant records
        record_audit(
            action=f"{self.audit_label}.delete", actor=user, instance=instance,
            request=self.request, organization=user.organization,
        )
