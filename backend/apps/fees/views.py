"""Fee endpoints.

Every write that touches money runs in a transaction with the invoice row locked,
so concurrent payments / item edits can't double-pay or desync totals.
"""
import datetime
import uuid

from django.db import transaction
from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.exceptions import MethodNotAllowed, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.services import record_audit
from apps.core.pagination import DefaultPagination
from apps.core.permissions import HasPermission
from apps.core.sequences import next_document_number
from apps.core.viewsets import TenantModelViewSet
from apps.students.models import Student

from . import services
from .models import FeeCategory, FeeDiscount, FeeStructure, Invoice, InvoiceItem, Payment
from .serializers import (
    FeeCategorySerializer,
    FeeDiscountSerializer,
    FeeStructureSerializer,
    GenerateInvoicesSerializer,
    InvoiceItemSerializer,
    InvoiceSerializer,
    PaymentSerializer,
)

_MANAGE = {
    "list": "fee.view",
    "retrieve": "fee.view",
    "create": "fee.create",
    "update": "fee.create",
    "partial_update": "fee.create",
    "destroy": "fee.create",
}


def _lock_invoice(invoice_id):
    """Re-read the invoice under a row lock (SELECT ... FOR UPDATE)."""
    return Invoice.objects.select_for_update().get(pk=invoice_id)


def _ensure_open(invoice):
    if invoice.status == Invoice.Status.CANCELLED:
        raise ValidationError("This invoice is cancelled and can no longer be changed.")


class FeeCategoryViewSet(TenantModelViewSet):
    queryset = FeeCategory.objects.all()
    serializer_class = FeeCategorySerializer
    audit_label = "fee_category"
    permission_required = _MANAGE
    search_fields = ["name", "code"]


class FeeStructureViewSet(TenantModelViewSet):
    queryset = FeeStructure.objects.select_related("category", "academic_year", "class_level").all()
    serializer_class = FeeStructureSerializer
    audit_label = "fee_structure"
    permission_required = _MANAGE
    filterset_fields = ["category", "academic_year", "class_level"]


class InvoiceViewSet(TenantModelViewSet):
    queryset = Invoice.objects.select_related(
        "student", "student__class_level", "student__section"
    ).prefetch_related("items", "items__category")
    serializer_class = InvoiceSerializer
    audit_label = "invoice"
    permission_required = {**_MANAGE, "cancel": "fee.create", "generate": "fee.create"}
    filterset_fields = {
        "status": ["exact", "in"], "student": ["exact"], "billing_period": ["exact"],
        "student__class_level": ["exact"], "student__section": ["exact"],
        "issue_date": ["gte", "lte"], "due_date": ["gte", "lte"],
    }
    search_fields = ["number", "student__first_name", "student__last_name", "student__admission_number"]
    ordering_fields = ["issue_date", "due_date", "total_amount", "created_at"]

    @action(detail=False, methods=["post"])
    def generate(self, request):
        """Bill a class (or chosen students) for a period from fee structures."""
        org_id = self._require_org()
        serializer = GenerateInvoicesSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        year = data["academic_year"]
        structures = data.get("fee_structures") or list(
            FeeStructure.objects.filter(organization_id=org_id, academic_year=year)
        )
        if any(s.academic_year_id != year.id for s in structures):
            raise ValidationError({"fee_structures": "All structures must belong to the academic year."})
        if data.get("students"):
            students = data["students"]
        else:
            qs = Student.objects.filter(
                organization_id=org_id, academic_year=year, status=Student.Status.ACTIVE
            )
            if data.get("class_level"):
                qs = qs.filter(class_level=data["class_level"])
            students = list(qs)
        result = services.generate_invoices(
            organization_id=org_id, actor=request.user, students=students, structures=structures,
            issue_date=data["issue_date"], due_date=data.get("due_date"),
            billing_period=data["billing_period"],
        )
        record_audit(
            action="invoice.generate", actor=request.user, request=request,
            organization=request.user.organization,
            changes={"billing_period": data["billing_period"], "created": len(result["created"]),
                     "skipped": len(result["skipped"])},
        )
        return Response({
            "created": len(result["created"]),
            "skipped_already_billed": len(result["skipped"]),
            "no_applicable_fees": len(result["no_applicable_fees"]),
            "total_billed": float(sum(i.total_amount for i in result["created"])),
        }, status=201 if result["created"] else 200)

    @transaction.atomic
    def perform_create(self, serializer):
        number = next_document_number(self._require_org(), "INV")
        super().perform_create(serializer, number=number)

    def perform_update(self, serializer):
        _ensure_open(serializer.instance)
        super().perform_update(serializer)

    def perform_destroy(self, instance):
        # Accounting rule (school.md §7.11): never hard-delete; cancel instead.
        raise MethodNotAllowed(
            "DELETE", detail="Invoices cannot be deleted. Use the 'cancel' action."
        )

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def cancel(self, request, pk=None):
        invoice = _lock_invoice(self.get_object().pk)
        _ensure_open(invoice)
        invoice.recalculate(commit=False)
        if invoice.paid_amount > 0:
            raise ValidationError(
                "This invoice has payments. Reverse them before cancelling."
            )
        invoice.status = Invoice.Status.CANCELLED
        invoice.cancelled_reason = request.data.get("reason", "")
        invoice.updated_by = request.user
        invoice.save(update_fields=[
            "status", "paid_amount", "cancelled_reason", "updated_by", "updated_at",
        ])
        record_audit(
            action="invoice.cancel", actor=request.user, instance=invoice,
            request=request, organization=request.user.organization,
            changes={"reason": invoice.cancelled_reason},
        )
        return Response(InvoiceSerializer(invoice).data)


