"""DRF permission classes for RBAC + tenant scoping (school.md §11.2)."""
from rest_framework.permissions import BasePermission

from apps.rbac.services import user_has_permission


class IsPlatformAdmin(BasePermission):
    """The platform owner (you), spanning all tenants."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and getattr(user, "is_platform_admin", False)
        )


class HasPermission(BasePermission):
    """Checks the RBAC code declared as `required_permission` on the view.

    Superusers / platform admins always pass. If a view declares no
    `required_permission`, authentication alone is sufficient.
    """

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.is_superuser or getattr(user, "is_platform_admin", False):
            return True
        code = getattr(view, "required_permission", None)
        if not code:
            return True
        return user_has_permission(user, code)


class IsSameOrganization(BasePermission):
    """Object-level guard: the object's organization must match the user's."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_superuser or getattr(user, "is_platform_admin", False):
            return True
        obj_org_id = getattr(obj, "organization_id", None)
        return obj_org_id is not None and obj_org_id == getattr(user, "organization_id", None)
