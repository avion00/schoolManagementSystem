"""Fee operations: bulk billing, overdue marking, the student ledger and the
per-student fee roster."""
from decimal import Decimal

from django.db import transaction
from django.db.models import DecimalField, Exists, OuterRef, Subquery, Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone

from apps.core.sequences import next_document_number

from .models import FeeDiscount, Invoice, InvoiceItem, Payment

ZERO = Decimal("0")
OPEN = (Invoice.Status.UNPAID, Invoice.Status.PARTIAL, Invoice.Status.OVERDUE)


@transaction.atomic
def generate_invoices(*, organization_id, actor, students, structures, issue_date, due_date, billing_period):
    """One invoice per student for `billing_period`, with an item per applicable
    fee structure (structures without a class apply to every class).

    Idempotent: students already billed for the period (by a non-cancelled
    invoice) are skipped, so a run can safely be repeated.
    """
    already = set(
        Invoice.objects.filter(
            organization_id=organization_id, billing_period=billing_period, student__in=students,
        ).exclude(status=Invoice.Status.CANCELLED).values_list("student_id", flat=True)
    )
    created, skipped, empty = [], [], []
    for student in students:
        if student.id in already:
            skipped.append(student)
            continue
        lines = [
            s for s in structures
            if s.class_level_id in (None, student.class_level_id)
            and s.academic_year_id == student.academic_year_id
        ]
        if not lines:
            empty.append(student)
            continue
        invoice = Invoice.objects.create(
            organization_id=organization_id, school_id=student.school_id, student=student,
            number=next_document_number(organization_id, "INV"), billing_period=billing_period,
            issue_date=issue_date, due_date=due_date, created_by=actor, updated_by=actor,
        )
        InvoiceItem.objects.bulk_create([
            InvoiceItem(
                organization_id=organization_id, invoice=invoice, category=s.category,
                description=s.name, quantity=1, unit_price=s.amount, amount=s.amount,
                created_by=actor, updated_by=actor,
            )
            for s in lines
        ])
        invoice.total_amount = sum((s.amount for s in lines), ZERO)
        invoice.save(update_fields=["total_amount"])
        invoice.recalculate()
        created.append(invoice)
    return {"created": created, "skipped": skipped, "no_applicable_fees": empty}


def mark_overdue(organization_id=None):
    """Flip open invoices whose due date has passed to OVERDUE. Returns count."""
    qs = Invoice.objects.filter(
        status__in=(Invoice.Status.UNPAID, Invoice.Status.PARTIAL),
        due_date__lt=timezone.localdate(),
    )
    if organization_id:
        qs = qs.filter(organization_id=organization_id)
    return qs.update(status=Invoice.Status.OVERDUE, updated_at=timezone.now())


def ledger(student):
    """Chronological debits/credits with a running balance (what the student owes)."""
    entries = []
    for inv in Invoice.objects.filter(student=student).exclude(status=Invoice.Status.CANCELLED):
        entries.append((inv.issue_date, inv.created_at, "invoice", inv.number, inv.total_amount, ZERO,
                        f"Invoice {inv.billing_period}".strip()))
    for d in FeeDiscount.objects.filter(
        invoice__student=student, status=FeeDiscount.Status.APPROVED
    ).select_related("invoice"):
        when = timezone.localtime(d.decided_at).date() if d.decided_at else d.created_at.date()
        entries.append((when, d.created_at, "discount", d.invoice.number, ZERO, d.amount, d.reason))
    for p in Payment.objects.filter(invoice__student=student).select_related("invoice"):
        when = timezone.localtime(p.paid_at).date()
        entries.append((when, p.created_at, "payment", p.receipt_number, ZERO, p.amount,
                        f"{p.get_method_display()} for {p.invoice.number}"))
        if p.is_reversed:
            entries.append((timezone.localtime(p.updated_at).date(), p.updated_at, "reversal",
                            p.receipt_number, p.amount, ZERO, p.reversed_reason or "Payment reversed"))
    entries.sort(key=lambda e: (e[0], e[1]))
    balance, rows = ZERO, []
    for date, _, kind, ref, debit, credit, note in entries:
        balance += debit - credit
        rows.append({
            "date": str(date), "type": kind, "reference": ref, "description": note,
            "debit": float(debit), "credit": float(credit), "balance": float(balance),
        })
    return rows


def _sum(qs, field):
    return Coalesce(
        Subquery(
            qs.filter(student=OuterRef("pk")).order_by().values("student")
            .annotate(t=Sum(field)).values("t"),
            output_field=DecimalField(max_digits=14, decimal_places=2),
        ),
        Value(ZERO),
    )


def annotate_student_fees(students):
    """Add billed / discount / paid / due / next_due_date to a Student queryset."""
    invoices = Invoice.objects.exclude(status=Invoice.Status.CANCELLED)
    next_due = (
        Invoice.objects.filter(student=OuterRef("pk"), status__in=OPEN, due_date__isnull=False)
        .order_by("due_date").values("due_date")[:1]
    )
    overdue = Invoice.objects.filter(student=OuterRef("pk"), status=Invoice.Status.OVERDUE)
    return students.annotate(
        billed=_sum(invoices, "total_amount"),
        discount=_sum(invoices, "discount_amount"),
        paid=_sum(invoices, "paid_amount"),
        next_due_date=Subquery(next_due),
        has_overdue=Exists(overdue),
    )


def fee_status(row):
    due = row.billed - row.discount - row.paid
    if row.billed == 0:
        return "no_fees"
    if due <= 0:
        return "waived" if row.paid == 0 and row.discount > 0 else "paid"
    if row.has_overdue:
        return "overdue"
    return "partial" if row.paid > 0 else "due"
