"""Guardians, student links and the parent portal."""
import pytest

from apps.guardians.models import Guardian, StudentGuardian
from apps.students.models import Student

pytestmark = pytest.mark.django_db


@pytest.fixture
def principal(api, tenant):
    return api(tenant.users["Principal"])


@pytest.fixture
def family(tenant, other_tenant):
    """A guardian with a portal login linked to the tenant's student, plus an
    unrelated student in the same school."""
    guardian = Guardian.objects.create(
        organization=tenant.org, full_name="Hari Rai", relation="father", email="hari@x.test",
    )
    StudentGuardian.objects.create(
        organization=tenant.org, student=tenant.student, guardian=guardian,
        relation="father", is_primary=True,
    )
    stranger = Student.objects.create(
        organization=tenant.org, first_name="Other", last_name="Kid", admission_number="ADM-99",
        academic_year=tenant.year, class_level=tenant.grade,
    )
    return guardian, stranger


def test_create_guardian_gets_code(principal):
    res = principal.post("/api/v1/guardians/", {"full_name": "Sita Rai", "relation": "mother"}, format="json")
    assert res.status_code == 201
    assert res.json()["guardian_code"].startswith("GRD-")


def test_link_guardian_and_single_primary(principal, tenant, family):
    second = principal.post("/api/v1/guardians/", {"full_name": "Sita Rai", "relation": "mother"}, format="json").json()
    res = principal.post("/api/v1/student-guardians/", {
        "student": str(tenant.student.id), "guardian": second["id"], "is_primary": True,
    }, format="json")
    assert res.status_code == 201, res.json()
    assert res.json()["relation"] == "mother"  # defaulted from the guardian
    primaries = StudentGuardian.objects.filter(student=tenant.student, is_primary=True)
    assert [link.guardian.full_name for link in primaries] == ["Sita Rai"]


def test_duplicate_link_rejected_but_relink_after_unlink(principal, tenant, family):
    guardian, _ = family
    payload = {"student": str(tenant.student.id), "guardian": str(guardian.id)}
    assert principal.post("/api/v1/student-guardians/", payload, format="json").status_code == 400
    link = StudentGuardian.objects.get(student=tenant.student, guardian=guardian)
    assert principal.delete(f"/api/v1/student-guardians/{link.id}/").status_code == 204
    assert principal.post("/api/v1/student-guardians/", payload, format="json").status_code == 201


def test_cannot_link_across_tenants(principal, tenant, other_tenant, family):
    guardian, _ = family
    res = principal.post("/api/v1/student-guardians/", {
        "student": str(other_tenant.student.id), "guardian": str(guardian.id),
    }, format="json")
    assert res.status_code == 400


def test_guardian_lists_children(principal, family, tenant):
    guardian, _ = family
    body = principal.get(f"/api/v1/guardians/{guardian.id}/").json()
    assert body["children_count"] == 1
    assert body["children"][0]["name"] == tenant.student.full_name


def test_guardian_overview(principal, family):
    guardian, _ = family
    body = principal.get(f"/api/v1/guardians/{guardian.id}/overview/").json()
    assert body["total_outstanding_fees"] == 1000.0
    assert body["children"][0]["outstanding_fees"] == 1000.0


# --- parent portal ----------------------------------------------------------

@pytest.fixture
def parent(api, principal, family):
    guardian, _ = family
    res = principal.post(f"/api/v1/guardians/{guardian.id}/create-login/", {}, format="json")
    assert res.status_code == 200, res.json()
    guardian.refresh_from_db()
    assert guardian.user.user_roles.get().role.name == "Parent"
    return api(guardian.user)


def test_parent_sees_only_their_children(parent, tenant, family):
    children = parent.get("/api/v1/me/children/").json()
    assert [c["id"] for c in children] == [str(tenant.student.id)]
    assert children[0]["outstanding_fees"] == 1000.0


def test_parent_child_endpoints(parent, tenant):
    base = f"/api/v1/me/children/{tenant.student.id}"
    assert parent.get(f"{base}/").json()["profile"]["id"] == str(tenant.student.id)
    assert parent.get(f"{base}/attendance/").status_code == 200
    assert parent.get(f"{base}/attendance/summary/").status_code == 200
    assert parent.get(f"{base}/results/").json() == []
    assert parent.get(f"{base}/fees/").json()["summary"]["outstanding"] == 1000.0


def test_parent_cannot_read_other_children(parent, family, other_tenant):
    _, stranger = family
    for sid in (stranger.id, other_tenant.student.id):
        assert parent.get(f"/api/v1/me/children/{sid}/").status_code == 404
        assert parent.get(f"/api/v1/me/children/{sid}/fees/").status_code == 404


def test_unpublished_results_hidden_from_parent(parent, tenant, api):
    api(tenant.users["Teacher"]).post("/api/v1/exams/marks/", {
        "exam_subject": str(tenant.exam_subject.id), "student": str(tenant.student.id),
        "marks_obtained": "80",
    }, format="json")
    assert parent.get(f"/api/v1/me/children/{tenant.student.id}/results/").json() == []


def test_blocked_guardian_loses_portal_access(parent, principal, family):
    guardian, _ = family
    assert principal.patch(f"/api/v1/guardians/{guardian.id}/", {"status": "blocked"}, format="json").status_code == 200
    guardian.user.refresh_from_db()
    assert guardian.user.is_active is False


def test_student_and_staff_cannot_use_parent_portal(api, tenant):
    assert api(tenant.users["Student"]).get("/api/v1/me/children/").status_code == 403
    assert api(tenant.users["Principal"]).get("/api/v1/me/children/").status_code == 403


def test_me_reports_guardian_flag(parent):
    assert parent.get("/api/v1/auth/me/").json()["is_guardian"] is True
