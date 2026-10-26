"""Performance guards and OpenAPI schema health."""
import pytest
from django.core.management import call_command
from django.db import connection
from django.test.utils import CaptureQueriesContext

from apps.accounts.models import User
from apps.rbac.models import Permission, UserPermissionOverride, UserRole
from apps.rbac.services import user_permission_codes

pytestmark = pytest.mark.django_db


def _count(client, url):
    with CaptureQueriesContext(connection) as ctx:
        assert client.get(url).status_code == 200
    return len(ctx)


def test_user_list_query_count_is_constant(api, tenant):
    client = api(tenant.users["Principal"])
    before = _count(client, "/api/v1/users/")
    for i in range(8):
        u = User.objects.create_user(email=f"extra{i}@x.test", password="x", organization=tenant.org)
        UserRole.objects.create(user=u, role=tenant.roles["Teacher"])
    assert _count(client, "/api/v1/users/") == before


def test_prefetched_permissions_match_resolver(api, tenant):
    teacher = tenant.users["Teacher"]
    UserPermissionOverride.objects.create(
        user=teacher, permission=Permission.objects.get(code="fee.view"), granted=True
    )
    UserPermissionOverride.objects.create(
        user=teacher, permission=Permission.objects.get(code="exam.view"), granted=False
    )
    rows = api(tenant.users["Principal"]).get("/api/v1/users/", {"page_size": 100}).json()["results"]
    for row in rows:
        user = User.objects.get(pk=row["id"])
        assert set(row["permissions"]) == user_permission_codes(user), user.email


def test_openapi_schema_has_no_warnings(tmp_path):
    call_command("spectacular", "--fail-on-warn", "--file", str(tmp_path / "schema.yml"))
