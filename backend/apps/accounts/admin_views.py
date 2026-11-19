"""Principal-side user account management API (principal-dashboard.md §4).

Tenant-scoped: a Principal manages only users in their own organization, can never
create platform admins / superusers, and every change is audit-logged.
"""
import secrets

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.audit.services import record_audit
from apps.core.permissions import HasPermission
from apps.rbac.models import Permission
from apps.rbac.services import PREFETCH_FOR_PERMISSIONS, can_manage_user

from .admin_serializers import UserAdminSerializer
from .models import User


class UserManagementViewSet(viewsets.ModelViewSet):
    serializer_class = UserAdminSerializer
    permission_classes = [IsAuthenticated, HasPermission]
    required_permission = "user.manage"
    search_fields = ["email", "full_name"]
    filterset_fields = ["is_active"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.serializer_class.Meta.model.objects.none()
        qs = User.objects.prefetch_related(*PREFETCH_FOR_PERMISSIONS).order_by("email")
        user = self.request.user
        if user.is_superuser or user.is_platform_admin:
            return qs
        # Principals never see platform admins or other tenants' users.
        return qs.filter(organization_id=user.organization_id, is_platform_admin=False)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Admin rows hold every permission; fetch the catalogue once per request.
        context["all_permission_codes"] = list(Permission.objects.values_list("code", flat=True))
        return context

    def get_object(self):
        target = super().get_object()
        # Reads are fine; any write needs authority over the target account.
        if self.action not in ("retrieve",) and not can_manage_user(self.request.user, target):
            raise PermissionDenied("You cannot manage a user with permissions you do not hold.")
        return target

    def _org_id(self):
        org_id = getattr(self.request.user, "organization_id", None)
        if org_id is None and not (
            self.request.user.is_superuser or self.request.user.is_platform_admin
        ):
            raise ValidationError("Your account is not attached to an organization.")
        return org_id

    def perform_create(self, serializer):
        actor = self.request.user
        user = serializer.save(organization_id=self._org_id())
        record_audit(
            action="user.create", actor=actor, instance=user,
            request=self.request, organization=actor.organization,
        )

    def perform_update(self, serializer):
        actor = self.request.user
        user = serializer.save()
        record_audit(
            action="user.update", actor=actor, instance=user,
            request=self.request, organization=actor.organization,
        )

    def perform_destroy(self, instance):
        if instance.pk == self.request.user.pk:
            raise ValidationError("You cannot deactivate your own account.")
        # Deactivate rather than delete (preserves history + audit trail).
        instance.is_active = False
        instance.save(update_fields=["is_active"])
        record_audit(
            action="user.deactivate", actor=self.request.user, instance=instance,
            request=self.request, organization=self.request.user.organization,
        )

    @action(detail=True, methods=["post"], url_path="reset-password")
    def reset_password(self, request, pk=None):
        user = self.get_object()
        temp = request.data.get("password") or secrets.token_urlsafe(9)
        user.set_password(temp)
        user.must_change_password = True
        user.save(update_fields=["password", "must_change_password"])
        record_audit(
            action="user.password_reset", actor=request.user, instance=user,
            request=request, organization=request.user.organization,
        )
        return Response({"temporary_password": temp, "must_change_password": True})

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save(update_fields=["is_active"])
        record_audit(
            action="user.activate", actor=request.user, instance=user,
            request=request, organization=request.user.organization,
        )
        return Response(UserAdminSerializer(user).data)
