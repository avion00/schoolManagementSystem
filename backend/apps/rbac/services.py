"""Permission resolution.

Effective permissions = (union of permissions from the user's roles)
then apply per-user overrides (grants add, revokes remove). Superusers and
platform admins implicitly hold every permission.
"""


def user_permission_codes(user):
    if not user or not getattr(user, "is_authenticated", False):
        return set()

    from .models import Permission, RolePermission

    if user.is_superuser or getattr(user, "is_platform_admin", False):
        return set(Permission.objects.values_list("code", flat=True))

    role_ids = user.user_roles.values_list("role_id", flat=True)
    codes = set(
        RolePermission.objects.filter(role_id__in=role_ids)
        .values_list("permission__code", flat=True)
    )

    for override in user.permission_overrides.select_related("permission"):
        if override.granted:
            codes.add(override.permission.code)
        else:
            codes.discard(override.permission.code)

    return codes


def user_has_permission(user, code):
    return code in user_permission_codes(user)


def user_role_names(user):
    if not user or not getattr(user, "is_authenticated", False):
        return []
    return list(
        user.user_roles.select_related("role")
        .values_list("role__name", flat=True)
        .distinct()
    )
