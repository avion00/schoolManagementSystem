"""Permission resolution.

Effective permissions = (union of permissions from the user's roles)
then apply per-user overrides (grants add, revokes remove). Superusers and
platform admins implicitly hold every permission.

Results are memoised on the current request (one resolution per user per request)
so repeated checks in permissions, serializers and views don't re-query.
"""
from apps.core.context import get_current_request

_CACHE_ATTR = "_rbac_permission_cache"


def _is_admin(user):
    return bool(user.is_superuser or getattr(user, "is_platform_admin", False))


def _resolve(user):
    from .models import Permission, RolePermission

    if _is_admin(user):
        return frozenset(Permission.objects.values_list("code", flat=True))

    role_ids = user.user_roles.filter(role__is_active=True).values_list("role_id", flat=True)
    codes = set(
        RolePermission.objects.filter(role_id__in=role_ids)
        .values_list("permission__code", flat=True)
    )

    for override in user.permission_overrides.select_related("permission"):
        if override.granted:
            codes.add(override.permission.code)
        else:
            codes.discard(override.permission.code)

    return frozenset(codes)


def user_permission_codes(user):
    if not user or not getattr(user, "is_authenticated", False):
        return set()

    request = get_current_request()
    if request is None:
        return set(_resolve(user))
    cache = request.__dict__.setdefault(_CACHE_ATTR, {})
    if user.pk not in cache:
        cache[user.pk] = _resolve(user)
    return set(cache[user.pk])


def invalidate_permission_cache():
    """Call after changing roles/overrides mid-request."""
    request = get_current_request()
    if request is not None:
        request.__dict__.pop(_CACHE_ATTR, None)


def user_has_permission(user, code):
    return code in user_permission_codes(user)


def can_manage_user(actor, target):
    """May `actor` change `target`'s account, roles or permissions?

    Guards against privilege escalation: a non-admin may only manage users in
    their own organization whose effective permissions are a subset of their own
    (so e.g. an IT admin with `user.manage` can't take over the Principal).
    """
    if _is_admin(actor):
        return True
    if _is_admin(target) or target.organization_id != actor.organization_id:
        return False
    return user_permission_codes(target) <= user_permission_codes(actor)


def user_role_names(user):
    if not user or not getattr(user, "is_authenticated", False):
        return []
    return list(
        user.user_roles.select_related("role")
        .values_list("role__name", flat=True)
        .distinct()
    )
