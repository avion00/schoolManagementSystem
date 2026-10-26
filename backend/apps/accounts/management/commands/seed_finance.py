"""Finance set-up for the demo school: fee categories and structures, vendors,
expenses in every state, salary structures and a draft payroll run.

Run after `seed_rich`. Idempotent: only fills what is missing.

    python manage.py seed_finance
"""
import random
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.academics.models import AcademicYear
from apps.accounts.models import Organization, User
from apps.core.sequences import next_document_number
from apps.fees.models import FeeCategory, FeeStructure
from apps.finance import services as payroll
from apps.finance.models import Expense, PayrollRun, SalaryStructure, Vendor
from apps.teachers.models import Teacher

CATEGORIES = [("Monthly Tuition Fee", "TUITION", "monthly", "3500"), ("Exam Fee", "EXAM", "term", "800"),
              ("Library Fee", "LIBRARY", "annual", "1200"), ("Admission Fee", "ADMISSION", "one_time", "5000")]
VENDORS = [  # name, category, contact, phone
    ("Kathmandu Stationers", "stationery", "Ram Shrestha", "9801000001"),
    ("Everest Book House", "books", "Sita Karki", "9801000002"),
    ("Himal IT Solutions", "it", "Bikash Rai", "9801000003"),
    ("City Maintenance Co.", "maintenance", "Hari Thapa", "9801000004"),
]
EXPENSES = [  # category, vendor index or None, description, amount, days ago, status
    ("stationery", 0, "Exam answer sheets and pens", "18500", 25, "paid"),
    ("books", 1, "Library restock: reference books", "42000", 18, "approved"),
    ("internet", 2, "Fibre internet (monthly)", "6500", 12, "paid"),
    ("maintenance", 3, "Classroom fan repairs", "9800", 6, "pending"),
    ("electricity", None, "Electricity bill", "15400", 4, "pending"),
    ("events", None, "Sports day refreshments", "12000", 2, "rejected"),
]


class Command(BaseCommand):
    help = "Fee structures, vendors, expenses, salary structures and a draft payroll run for the demo school."

    @transaction.atomic
    def handle(self, *args, **options):
        random.seed(7)
        org = Organization.objects.filter(slug="greenwood").first()
        if not org:
            self.stderr.write("Run `python manage.py seed_demo` first.")
            return
        year = AcademicYear.objects.filter(organization=org, is_current=True).first() \
            or AcademicYear.objects.filter(organization=org).first()
        accountant = User.objects.filter(email="accountant@demo.school").first()
        principal = User.objects.filter(email="principal@demo.school").first()

        for name, code, freq, amount in CATEGORIES:
            cat = FeeCategory.objects.filter(organization=org, code=code).first() \
                or FeeCategory.objects.create(organization=org, name=name, code=code)
            if year and not FeeStructure.objects.filter(organization=org, category=cat, academic_year=year).exists():
                FeeStructure.objects.create(organization=org, name=name, category=cat, academic_year=year,
                                            amount=Decimal(amount), frequency=freq)

        vendors = []
        for name, cat, contact, phone in VENDORS:
            v = Vendor.objects.filter(organization=org, name=name).first() or Vendor.objects.create(
                organization=org, code=next_document_number(org.id, "VEN"), name=name, category=cat,
                contact_person=contact, phone=phone)
            vendors.append(v)

        today = timezone.localdate()
        now = timezone.now()
        if not Expense.objects.filter(organization=org, payroll_run__isnull=True).exists():
            for cat, vi, desc, amount, ago, status in EXPENSES:
                decided = status != "pending"
                Expense.objects.create(
                    organization=org, code=next_document_number(org.id, "EXP"), category=cat,
                    vendor=vendors[vi] if vi is not None else None, description=desc, amount=Decimal(amount),
                    expense_date=today - timedelta(days=ago), payment_method="bank" if status == "paid" else "",
                    status=status, created_by=accountant, decided_by=principal if decided else None,
                    decided_at=now if decided else None, paid_at=now if status == "paid" else None,
                )

        for t in Teacher.objects.filter(organization=org):
            if not SalaryStructure.objects.filter(teacher=t).exists():
                basic = Decimal(random.choice([32000, 36000, 40000, 45000]))
                SalaryStructure.objects.create(
                    organization=org, teacher=t, basic=basic, house_allowance=Decimal("4000"),
                    transport_allowance=Decimal("2000"), provident_fund_pct=Decimal("10"), tax_pct=Decimal("1"),
                    payment_method="bank",
                )

        month = f"{today.year}-{today.month:02d}"
        if not PayrollRun.objects.filter(organization=org, month=month).exists():
            run = PayrollRun.objects.create(
                organization=org, month=month, created_by=accountant,
                working_days=payroll.default_working_days(today.year, today.month))
            payroll.generate(run)

        self.stdout.write(self.style.SUCCESS(
            f"{FeeStructure.objects.filter(organization=org).count()} fee structures, {len(vendors)} vendors, "
            f"{Expense.objects.filter(organization=org).count()} expenses, "
            f"{SalaryStructure.objects.filter(organization=org).count()} salary structures, "
            f"payroll run {month}."
        ))
