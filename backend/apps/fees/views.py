"""Fee endpoints.

Every write that touches money runs in a transaction with the invoice row locked,
so concurrent payments / item edits can't double-pay or desync totals.
"""
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.exceptions import MethodNotAllowed, ValidationError
from rest_framework.response import Response

from apps.audit.services import record_audit
from apps.core.sequences import next_document_number
from apps.core.viewsets import TenantModelViewSet

from .models import FeeCategory, FeeStructure, Invoice, InvoiceItem, Payment
from .serializers import (
    FeeCategorySerializer,
    FeeStructureSerializer,
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
    queryset = Invoice.objects.select_related("student").prefetch_related("items").all()
    serializer_class = InvoiceSerializer
    audit_label = "invoice"
    permission_required = {**_MANAGE, "cancel": "fee.create"}
    filterset_fields = ["status", "student"]
    search_fields = ["number"]

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
        if invoice.paid_amount > invoice.total_amount:
            raise ValidationError(
                {"amount": "Invoice total cannot drop below the amount already paid."}
            )
        invoice.save(update_fields=["total_amount", "paid_amount", "status", "updated_at"])

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
