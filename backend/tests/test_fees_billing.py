"""Billing: generation, discounts (maker-checker), overdue, ledger, reports."""
import datetime
from decimal import Decimal

import pytest
from django.core.management import call_command
from django.utils import timezone

from apps.fees.models import FeeCategory, FeeDiscount, FeeStructure, Invoice
from apps.students.models import Student

pytestmark = pytest.mark.django_db


@pytest.fixture
def accountant(api, tenant):
    return api(tenant.users["Accountant"])


@pytest.fixture
def principal(api, tenant):
    return api(tenant.users["Principal"])


@pytest.fixture
def structures(tenant):
    tuition = FeeCategory.objects.create(organization=tenant.org, name="Tuition", code="TUI")
    bus = FeeCategory.objects.create(organization=tenant.org, name="Transport", code="BUS")
    return [
        FeeStructure.objects.create(organization=tenant.org, name="Grade 8 tuition", category=tuition,
                                    academic_year=tenant.year, class_level=tenant.grade, amount=Decimal("1500")),
        FeeStructure.objects.create(organization=tenant.org, name="Grade 9 tuition", category=tuition,
                                    academic_year=tenant.year, class_level=tenant.other_grade, amount=Decimal("1800")),
        FeeStructure.objects.create(organization=tenant.org, name="Bus", category=bus,
                                    academic_year=tenant.year, amount=Decimal("500")),
    ]


def generate(client, tenant, **extra):
    return client.post("/api/v1/fees/invoices/generate/", {
        "academic_year": str(tenant.year.id), "billing_period": "2026-11",
        "issue_date": "2026-11-01", "due_date": "2026-11-15", **extra,
    }, format="json")


def test_generate_bills_applicable_structures_and_is_idempotent(accountant, tenant, structures):
    nine = Student.objects.create(organization=tenant.org, first_name="N", last_name="G", admission_number="ADM-9G",
                                  academic_year=tenant.year, class_level=tenant.other_grade)
    res = generate(accountant, tenant)
    assert res.status_code == 201 and res.json()["created"] == 2
    asha = Invoice.objects.get(student=tenant.student, billing_period="2026-11")
    assert asha.total_amount == Decimal("2000") and asha.items.count() == 2
    assert asha.number.startswith("INV-")
    assert Invoice.objects.get(student=nine).total_amount == Decimal("2300")
    again = generate(accountant, tenant).json()
    assert again["created"] == 0 and again["skipped_already_billed"] == 2


def test_item_quantity_and_unit_price(accountant, tenant):
    res = accountant.post("/api/v1/fees/invoice-items/", {
        "invoice": str(tenant.invoice.id), "description": "Books", "quantity": 3, "unit_price": "120.00",
    }, format="json")
    assert res.status_code == 201 and res.json()["amount"] == "360.00"
    tenant.invoice.refresh_from_db()
    assert tenant.invoice.total_amount == Decimal("1360.00")


def test_discount_maker_checker(api, accountant, principal, tenant):
    req = accountant.post("/api/v1/fees/discounts/", {
        "invoice": str(tenant.invoice.id), "amount": "200.00", "reason": "Sibling",
    }, format="json")
    assert req.status_code == 201 and req.json()["status"] == "pending"
    did = req.json()["id"]
    assert accountant.post(f"/api/v1/fees/discounts/{did}/approve/").status_code == 400  # own request
    assert principal.post(f"/api/v1/fees/discounts/{did}/approve/", {"note": "ok"}, format="json").status_code == 200
    tenant.invoice.refresh_from_db()
    assert tenant.invoice.discount_amount == Decimal("200.00") and tenant.invoice.balance == Decimal("800.00")
    assert principal.post(f"/api/v1/fees/discounts/{did}/reject/").status_code == 400  # already decided
    assert accountant.delete(f"/api/v1/fees/discounts/{did}/").status_code == 400


def test_discount_limits(accountant, tenant):
    res = accountant.post("/api/v1/fees/discounts/", {
        "invoice": str(tenant.invoice.id), "amount": "1000.01", "reason": "x",
    }, format="json")
    assert res.status_code == 400


def test_discount_reduces_payable(api, accountant, principal, tenant):
    d = FeeDiscount.objects.create(organization=tenant.org, invoice=tenant.invoice, amount=Decimal("300"),
                                   reason="Merit", created_by=tenant.users["Principal"])
    accountant.post(f"/api/v1/fees/discounts/{d.id}/approve/")
    assert accountant.post("/api/v1/fees/payments/", {
        "invoice": str(tenant.invoice.id), "amount": "700.01", "method": "cash"}, format="json").status_code == 400
    assert accountant.post("/api/v1/fees/payments/", {
        "invoice": str(tenant.invoice.id), "amount": "700.00", "method": "cash"}, format="json").status_code == 201
    tenant.invoice.refresh_from_db()
    assert tenant.invoice.status == "paid"


def test_teacher_cannot_approve_discounts(api, tenant):
    d = FeeDiscount.objects.create(organization=tenant.org, invoice=tenant.invoice, amount=Decimal("10"), reason="x")
    assert api(tenant.users["Teacher"]).post(f"/api/v1/fees/discounts/{d.id}/approve/").status_code == 403


