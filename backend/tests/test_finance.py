"""Vendors, expenses (maker-checker), salary structures and payroll."""
import datetime
from decimal import Decimal

import pytest

from apps.finance.models import Expense, PayrollRun, SalaryStructure
from apps.teachers.models import StaffAttendance

pytestmark = pytest.mark.django_db
F = "/api/v1/finance"


@pytest.fixture
def accountant(api, tenant):
    return api(tenant.users["Accountant"])


@pytest.fixture
def principal(api, tenant):
    return api(tenant.users["Principal"])


def expense(client, **extra):
    return client.post(f"{F}/expenses/", {"category": "stationery", "description": "Chalk", "amount": "500",
                                         "expense_date": "2026-10-20", **extra}, format="json")


def test_expense_lifecycle_and_maker_checker(accountant, principal):
    vendor = accountant.post(f"{F}/vendors/", {"name": "Kathmandu Stationers", "category": "stationery"}, format="json").json()
    assert vendor["code"].startswith("VND-")
    e = expense(accountant, vendor=vendor["id"]).json()
    assert e["code"].startswith("EXP-") and e["status"] == "pending"
    assert accountant.post(f"{F}/expenses/{e['id']}/pay/").status_code == 400  # not approved
    assert accountant.post(f"{F}/expenses/{e['id']}/approve/").status_code == 403  # lacks approve perm
    assert principal.post(f"{F}/expenses/{e['id']}/approve/").json()["status"] == "approved"
    assert accountant.patch(f"{F}/expenses/{e['id']}/", {"amount": "9"}, format="json").status_code == 400
    v = accountant.get(f"{F}/vendors/{vendor['id']}/").json()
    assert v["outstanding"] == "500.00" and v["total_purchases"] == "500.00"
    assert accountant.post(f"{F}/expenses/{e['id']}/pay/", {"payment_method": "bank"}, format="json").json()["status"] == "paid"
    assert accountant.delete(f"{F}/vendors/{vendor['id']}/").status_code == 400


def test_cannot_approve_own_expense(principal):
    e = expense(principal).json()
    assert principal.post(f"{F}/expenses/{e['id']}/approve/").status_code == 400


def test_expense_validation(accountant):
    assert expense(accountant, amount="0").status_code == 400


def test_teacher_has_no_finance_access(api, tenant):
    assert api(tenant.users["Teacher"]).get(f"{F}/expenses/").status_code == 403
    assert api(tenant.users["Teacher"]).get(f"{F}/salary-structures/").status_code == 403


@pytest.fixture
def salary(tenant):
    return SalaryStructure.objects.create(
        organization=tenant.org, teacher=tenant.teacher, basic=Decimal("30000"),
        house_allowance=Decimal("5000"), provident_fund_pct=Decimal("10"), tax_pct=Decimal("1"),
    )


def test_payroll_generate_with_absence_deduction(accountant, tenant, salary):
    StaffAttendance.objects.create(organization=tenant.org, teacher=tenant.teacher,
                                   date=datetime.date(2026, 9, 3), status="absent")
    StaffAttendance.objects.create(organization=tenant.org, teacher=tenant.teacher,
                                   date=datetime.date(2026, 9, 4), status="half_day")
    run = accountant.post(f"{F}/payroll-runs/", {"month": "2026-09", "working_days": 25}, format="json").json()
    body = accountant.get(f"{F}/payroll-runs/{run['id']}/payslips/").json()
    slip = body["payslips"][0]
    # 1.5 absent days × (30000 / 25) = 1800; PF 3000; tax 300; gross 35000
    assert slip["absent_days"] == "1.5" and slip["attendance_deduction"] == "1800.00"
    assert slip["net"] == "29900.00" and body["totals"]["net"] == 29900.0
    assert accountant.post(f"{F}/payroll-runs/", {"month": "2026-09"}, format="json").status_code == 400  # one per month


def test_payroll_adjust_approve_pay(accountant, principal, tenant, salary, api):
    run = accountant.post(f"{F}/payroll-runs/", {"month": "2026-10"}, format="json").json()
    slip = accountant.get(f"{F}/payroll-runs/{run['id']}/payslips/").json()["payslips"][0]
    adj = accountant.patch(f"{F}/payroll-runs/{run['id']}/payslips/{slip['id']}/", {"bonus": "2000", "note": "Dashain"}, format="json").json()
    assert Decimal(adj["net"]) == Decimal(slip["net"]) + 2000
    # regeneration keeps manual bonus
    regenerated = accountant.post(f"{F}/payroll-runs/{run['id']}/generate/").json()["payslips"][0]
    assert regenerated["bonus"] == "2000.00"
    assert accountant.post(f"{F}/payroll-runs/{run['id']}/approve/").status_code == 403  # accountant lacks payroll.approve
    assert principal.post(f"{F}/payroll-runs/{run['id']}/approve/").json()["status"] == "approved"
    assert accountant.patch(f"{F}/payroll-runs/{run['id']}/payslips/{slip['id']}/", {"bonus": "1"}, format="json").status_code == 400
    assert principal.post(f"{F}/payroll-runs/{run['id']}/pay/").json()["status"] == "paid"
    salary_exp = Expense.objects.get(payroll_run_id=run["id"])
    assert salary_exp.status == "paid" and salary_exp.amount == Decimal(regenerated["net"])
    mine = api(tenant.users["Teacher"]).get("/api/v1/me/teacher/payslips/").json()
    assert mine[0]["month"] == "2026-10" and mine[0]["run_status"] == "paid"


def test_preparer_cannot_approve_own_payroll(principal, salary):
    run = principal.post(f"{F}/payroll-runs/", {"month": "2026-08"}, format="json").json()
    assert principal.post(f"{F}/payroll-runs/{run['id']}/approve/").status_code == 400


def test_draft_payslips_hidden_from_teacher(accountant, api, tenant, salary):
    accountant.post(f"{F}/payroll-runs/", {"month": "2026-07"}, format="json")
    assert api(tenant.users["Teacher"]).get("/api/v1/me/teacher/payslips/").json() == []


def test_finance_summary(accountant, principal, tenant):
    e = expense(accountant, expense_date=str(datetime.date.today())).json()
    principal.post(f"{F}/expenses/{e['id']}/approve/")
    accountant.post(f"{F}/expenses/{e['id']}/pay/")
    accountant.post("/api/v1/fees/payments/", {"invoice": str(tenant.invoice.id), "amount": "800", "method": "cash"}, format="json")
    body = accountant.get(f"{F}/summary/", {"months": 2}).json()
    assert body["trend"][-1] == {"month": datetime.date.today().strftime("%Y-%m"), "income": 800.0,
                                 "expenses": 500.0, "net": 300.0}
    assert body["this_month"]["by_category"] == {"stationery": 500.0}


def test_payroll_run_scoped_to_tenant(api, other_tenant, accountant, salary):
    run = accountant.post(f"{F}/payroll-runs/", {"month": "2026-06"}, format="json").json()
    assert api(other_tenant.users["Principal"]).get(f"{F}/payroll-runs/{run['id']}/payslips/").status_code == 404
    assert PayrollRun.objects.count() == 1
