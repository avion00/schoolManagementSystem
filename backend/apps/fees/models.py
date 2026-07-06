"""Fees & accounting (school.md §7.11).

Accounting rule (§7.11): financial records are never hard-deleted. Invoices are
cancelled; payments are reversed. Invoice paid_amount / status are recomputed
from non-reversed payments.
"""
from decimal import Decimal

from django.db import models
from django.db.models import Sum

from apps.core.models import TenantBaseModel


class FeeCategory(TenantBaseModel):
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=32)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "code"], name="uniq_fee_category_code_per_org"
            )
        ]

    def __str__(self):
        return self.name


class FeeStructure(TenantBaseModel):
    name = models.CharField(max_length=150)
    category = models.ForeignKey(
        FeeCategory, on_delete=models.PROTECT, related_name="structures"
    )
    academic_year = models.ForeignKey(
        "academics.AcademicYear", on_delete=models.PROTECT, related_name="fee_structures"
    )
    class_level = models.ForeignKey(
        "academics.ClassLevel", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="fee_structures",
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.amount})"


class Invoice(TenantBaseModel):
    class Status(models.TextChoices):
        UNPAID = "unpaid", "Unpaid"
        PARTIAL = "partial", "Partially Paid"
        PAID = "paid", "Paid"
        OVERDUE = "overdue", "Overdue"
        CANCELLED = "cancelled", "Cancelled"
        REFUNDED = "refunded", "Refunded"

    student = models.ForeignKey(
        "students.Student", on_delete=models.PROTECT, related_name="invoices"
    )
    number = models.CharField(max_length=40)
    issue_date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.UNPAID, db_index=True
    )
    cancelled_reason = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-issue_date"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "number"], name="uniq_invoice_number_per_org"
            )
        ]

    def __str__(self):
        return self.number

    @property
    def balance(self):
        return self.total_amount - self.paid_amount

    def recalculate(self, commit=True):
        """Recompute paid_amount + status from non-reversed payments."""
        if self.status == self.Status.CANCELLED:
            return
        paid = self.payments.filter(is_reversed=False, is_active=True).aggregate(
            total=Sum("amount")
        )["total"] or Decimal("0")
        self.paid_amount = paid
        if paid <= 0:
            self.status = self.Status.UNPAID
        elif paid < self.total_amount:
            self.status = self.Status.PARTIAL
        else:
            self.status = self.Status.PAID
        if commit:
            self.save(update_fields=["paid_amount", "status", "updated_at"])


class InvoiceItem(TenantBaseModel):
    invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE, related_name="items"
    )
    category = models.ForeignKey(
        FeeCategory, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="invoice_items",
    )
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.description}: {self.amount}"


class Payment(TenantBaseModel):
    class Method(models.TextChoices):
        CASH = "cash", "Cash"
        BANK = "bank", "Bank"
        ONLINE = "online", "Online"
        CHEQUE = "cheque", "Cheque"

    invoice = models.ForeignKey(
        Invoice, on_delete=models.PROTECT, related_name="payments"
    )
    receipt_number = models.CharField(max_length=40)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=12, choices=Method.choices, default=Method.CASH)
    paid_at = models.DateTimeField()
    transaction_id = models.CharField(max_length=120, blank=True)
    remarks = models.CharField(max_length=255, blank=True)
    is_reversed = models.BooleanField(default=False)
    reversed_reason = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-paid_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "receipt_number"],
                name="uniq_receipt_number_per_org",
            )
        ]

    def __str__(self):
        return f"{self.receipt_number}: {self.amount}"