class InvoiceItemViewSet(TenantModelViewSet):
    queryset = InvoiceItem.objects.select_related("invoice", "category").all()
    serializer_class = InvoiceItemSerializer
    audit_label = "invoice_item"
    permission_required = _MANAGE
    filterset_fields = ["invoice"]

    def _resync(self, invoice_id):
        """Recompute the (locked) invoice total from its items, then its status.

        Raises if the change would leave the invoice owing less than was already
        paid; the surrounding transaction then rolls the item change back.
        """
        invoice = _lock_invoice(invoice_id)
        total = invoice.items.filter(is_active=True).aggregate(t=Sum("amount"))["t"] or 0
        invoice.total_amount = total
        invoice.recalculate(commit=False)
        if invoice.paid_amount + invoice.discount_amount > invoice.total_amount:
            raise ValidationError(
                {"amount": "Invoice total cannot drop below the amount already paid and discounted."}
            )
        invoice.save(update_fields=["total_amount", "discount_amount", "paid_amount", "status", "updated_at"])

    @transaction.atomic
    def perform_create(self, serializer):
        _ensure_open(_lock_invoice(serializer.validated_data["invoice"].pk))
        super().perform_create(serializer)
        self._resync(serializer.instance.invoice_id)

    @transaction.atomic
    def perform_update(self, serializer):
        _ensure_open(_lock_invoice(serializer.instance.invoice_id))
        super().perform_update(serializer)
        self._resync(serializer.instance.invoice_id)

    @transaction.atomic
    def perform_destroy(self, instance):
        _ensure_open(_lock_invoice(instance.invoice_id))
        super().perform_destroy(instance)
        self._resync(instance.invoice_id)


class PaymentViewSet(TenantModelViewSet):
    """Payments are immutable once recorded: correct mistakes with `reverse`."""

    queryset = Payment.objects.select_related("invoice").all()
    serializer_class = PaymentSerializer
    audit_label = "payment"
    http_method_names = ["get", "post", "head", "options"]
    permission_required = {
        "list": "fee.view",
        "retrieve": "fee.view",
        "create": "fee.collect",
        "reverse": "fee.refund",
    }
    filterset_fields = ["invoice", "method", "is_reversed"]
    search_fields = ["receipt_number", "transaction_id"]

    @transaction.atomic
    def perform_create(self, serializer):
        invoice = _lock_invoice(serializer.validated_data["invoice"].pk)
        if invoice.status == Invoice.Status.CANCELLED:
            raise ValidationError("Cannot record a payment on a cancelled invoice.")
        invoice.recalculate(commit=False)
        amount = serializer.validated_data["amount"]
        if amount > invoice.balance:
            raise ValidationError(
                {"amount": f"Amount exceeds the outstanding balance ({invoice.balance})."}
            )
        super().perform_create(
            serializer,
            receipt_number=next_document_number(invoice.organization_id, "RCPT"),
            paid_at=serializer.validated_data.get("paid_at") or timezone.now(),
        )
        invoice.recalculate()

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def reverse(self, request, pk=None):
        payment = Payment.objects.select_for_update().get(pk=self.get_object().pk)
        if payment.is_reversed:
            return Response({"detail": "Payment already reversed."}, status=400)
        invoice = _lock_invoice(payment.invoice_id)
        payment.is_reversed = True
        payment.reversed_reason = request.data.get("reason", "")
        payment.updated_by = request.user
        payment.save(update_fields=["is_reversed", "reversed_reason", "updated_by", "updated_at"])
        invoice.recalculate()
        record_audit(
            action="payment.reverse", actor=request.user, instance=payment,
            request=request, organization=request.user.organization,
            changes={"reason": payment.reversed_reason},
        )
        return Response(PaymentSerializer(payment).data)


