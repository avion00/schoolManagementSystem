"""Finance operations (school.md §7.11–7.12): vendors, expenses with
approval, salary structures and monthly payroll."""
from decimal import Decimal

from django.db import models

from apps.core.models import TenantBaseModel


class Vendor(TenantBaseModel):
    class Category(models.TextChoices):
        STATIONERY = "stationery", "Stationery Supplier"
        BOOKS = "books", "Book Supplier"
        UNIFORM = "uniform", "Uniform Supplier"
        FOOD = "food", "Food/Canteen"
        TRANSPORT = "transport", "Transport"
        MAINTENANCE = "maintenance", "Maintenance"
        IT = "it", "IT Services"
        FURNITURE = "furniture", "Furniture"
        OTHER = "other", "Other"

    code = models.CharField(max_length=40, blank=True, db_index=True)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=12, choices=Category.choices, default=Category.OTHER)
    contact_person = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    tax_id = models.CharField(max_length=40, blank=True)  # PAN / VAT number
    status = models.CharField(max_length=10, default="active",
                              choices=[("active", "Active"), ("inactive", "Inactive")])

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Expense(TenantBaseModel):
    class Category(models.TextChoices):
        TEACHER_SALARY = "teacher_salary", "Teacher Salary"
        STAFF_SALARY = "staff_salary", "Staff Salary"
        STATIONERY = "stationery", "Stationery"
        BOOKS = "books", "Books"
        FURNITURE = "furniture", "Furniture"
        MAINTENANCE = "maintenance", "Maintenance"
        ELECTRICITY = "electricity", "Electricity"
        INTERNET = "internet", "Internet"
        RENT = "rent", "Rent"
        FUEL = "fuel", "Transport Fuel"
        HOSTEL = "hostel", "Hostel"
        LIBRARY = "library", "Library"
        LAB = "lab", "Lab Materials"
        EVENTS = "events", "Events"
        MISC = "misc", "Miscellaneous"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        PAID = "paid", "Paid"

    code = models.CharField(max_length=40, blank=True, db_index=True)
    category = models.CharField(max_length=16, choices=Category.choices)
    vendor = models.ForeignKey(Vendor, null=True, blank=True, on_delete=models.PROTECT, related_name="expenses")
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    expense_date = models.DateField()
    payment_method = models.CharField(max_length=16, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING, db_index=True)
    decided_by = models.ForeignKey("accounts.User", null=True, blank=True, on_delete=models.SET_NULL,
                                   related_name="+")
    decided_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    receipt = models.ForeignKey("files.StoredFile", null=True, blank=True, on_delete=models.PROTECT,
                                related_name="expenses")
    remarks = models.CharField(max_length=255, blank=True)
    payroll_run = models.ForeignKey("PayrollRun", null=True, blank=True, on_delete=models.PROTECT,
                                    related_name="expenses")

    class Meta:
        ordering = ["-expense_date", "-created_at"]

    def __str__(self):
        return f"{self.code} {self.amount}"


class SalaryStructure(TenantBaseModel):
    """A staff member's pay. Deduction percentages apply to basic salary."""

    teacher = models.OneToOneField("teachers.Teacher", on_delete=models.CASCADE, related_name="salary")
    basic = models.DecimalField(max_digits=12, decimal_places=2)
    house_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    transport_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    provident_fund_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    other_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=16, default="bank")
    bank_name = models.CharField(max_length=120, blank=True)
    account_number = models.CharField(max_length=40, blank=True)

    @property
    def allowances(self):
        return self.house_allowance + self.transport_allowance + self.other_allowance


class PayrollRun(TenantBaseModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        APPROVED = "approved", "Approved"
        PAID = "paid", "Paid"

    month = models.CharField(max_length=7)  # "YYYY-MM"
    working_days = models.PositiveSmallIntegerField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    approved_by = models.ForeignKey("accounts.User", null=True, blank=True, on_delete=models.SET_NULL,
                                    related_name="+")
    approved_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-month"]
        constraints = [
            models.UniqueConstraint(fields=["organization", "month"], condition=models.Q(is_active=True),
                                    name="uniq_active_payroll_month")
        ]

    def __str__(self):
        return self.month


class Payslip(TenantBaseModel):
    run = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name="payslips")
    teacher = models.ForeignKey("teachers.Teacher", on_delete=models.PROTECT, related_name="payslips")
    basic = models.DecimalField(max_digits=12, decimal_places=2)
    allowances = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    bonus = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    absent_days = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    attendance_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    provident_fund = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=16, default="bank")
    note = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["teacher__full_name"]
        constraints = [
            models.UniqueConstraint(fields=["run", "teacher"], name="uniq_payslip_per_run")
        ]

    def recompute(self):
        gross = self.basic + self.allowances + self.bonus
        deductions = self.attendance_deduction + self.provident_fund + self.tax + self.other_deduction
        self.net = max(gross - deductions, Decimal("0"))
