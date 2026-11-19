"""Payroll calculation."""
import calendar
import datetime
from decimal import ROUND_HALF_UP, Decimal

from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.teachers.models import StaffAttendance, Teacher

from .models import PayrollRun, Payslip, SalaryStructure

CENT = Decimal("0.01")
ABSENCE_WEIGHT = {"absent": Decimal("1"), "half_day": Decimal("0.5")}


def _money(x):
    return Decimal(x).quantize(CENT, rounding=ROUND_HALF_UP)


def default_working_days(year, month, weekly_off=(5,)):
    """Days in the month minus the weekly off day(s) (default Saturday, Mon=0)."""
    days = calendar.monthrange(year, month)[1]
    return sum(1 for d in range(1, days + 1) if datetime.date(year, month, d).weekday() not in weekly_off)


def payslip_for(run, structure, year, month):
    marks = StaffAttendance.objects.filter(
        teacher=structure.teacher, date__year=year, date__month=month
    ).values_list("status", flat=True)
    absent = sum((ABSENCE_WEIGHT.get(s, Decimal(0)) for s in marks), Decimal(0))
    daily = structure.basic / run.working_days if run.working_days else Decimal(0)
    slip = Payslip(
        organization_id=run.organization_id, run=run, teacher=structure.teacher,
        basic=structure.basic, allowances=structure.allowances, absent_days=absent,
        attendance_deduction=_money(daily * absent),
        provident_fund=_money(structure.basic * structure.provident_fund_pct / 100),
        tax=_money(structure.basic * structure.tax_pct / 100),
        other_deduction=structure.other_deduction, payment_method=structure.payment_method,
    )
    slip.recompute()
    return slip


@transaction.atomic
def generate(run):
    """(Re)build every payslip in a draft run from current salary structures
    and the month's staff attendance. Manual bonuses/notes are kept."""
    if run.status != PayrollRun.Status.DRAFT:
        raise ValidationError("Only draft payroll runs can be regenerated.")
    year, month = map(int, run.month.split("-"))
    kept = {p.teacher_id: (p.bonus, p.note) for p in run.payslips.all()}
    run.payslips.all().delete()
    structures = SalaryStructure.objects.filter(
        organization_id=run.organization_id, teacher__is_active=True,
        teacher__status__in=(Teacher.Status.ACTIVE, Teacher.Status.ON_LEAVE),
    ).select_related("teacher")
    slips = []
    for st in structures:
        slip = payslip_for(run, st, year, month)
        slip.bonus, slip.note = kept.get(st.teacher_id, (Decimal(0), ""))
        slip.recompute()
        slips.append(slip)
    Payslip.objects.bulk_create(slips)
    return slips


def totals(run):
    slips = list(run.payslips.all())
    return {
        "staff": len(slips),
        "gross": float(sum(p.basic + p.allowances + p.bonus for p in slips)),
        "deductions": float(sum(p.attendance_deduction + p.provident_fund + p.tax + p.other_deduction
                                for p in slips)),
        "net": float(sum(p.net for p in slips)),
    }