class FeeDiscountViewSet(TenantModelViewSet):
    """Discount requests (maker) and decisions (checker)."""

    queryset = FeeDiscount.objects.select_related(
        "invoice", "invoice__student", "created_by", "decided_by"
    )
    serializer_class = FeeDiscountSerializer
    audit_label = "fee_discount"
    http_method_names = ["get", "post", "delete", "head", "options"]
    permission_required = {
        "list": "fee.view",
        "retrieve": "fee.view",
        "create": "fee.create",
        "destroy": "fee.create",
        "approve": "fee.discount.approve",
        "reject": "fee.discount.approve",
    }
    filterset_fields = ["status", "invoice", "invoice__student"]

    def perform_destroy(self, instance):
        if instance.status != FeeDiscount.Status.PENDING:
            raise ValidationError("Only pending requests can be withdrawn.")
        super().perform_destroy(instance)

    @transaction.atomic
    def _decide(self, request, status):
        discount = FeeDiscount.objects.select_for_update().get(pk=self.get_object().pk)
        if discount.status != FeeDiscount.Status.PENDING:
            raise ValidationError("This request has already been decided.")
        if discount.created_by_id == request.user.id:
            raise ValidationError("You can't decide your own discount request.")
        invoice = _lock_invoice(discount.invoice_id)
        _ensure_open(invoice)
        if status == FeeDiscount.Status.APPROVED:
            invoice.recalculate(commit=False)
            if discount.amount > invoice.balance:
                raise ValidationError(f"Exceeds the outstanding balance ({invoice.balance}).")
        discount.status = status
        discount.decided_by = request.user
        discount.decided_at = timezone.now()
        discount.decision_note = request.data.get("note", "")
        discount.updated_by = request.user
        discount.save()
        invoice.recalculate()
        record_audit(
            action=f"fee_discount.{status}", actor=request.user, instance=discount, request=request,
            organization=request.user.organization,
            changes={"amount": str(discount.amount), "invoice": invoice.number},
        )
        return Response(FeeDiscountSerializer(discount).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        return self._decide(request, FeeDiscount.Status.APPROVED)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        return self._decide(request, FeeDiscount.Status.REJECTED)


# --- rosters, ledger, reports -----------------------------------------------

class _FeeReportView(APIView):
    permission_classes = [IsAuthenticated, HasPermission]
    required_permission = "fee.view"

    def org_id(self, request):
        return request.user.organization_id


class StudentFeesView(_FeeReportView):
    """Per-student fee roster (billed, discount, paid, due, status)."""

    def get(self, request):
        students = Student.objects.filter(organization_id=self.org_id(request)).select_related(
            "class_level", "section"
        )
        for param, field in (("class_level", "class_level_id"), ("section", "section_id"),
                             ("academic_year", "academic_year_id")):
            if request.query_params.get(param):
                students = students.filter(**{field: _uuid(request, param)})
        search = request.query_params.get("search", "").strip()
        if search:
            students = students.filter(
                Q(first_name__icontains=search) | Q(last_name__icontains=search)
                | Q(admission_number__icontains=search)
            )
        rows = []
        wanted = request.query_params.get("status")
        for s in services.annotate_student_fees(students).order_by("class_level__order", "first_name"):
            status = services.fee_status(s)
            if wanted and status != wanted:
                continue
            rows.append({
                "student": str(s.id), "name": s.full_name, "admission_number": s.admission_number,
                "registration_number": s.registration_number, "class_level_name": s.class_level.name,
                "section_name": s.section.name if s.section_id else None,
                "billed": float(s.billed), "discount": float(s.discount), "paid": float(s.paid),
                "due": float(s.billed - s.discount - s.paid), "status": status,
                "next_due_date": s.next_due_date,
            })
        paginator = DefaultPagination()
        page = paginator.paginate_queryset(rows, request, view=self)
        return paginator.get_paginated_response(page)


class LedgerView(_FeeReportView):
    def get(self, request):
        student = Student.objects.filter(
            organization_id=self.org_id(request), pk=_uuid(request, "student", required=True)
        ).first()
        if student is None:
            raise ValidationError({"student": "Student not found."})
        rows = services.ledger(student)
        return Response({
            "student": str(student.id), "name": student.full_name, "entries": rows,
            "balance": rows[-1]["balance"] if rows else 0.0,
        })


class FeeSummaryView(_FeeReportView):
    """Billing dashboard cards for ?date_from=&date_to= (default: this month)."""

    def get(self, request):
        org = self.org_id(request)
        today = timezone.localdate()
        start = _date(request, "date_from", today.replace(day=1))
        end = _date(request, "date_to", today)
        payments = Payment.objects.filter(
            organization_id=org, is_reversed=False, paid_at__date__range=(start, end)
        )
        by_method = {m: float(t) for m, t in payments.values_list("method").annotate(t=Sum("amount"))}
        invoices = Invoice.objects.filter(organization_id=org).exclude(status=Invoice.Status.CANCELLED)
        billed = invoices.filter(issue_date__range=(start, end)).aggregate(
            t=Sum("total_amount"), d=Sum("discount_amount")
        )
        open_ = invoices.filter(status__in=services.OPEN).aggregate(
            t=Sum("total_amount"), d=Sum("discount_amount"), p=Sum("paid_amount")
        )
        return Response({
            "date_from": str(start), "date_to": str(end),
            "billed": float(billed["t"] or 0),
            "discounts": float(billed["d"] or 0),
            "collected": float(sum(by_method.values())),
            "collected_by_method": by_method,
            "outstanding": float((open_["t"] or 0) - (open_["d"] or 0) - (open_["p"] or 0)),
            "open_invoices": invoices.filter(status__in=(Invoice.Status.UNPAID, Invoice.Status.PARTIAL)).count(),
            "overdue_invoices": invoices.filter(status=Invoice.Status.OVERDUE).count(),
            "pending_discounts": FeeDiscount.objects.filter(
                organization_id=org, status=FeeDiscount.Status.PENDING
            ).count(),
        })


class CollectionTrendView(_FeeReportView):
    """Collected vs billed per month for the last ?months= (default 6)."""

    def get(self, request):
        org = self.org_id(request)
        try:
            months = min(max(int(request.query_params.get("months", 6)), 1), 24)
        except ValueError:
            raise ValidationError({"months": "Must be a number."})
        today = timezone.localdate()
        y, m, out = today.year, today.month, []
        for _ in range(months):
            collected = Payment.objects.filter(
                organization_id=org, is_reversed=False, paid_at__year=y, paid_at__month=m
            ).aggregate(t=Sum("amount"))["t"] or 0
            billed = Invoice.objects.filter(
                organization_id=org, issue_date__year=y, issue_date__month=m
            ).exclude(status=Invoice.Status.CANCELLED).aggregate(t=Sum("total_amount"))["t"] or 0
            out.append({"month": f"{y}-{m:02d}", "collected": float(collected), "billed": float(billed)})
            y, m = (y - 1, 12) if m == 1 else (y, m - 1)
        return Response(list(reversed(out)))


class DefaultersView(_FeeReportView):
    """Students with overdue balances, largest first."""

    def get(self, request):
        rows = []
        overdue = Invoice.objects.filter(
            organization_id=self.org_id(request), status=Invoice.Status.OVERDUE
        ).select_related("student", "student__class_level", "student__section")
        by_student = {}
        for inv in overdue:
            r = by_student.setdefault(inv.student_id, {
                "student": str(inv.student_id), "name": inv.student.full_name,
                "admission_number": inv.student.admission_number,
                "class_level_name": inv.student.class_level.name,
                "section_name": inv.student.section.name if inv.student.section_id else None,
                "overdue_amount": 0.0, "invoices": 0, "oldest_due_date": inv.due_date,
            })
            r["overdue_amount"] += float(inv.balance)
            r["invoices"] += 1
            r["oldest_due_date"] = min(r["oldest_due_date"], inv.due_date)
        rows = sorted(by_student.values(), key=lambda r: -r["overdue_amount"])
        return Response(rows)


def _uuid(request, name, required=False):
    raw = request.query_params.get(name)
    if not raw:
        if required:
            raise ValidationError({name: "This parameter is required."})
        return None
    try:
        return uuid.UUID(raw)
    except ValueError:
        raise ValidationError({name: "Must be a valid id."})


def _date(request, name, default):
    raw = request.query_params.get(name)
    if not raw:
        return default
    try:
        return datetime.date.fromisoformat(raw)
    except ValueError:
        raise ValidationError({name: "Use YYYY-MM-DD."})
