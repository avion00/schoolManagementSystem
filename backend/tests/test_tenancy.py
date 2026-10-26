"""Tenant isolation: nothing from another organization is visible or referenceable."""
import pytest

pytestmark = pytest.mark.django_db


def test_list_only_returns_own_organization(api, tenant, other_tenant):
    res = api(tenant.users["Principal"]).get("/api/v1/students/")
    assert res.status_code == 200
    ids = {s["id"] for s in res.json()["results"]}
    assert ids == {str(tenant.student.id)}


def test_retrieve_other_tenant_record_is_404(api, tenant, other_tenant):
    res = api(tenant.users["Principal"]).get(f"/api/v1/students/{other_tenant.student.id}/")
    assert res.status_code == 404


def test_cannot_reference_other_tenant_rows(api, tenant, other_tenant):
    res = api(tenant.users["Principal"]).post("/api/v1/students/", {
        "first_name": "X", "last_name": "Y", "admission_number": "ADM-9",
        "academic_year": str(other_tenant.year.id), "class_level": str(other_tenant.grade.id),
    }, format="json")
    assert res.status_code == 400
    assert "academic_year" in res.json() and "class_level" in res.json()


def test_cannot_add_item_to_other_tenant_invoice(api, tenant, other_tenant):
    res = api(tenant.users["Accountant"]).post("/api/v1/fees/invoice-items/", {
        "invoice": str(other_tenant.invoice.id), "description": "x", "amount": "10.00",
    }, format="json")
    assert res.status_code == 400
    other_tenant.invoice.refresh_from_db()
    assert other_tenant.invoice.items.count() == 1


def test_audit_log_is_tenant_scoped(api, tenant, other_tenant):
    api(other_tenant.users["Principal"]).patch(
        f"/api/v1/students/{other_tenant.student.id}/", {"phone": "1"}, format="json"
    )
    res = api(tenant.users["Principal"]).get("/api/v1/audit/logs/")
    assert res.status_code == 200
    assert res.json()["count"] == 0
