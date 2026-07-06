from rest_framework.decorators import action
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.response import Response

from apps.audit.services import record_audit
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

    def perform_destroy(self, instance):
        # Accounting rule (school.md §7.11): never hard-delete; cancel instead.
        raise MethodNotAllowed(
            "DELETE", detail="Invoices cannot be deleted. Use the 'cancel' action."
        )

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = Invoice.Status.CANCELLED
        invoice.cancelled_reason = request.data.get("reason", "")
        invoice.updated_by = request.user
        invoice.save(update_fields=["status", "cancelled_reason", "updated_by", "updated_at"])
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

    def _resync(self, invoice):
        from django.db.models import Sum
        total = invoice.items.filter(is_active=True).aggregate(t=Sum("amount"))["t"] or 0
        invoice.total_amount = total
        invoice.save(update_fields=["total_amount", "updated_at"])
        invoice.recalculate()

    def perform_create(self, serializer):
        super().perform_create(serializer)
        self._resync(serializer.instance.invoice)

    def perform_destroy(self, instance):
        invoice = instance.invoice
        super().perform_destroy(instance)
        self._resync(invoice)


class PaymentViewSet(TenantModelViewSet):
    queryset = Payment.objects.select_related("invoice").all()
    serializer_class = PaymentSerializer
    audit_label = "payment"
    permission_required = {
        "list": "fee.view",
        "retrieve": "fee.view",
        "create": "fee.collect",
        "update": "fee.collect",
        "partial_update": "fee.collect",
        "reverse": "fee.refund",
    }
    filterset_fields = ["invoice", "method", "is_reversed"]
    search_fields = ["receipt_number", "transaction_id"]

    def perform_create(self, serializer):
        super().perform_create(serializer)
        serializer.instance.invoice.recalculate()

    def perform_destroy(self, instance):
        raise MethodNotAllowed(
            "DELETE", detail="Payments cannot be deleted. Use the 'reverse' action."
        )

    @action(detail=True, methods=["post"])
    def reverse(self, request, pk=None):
        payment = self.get_object()
        if payment.is_reversed:
            return Response({"detail": "Payment already reversed."}, status=400)
        payment.is_reversed = True
        payment.reversed_reason = request.data.get("reason", "")
        payment.updated_by = request.user
        payment.save(update_fields=["is_reversed", "reversed_reason", "updated_by", "updated_at"])
        payment.invoice.recalculate()
        record_audit(
            action="payment.reverse", actor=request.user, instance=payment,
            request=request, organization=request.user.organization,
            changes={"reason": payment.reversed_reason},
        )
        return Response(PaymentSerializer(payment).data)