def test_overdue_command_and_recalc(tenant):
    Invoice.objects.filter(pk=tenant.invoice.pk).update(due_date=timezone.localdate() - datetime.timedelta(days=1))
    call_command("mark_overdue_invoices", stdout=open("/dev/null", "w"))
    tenant.invoice.refresh_from_db()
    assert tenant.invoice.status == "overdue"
    tenant.invoice.recalculate()
    assert tenant.invoice.status == "overdue"  # still unpaid and past due


def test_ledger_running_balance(accountant, principal, tenant):
    accountant.post("/api/v1/fees/payments/", {"invoice": str(tenant.invoice.id), "amount": "400", "method": "cash"}, format="json")
    pid = accountant.post("/api/v1/fees/payments/", {"invoice": str(tenant.invoice.id), "amount": "100", "method": "card"}, format="json").json()["id"]
    principal.post(f"/api/v1/fees/payments/{pid}/reverse/", {"reason": "declined"}, format="json")
    body = accountant.get("/api/v1/fees/ledger/", {"student": str(tenant.student.id)}).json()
    assert [e["type"] for e in body["entries"]] == ["invoice", "payment", "payment", "reversal"]
    assert body["balance"] == 600.0


def test_student_fee_roster(accountant, tenant):
    accountant.post("/api/v1/fees/payments/", {"invoice": str(tenant.invoice.id), "amount": "250", "method": "cash"}, format="json")
    row = accountant.get("/api/v1/fees/student-fees/").json()["results"][0]
    assert (row["billed"], row["paid"], row["due"], row["status"]) == (1000.0, 250.0, 750.0, "partial")
    assert accountant.get("/api/v1/fees/student-fees/", {"status": "paid"}).json()["count"] == 0


def test_reports(accountant, tenant):
    accountant.post("/api/v1/fees/payments/", {"invoice": str(tenant.invoice.id), "amount": "250", "method": "wallet"}, format="json")
    summary = accountant.get("/api/v1/fees/reports/summary/").json()
    assert summary["collected"] == 250.0 and summary["collected_by_method"] == {"wallet": 250.0}
    assert summary["outstanding"] == 750.0
    trend = accountant.get("/api/v1/fees/reports/collection-trend/", {"months": 3}).json()
    assert len(trend) == 3 and trend[-1]["collected"] == 250.0
    Invoice.objects.filter(pk=tenant.invoice.pk).update(status="overdue", due_date="2026-09-01")
    defaulters = accountant.get("/api/v1/fees/reports/defaulters/").json()
    assert defaulters[0]["overdue_amount"] == 750.0


def test_reports_need_fee_permission(api, tenant):
    assert api(tenant.users["Teacher"]).get("/api/v1/fees/reports/summary/").status_code == 403
    assert api(tenant.users["Teacher"]).get("/api/v1/fees/ledger/", {"student": str(tenant.student.id)}).status_code == 403


def test_reports_are_tenant_scoped(api, tenant, other_tenant):
    body = api(other_tenant.users["Accountant"]).get("/api/v1/fees/ledger/", {"student": str(tenant.student.id)})
    assert body.status_code == 400


def _set_fees(org, **values):
    from apps.orgsettings.models import OrganizationSettings
    row, _ = OrganizationSettings.objects.get_or_create(organization=org)
    row.data = {**row.data, "fees": {**(row.data.get("fees") or {}), **values}}
    row.save()


def test_late_fee_applied_once_after_grace_period(tenant):
    inv = tenant.invoice
    Invoice.objects.filter(pk=inv.pk).update(due_date=timezone.localdate() - datetime.timedelta(days=5))
    _set_fees(tenant.org, late_fee_enabled=True, late_fee_amount=50, late_fee_type="fixed", grace_period_days=10)
    call_command("mark_overdue_invoices", stdout=open("/dev/null", "w"))
    inv.refresh_from_db()
    assert inv.status == "overdue" and inv.total_amount == Decimal("1000.00")  # still within grace

    _set_fees(tenant.org, grace_period_days=2)
    call_command("mark_overdue_invoices", stdout=open("/dev/null", "w"))
    call_command("mark_overdue_invoices", stdout=open("/dev/null", "w"))  # idempotent
    inv.refresh_from_db()
    assert inv.total_amount == Decimal("1050.00")
    assert inv.items.filter(is_late_fee=True).count() == 1


def test_percentage_late_fee_and_disabled(tenant):
    Invoice.objects.filter(pk=tenant.invoice.pk).update(due_date=timezone.localdate() - datetime.timedelta(days=30))
    _set_fees(tenant.org, late_fee_enabled=False, late_fee_amount=10, late_fee_type="percentage")
    call_command("mark_overdue_invoices", stdout=open("/dev/null", "w"))
    tenant.invoice.refresh_from_db()
    assert tenant.invoice.total_amount == Decimal("1000.00")
    _set_fees(tenant.org, late_fee_enabled=True)
    call_command("mark_overdue_invoices", stdout=open("/dev/null", "w"))
    tenant.invoice.refresh_from_db()
    assert tenant.invoice.total_amount == Decimal("1100.00")  # 10% of the 1000 balance


def test_disabled_payment_method_is_refused(accountant, tenant):
    _set_fees(tenant.org, payment_methods={"cheque": False})
    res = accountant.post("/api/v1/fees/payments/", {"invoice": str(tenant.invoice.id), "amount": "100", "method": "cheque"}, format="json")
    assert res.status_code == 400 and "method" in res.json()
    ok = accountant.post("/api/v1/fees/payments/", {"invoice": str(tenant.invoice.id), "amount": "100", "method": "cash"}, format="json")
    assert ok.status_code == 201
