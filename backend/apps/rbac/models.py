"""RBAC: roles, permissions, assignments, and per-user overrides (school.md §5).

Permission codes follow `module.action.scope` (e.g. `student.view.all`).
Roles can be system-wide (organization is null) or organization-specific.
"""
from django.conf import settings
from django.db import models

from apps.core.models import BaseModel, TimeStampedModel, UUIDModel


class Permission(UUIDModel, TimeStampedModel):
    code = models.CharField(max_length=100, unique=True)  # module.action.scope
    name = models.CharField(max_length=150)
    module = models.CharField(max_length=50, db_index=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["module", "code"]

    def __str__(self):
        return self.code


class Role(BaseModel):
    # organization=null => system role available to all tenants.
    organization = models.ForeignKey(
        "accounts.Organization", null=True, blank=True,
        on_delete=models.CASCADE, related_name="roles",
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_system = models.BooleanField(default=False)
    permissions = models.ManyToManyField(
        Permission, through="RolePermission", related_name="roles"
    )

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "name"], name="uniq_role_name_per_org"
            )
        ]

    def __str__(self):
        return self.name


class RolePermission(UUIDModel, TimeStampedModel):
    role = models.ForeignKey(
        Role, on_delete=models.CASCADE, related_name="role_permissions"
    )
    permission = models.ForeignKey(
        Permission, on_delete=models.CASCADE, related_name="role_permissions"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["role", "permission"], name="uniq_role_permission"
            )
        ]


class UserRole(UUIDModel, TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user_roles"
    )
    role = models.ForeignKey(
        Role, on_delete=models.CASCADE, related_name="user_roles"
    )
    # Optional scope: a role may apply only within one school (school.md §5.3).
    school = models.ForeignKey(
        "accounts.School", null=True, blank=True,
        on_delete=models.CASCADE, related_name="user_roles",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "role", "school"], name="uniq_user_role_scope"
            )
        ]


class UserPermissionOverride(UUIDModel, TimeStampedModel):
    """Grant or revoke a single permission for one user (school.md §5.2)."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="permission_overrides",
    )
    permission = models.ForeignKey(
        Permission, on_delete=models.CASCADE, related_name="overrides"
    )
    granted = models.BooleanField(default=True)  # True=grant, False=revoke

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "permission"], name="uniq_user_permission_override"
            )
        ]
