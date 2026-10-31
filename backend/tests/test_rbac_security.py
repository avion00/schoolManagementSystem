"""Privilege escalation guards for role / permission / account management."""
import pytest

from apps.rbac.models import Role, RolePermission, UserRole
from apps.rbac.services import user_permission_codes

pytestmark = pytest.mark.django_db


@pytest.fixture
def role_manager(tenant, permissions):
    """A non-principal user who holds role.manage + user.manage only."""
    role = Role.objects.create(organization=tenant.org, name="IT Admin")
    for code in ("role.manage", "user.manage"):
        RolePermission.objects.create(role=role, permission=permissions[code])
    user = tenant.users["Teacher"]
    UserRole.objects.create(user=user, role=role)
    return user


def test_cannot_assign_role_with_permissions_you_lack(api, tenant, role_manager):
    res = api(role_manager).post("/api/v1/rbac/user-roles/", {
        "user": str(role_manager.id), "role": str(tenant.roles["Principal"].id),
    }, format="json")
    assert res.status_code == 400
    assert not UserRole.objects.filter(user=role_manager, role=tenant.roles["Principal"]).exists()


def test_can_assign_role_within_own_permissions(api, tenant):
    principal = tenant.users["Principal"]
    res = api(principal).post("/api/v1/rbac/user-roles/", {
        "user": str(tenant.users["Accountant"].id), "role": str(tenant.roles["Teacher"].id),
    }, format="json")
    assert res.status_code == 201


def test_cannot_remove_role_from_more_privileged_user(api, tenant, role_manager):
    ur = UserRole.objects.get(user=tenant.users["Principal"])
    res = api(role_manager).delete(f"/api/v1/rbac/user-roles/{ur.id}/")
    assert res.status_code == 403
    assert UserRole.objects.filter(pk=ur.pk).exists()


def test_cannot_reset_password_of_more_privileged_user(api, tenant, role_manager):
    principal = tenant.users["Principal"]
    res = api(role_manager).post(f"/api/v1/users/{principal.id}/reset-password/", {}, format="json")
    assert res.status_code == 403
    principal.refresh_from_db()
    assert principal.check_password("Passw0rd!2024")


def test_cannot_edit_or_deactivate_more_privileged_user(api, tenant, role_manager):
    principal = tenant.users["Principal"]
    client = api(role_manager)
    assert client.patch(f"/api/v1/users/{principal.id}/", {"email": "evil@x.test"}, format="json").status_code == 403
    assert client.delete(f"/api/v1/users/{principal.id}/").status_code == 403
    principal.refresh_from_db()
    assert principal.is_active and principal.email != "evil@x.test"


def test_can_manage_less_privileged_user(api, tenant):
    accountant = tenant.users["Accountant"]
    res = api(tenant.users["Principal"]).post(f"/api/v1/users/{accountant.id}/reset-password/", {}, format="json")
    assert res.status_code == 200
    assert res.json()["must_change_password"] is True


def test_cannot_deactivate_self(api, tenant):
    principal = tenant.users["Principal"]
    res = api(principal).delete(f"/api/v1/users/{principal.id}/")
    assert res.status_code == 400
    principal.refresh_from_db()
    assert principal.is_active


def test_cannot_override_permissions_on_more_privileged_user(api, tenant, role_manager, permissions):
    res = api(role_manager).post("/api/v1/rbac/permission-overrides/", {
        "user": str(tenant.users["Principal"].id),
        "permission": str(permissions["fee.view"].id), "granted": False,
    }, format="json")
    assert res.status_code == 400
    assert "fee.view" in user_permission_codes(tenant.users["Principal"])


def test_deleted_role_stops_granting_permissions(api, tenant):
    accountant = tenant.users["Accountant"]
    custom = Role.objects.create(organization=tenant.org, name="Auditor")
    RolePermission.objects.create(role=custom, permission=tenant.roles["Principal"].permissions.get(code="audit.view"))
    UserRole.objects.create(user=accountant, role=custom)
    assert "audit.view" in user_permission_codes(accountant)

    res = api(tenant.users["Principal"]).delete(f"/api/v1/rbac/roles/{custom.id}/")
    assert res.status_code == 204
    assert "audit.view" not in user_permission_codes(accountant)
