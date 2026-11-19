"""Fee accounting invariants."""
from decimal import Decimal

import pytest

from apps.fees.models import Invoice, Payment

pytestmark = pytest.mark.django_db


@pytest.fixture
def accountant(api, tenant):
    return api(tenant.users["Accountant"])


def pay(client, invoice, amount, **extra):
    return client.post("/api/v1/fees/payments/", {
        "invoice": str(invoice.id), "amount": amount, "method": "cash", **extra,
    }, format="json")


# --- payments ---------------------------------------------------------------

def test_payment_updates_invoice_and_gets_server_receipt_number(accountant, tenant):
    res = pay(accountant, tenant.invoice, "400.00")
    assert res.status_code == 201, res.json()
    assert res.json()["receipt_number"].startswith("RCPT-")
    assert res.json()["paid_at"]
    tenant.invoice.refresh_from_db()
    assert tenant.invoice.paid_amount == Decimal("400.00")
    assert tenant.invoice.status == Invoice.Status.PARTIAL


def test_receipt_numbers_are_sequential(accountant, tenant):
    a = pay(accountant, tenant.invoice, "100.00").json()["receipt_number"]
    b = pay(accountant, tenant.invoice, "100.00").json()["receipt_number"]
    prefix_a, n_a = a.rsplit("-", 1)
    prefix_b, n_b = b.rsplit("-", 1)
    assert prefix_a == prefix_b and int(n_b) == int(n_a) + 1


def test_numbering_is_per_tenant(api, tenant, other_tenant):
    a = pay(api(tenant.users["Accountant"]), tenant.invoice, "1.00").json()["receipt_number"]
    b = pay(api(other_tenant.users["Accountant"]), other_tenant.invoice, "1.00").json()["receipt_number"]
    assert a == b  # independent counters


@pytest.mark.parametrize("amount", ["0", "-500.00"])
def test_non_positive_payment_rejected(accountant, tenant, amount):
    res = pay(accountant, tenant.invoice, amount)
    assert res.status_code == 400
    assert not Payment.objects.exists()


def test_overpayment_rejected(accountant, tenant):
    assert pay(accountant, tenant.invoice, "1000.01").status_code == 400
    assert pay(accountant, tenant.invoice, "1000.00").status_code == 201
    tenant.invoice.refresh_from_db()
    assert tenant.invoice.status == Invoice.Status.PAID
    assert pay(accountant, tenant.invoice, "1.00").status_code == 400


def test_payments_are_immutable(accountant, tenant):
    pid = pay(accountant, tenant.invoice, "100.00").json()["id"]
    assert accountant.patch(f"/api/v1/fees/payments/{pid}/", {"amount": "900.00"}, format="json").status_code == 405
    assert accountant.delete(f"/api/v1/fees/payments/{pid}/").status_code == 405


def test_reverse_payment_recomputes_invoice(accountant, tenant):
    pid = pay(accountant, tenant.invoice, "1000.00").json()["id"]
    res = accountant.post(f"/api/v1/fees/payments/{pid}/reverse/", {"reason": "bounced"}, format="json")
    assert res.status_code == 200
    tenant.invoice.refresh_from_db()
    assert tenant.invoice.paid_amount == 0
    assert tenant.invoice.status == Invoice.Status.UNPAID


# --- invoices ---------------------------------------------------------------

def test_invoice_number_and_total_are_server_controlled(accountant, tenant):
    res = accountant.post("/api/v1/fees/invoices/", {
        "student": str(tenant.student.id), "issue_date": "2026-10-01",
        "number": "HACK-1", "total_amount": "5.00",
    }, format="json")
    assert res.status_code == 201, res.json()
    body = res.json()
    assert body["number"].startswith("INV-") and body["number"] != "HACK-1"
    assert Decimal(body["total_amount"]) == 0


def test_items_drive_invoice_total(accountant, tenant):
    inv = tenant.invoice
    item = accountant.post("/api/v1/fees/invoice-items/", {
        "invoice": str(inv.id), "description": "Bus", "amount": "250.00",
    }, format="json")
    assert item.status_code == 201, item.json()
    inv.refresh_from_db()
    assert inv.total_amount == Decimal("1250.00")

    res = accountant.patch(f"/api/v1/fees/invoice-items/{item.json()['id']}/", {"amount": "50.00"}, format="json")
    assert res.status_code == 200
    inv.refresh_from_db()
    assert inv.total_amount == Decimal("1050.00")

    accountant.delete(f"/api/v1/fees/invoice-items/{item.json()['id']}/")
    inv.refresh_from_db()
    assert inv.total_amount == Decimal("1000.00")


def test_item_requires_invoice(accountant):
    res = accountant.post("/api/v1/fees/invoice-items/", {"description": "x", "amount": "1"}, format="json")
    assert res.status_code == 400


def test_item_change_cannot_drop_total_below_paid(accountant, tenant):
    pay(accountant, tenant.invoice, "800.00")
    item = tenant.invoice.items.get()
    res = accountant.patch(f"/api/v1/fees/invoice-items/{item.id}/", {"amount": "500.00"}, format="json")
    assert res.status_code == 400
    tenant.invoice.refresh_from_db()
    assert tenant.invoice.total_amount == Decimal("1000.00")


def test_cannot_cancel_invoice_with_payments(accountant, tenant):
    pay(accountant, tenant.invoice, "100.00")
    res = accountant.post(f"/api/v1/fees/invoices/{tenant.invoice.id}/cancel/", {"reason": "x"}, format="json")
    assert res.status_code == 400


def test_cancelled_invoice_is_frozen(accountant, tenant):
    url = f"/api/v1/fees/invoices/{tenant.invoice.id}/cancel/"
    assert accountant.post(url, {"reason": "dup"}, format="json").status_code == 200
    assert accountant.post(url, {"reason": "again"}, format="json").status_code == 400
    assert pay(accountant, tenant.invoice, "1.00").status_code == 400
    item = accountant.post("/api/v1/fees/invoice-items/", {
        "invoice": str(tenant.invoice.id), "description": "x", "amount": "1.00",
    }, format="json")
    assert item.status_code == 400
