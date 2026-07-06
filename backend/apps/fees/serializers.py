from rest_framework import serializers

from apps.academics.models import AcademicYear, ClassLevel
from apps.core.serializers import TenantPrimaryKeyRelatedField
from apps.students.models import Student

from .models import FeeCategory, FeeStructure, Invoice, InvoiceItem, Payment


class FeeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeCategory
        fields = ["id", "name", "code", "is_active"]
        read_only_fields = ["is_active"]


class FeeStructureSerializer(serializers.ModelSerializer):
    category = TenantPrimaryKeyRelatedField(queryset=FeeCategory.objects.all())
    academic_year = TenantPrimaryKeyRelatedField(queryset=AcademicYear.objects.all())
    class_level = TenantPrimaryKeyRelatedField(
        queryset=ClassLevel.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = FeeStructure
        fields = ["id", "name", "category", "academic_year", "class_level", "amount", "is_active"]
        read_only_fields = ["is_active"]


class InvoiceItemSerializer(serializers.ModelSerializer):
    category = TenantPrimaryKeyRelatedField(
        queryset=FeeCategory.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = InvoiceItem
        fields = ["id", "invoice", "category", "description", "amount", "is_active"]
        read_only_fields = ["is_active"]
        extra_kwargs = {"invoice": {"required": False}}


class InvoiceSerializer(serializers.ModelSerializer):
    student = TenantPrimaryKeyRelatedField(queryset=Student.objects.all())
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    items = InvoiceItemSerializer(many=True, read_only=True)
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id", "student", "student_name", "number", "issue_date", "due_date",
            "total_amount", "paid_amount", "balance", "status",
            "cancelled_reason", "items", "is_active",
        ]
        read_only_fields = ["paid_amount", "status", "cancelled_reason", "is_active"]


class PaymentSerializer(serializers.ModelSerializer):
    invoice = TenantPrimaryKeyRelatedField(queryset=Invoice.objects.all())

    class Meta:
        model = Payment
        fields = [
            "id", "invoice", "receipt_number", "amount", "method", "paid_at",
            "transaction_id", "remarks", "is_reversed", "reversed_reason", "is_active",
        ]
        read_only_fields = ["is_reversed", "reversed_reason", "is_active"]

    def validate(self, attrs):
        invoice = attrs.get("invoice") or getattr(self.instance, "invoice", None)
        if invoice and invoice.status == Invoice.Status.CANCELLED:
            raise serializers.ValidationError("Cannot record a payment on a cancelled invoice.")
        return attrs
