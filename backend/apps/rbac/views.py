from django.db.models import Q
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.audit.services import record_audit
from apps.core.permissions import HasPermission

from .models import Permission, Role, RolePermission, UserPermissionOverride, UserRole
from .serializers import (
    PermissionSerializer,
    RoleSerializer,
    UserPermissionOverrideSerializer,
    UserRoleSerializer,
)
from .services import user_permission_codes


class PermissionViewSet(
    mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated, HasPermission]
    required_permission = "role.manage"
    filterset_fields = ["module"]
    search_fields = ["code", "name"]


class RoleViewSet(viewsets.ModelViewSet):
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, HasPermission]
    required_permission = "role.manage"
    search_fields = ["name"]

    def get_queryset(self):
        user = self.request.user
        qs = Role.objects.all().prefetch_related("permissions")
        if user.is_superuser or user.is_platform_admin:
            return qs
        return qs.filter(
            Q(organization__isnull=True) | Q(organization_id=user.organization_id)
        )

    def _guard_editable(self, role):
        if role.is_system or role.organization_id is None:
            raise PermissionDenied("System roles cannot be modified.")

    def perform_create(self, serializer):
        actor = self.request.user
        role = serializer.save(
            organization_id=actor.organization_id, is_system=False,
            created_by=actor, updated_by=actor,
        )
        record_audit(action="role.create", actor=actor, instance=role,
                     request=self.request, organization=actor.organization)

    def perform_update(self, serializer):
        self._guard_editable(self.get_object())
        actor = self.request.user
        role = serializer.save(updated_by=actor)
        record_audit(action="role.update", actor=actor, instance=role,
                     request=self.request, organization=actor.organization)

    def perform_destroy(self, instance):
        self._guard_editable(instance)
        instance.updated_by = self.request.user
        instance.soft_delete()
        record_audit(action="role.delete", actor=self.request.user, instance=instance,
                     request=self.request, organization=self.request.user.organization)

    @action(detail=True, methods=["post"], url_path="permissions")
    def set_permissions(self, request, pk=None):
        role = self.get_object()
        self._guard_editable(role)
        codes = request.data.get("codes")
        ids = request.data.get("permission_ids")
        if codes is not None:
            perms = list(Permission.objects.filter(code__in=codes))
        elif ids is not None:
            perms = list(Permission.objects.filter(id__in=ids))
        else:
            raise PermissionDenied("Provide 'codes' or 'permission_ids'.")
        # Guardrail: you may only grant permissions you hold.
        actor = request.user
        if not (actor.is_superuser or actor.is_platform_admin):
            held = user_permission_codes(actor)
            requested = {p.code for p in perms}
            if not requested.issubset(held):
                raise PermissionDenied("You cannot grant permissions you do not hold.")
        RolePermission.objects.filter(role=role).delete()
        RolePermission.objects.bulk_create(
            [RolePermission(role=role, permission=p) for p in perms]
        )
        record_audit(
            action="role.permissions.set", actor=actor, instance=role, request=request,
            organization=actor.organization, changes={"codes": sorted(p.code for p in perms)},
        )
        # Re-fetch to avoid the stale prefetch cache from get_object().
        fresh = self.get_queryset().get(pk=role.pk)
        return Response(RoleSerializer(fresh).data)


class UserRoleViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin,
    mixins.DestroyModelMixin, viewsets.GenericViewSet,
):
    serializer_class = UserRoleSerializer
    permission_classes = [IsAuthenticated, HasPermission]
    required_permission = "role.manage"
    filterset_fields = ["user", "role"]

    def get_queryset(self):
        user = self.request.user
        qs = UserRole.objects.select_related("user", "role", "school")
        if user.is_superuser or user.is_platform_admin:
            return qs
        return qs.filter(user__organization_id=user.organization_id)

    def perform_create(self, serializer):
        actor = self.request.user
        obj = serializer.save()
        record_audit(action="user.role.assign", actor=actor, instance=obj, request=self.request,
                     organization=actor.organization,
                     changes={"user": str(obj.user_id), "role": obj.role.name})

    def perform_destroy(self, instance):
        record_audit(action="user.role.remove", actor=self.request.user, instance=instance,
                     request=self.request, organization=self.request.user.organization,
                     changes={"user": str(instance.user_id), "role": instance.role.name})
        instance.delete()


class UserPermissionOverrideViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin,
    mixins.DestroyModelMixin, viewsets.GenericViewSet,
):
    serializer_class = UserPermissionOverrideSerializer
    permission_classes = [IsAuthenticated, HasPermission]
    required_permission = "role.manage"
    filterset_fields = ["user", "granted"]

    def get_queryset(self):
        user = self.request.user
        qs = UserPermissionOverride.objects.select_related("user", "permission")
        if user.is_superuser or user.is_platform_admin:
            return qs
        return qs.filter(user__organization_id=user.organization_id)

    def perform_create(self, serializer):
        actor = self.request.user
        obj = serializer.save()
        record_audit(action="permission.override.set", actor=actor, instance=obj, request=self.request,
                     organization=actor.organization,
                     changes={"user": str(obj.user_id), "permission": obj.permission.code, "granted": obj.granted})

    def perform_destroy(self, instance):
        record_audit(action="permission.override.remove", actor=self.request.user, instance=instance,
                     request=self.request, organization=self.request.user.organization,
                     changes={"user": str(instance.user_id), "permission": instance.permission.code})
        instance.delete()
