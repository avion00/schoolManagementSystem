from rest_framework import serializers

from apps.academics.models import AcademicYear, ClassLevel
from apps.core.serializers import TenantPrimaryKeyRelatedField, merged_value
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
    invoice = TenantPrimaryKeyRelatedField(queryset=Invoice.objects.all())
    category = TenantPrimaryKeyRelatedField(
        queryset=FeeCategory.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = InvoiceItem
        fields = ["id", "invoice", "category", "description", "amount", "is_active"]
        read_only_fields = ["is_active"]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate(self, attrs):
        if self.instance and "invoice" in attrs and attrs["invoice"] != self.instance.invoice:
            raise serializers.ValidationError({"invoice": "An item cannot be moved to another invoice."})
        return attrs


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
        # number is server-assigned; total_amount is derived from the items.
        read_only_fields = [
            "number", "total_amount", "paid_amount", "status", "cancelled_reason", "is_active",
        ]

    def validate(self, attrs):
        if self.instance and "student" in attrs and attrs["student"] != self.instance.student:
            raise serializers.ValidationError({"student": "An invoice's student cannot be changed."})
        due = merged_value(attrs, self.instance, "due_date")
        issue = merged_value(attrs, self.instance, "issue_date")
        if due and issue and due < issue:
            raise serializers.ValidationError({"due_date": "Due date cannot be before the issue date."})
        return attrs


class PaymentSerializer(serializers.ModelSerializer):
    invoice = TenantPrimaryKeyRelatedField(queryset=Invoice.objects.all())

    class Meta:
        model = Payment
        fields = [
            "id", "invoice", "receipt_number", "amount", "method", "paid_at",
            "transaction_id", "remarks", "is_reversed", "reversed_reason", "is_active",
        ]
        read_only_fields = ["receipt_number", "is_reversed", "reversed_reason", "is_active"]
        extra_kwargs = {"paid_at": {"required": False}}

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value
