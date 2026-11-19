"""Audit entries capture before/after values."""
import pytest

from apps.audit.models import AuditLog

pytestmark = pytest.mark.django_db


def test_update_records_field_diff(api, tenant):
    api(tenant.users["Principal"]).patch(
        f"/api/v1/students/{tenant.student.id}/",
        {"phone": "98000", "first_name": "Asha"}, format="json",
    )
    log = AuditLog.objects.get(action="student.update")
    assert log.changes == {"phone": ["", "98000"]}
    assert log.organization_id == tenant.org.id


def test_fk_changes_are_json_safe(api, tenant):
    api(tenant.users["Principal"]).patch(
        f"/api/v1/students/{tenant.student.id}/",
        {"class_level": str(tenant.other_grade.id), "section": None}, format="json",
    )
    log = AuditLog.objects.get(action="student.update")
    assert log.changes["class_level"] == [str(tenant.grade.id), str(tenant.other_grade.id)]
    assert log.changes["section"] == [str(tenant.section.id), None]


def test_single_current_academic_year(api, tenant):
    res = api(tenant.users["Principal"]).post("/api/v1/academics/academic-years/", {
        "school": str(tenant.school.id), "name": "2027-2028",
        "start_date": "2027-04-01", "end_date": "2028-03-31", "is_current": True,
    }, format="json")
    assert res.status_code == 201
    tenant.year.refresh_from_db()
    assert tenant.year.is_current is False
