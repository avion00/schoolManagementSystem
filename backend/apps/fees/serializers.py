from rest_framework import serializers

from apps.academics.models import AcademicYear, ClassLevel
from apps.core.serializers import TenantPrimaryKeyRelatedField, merged_value
from apps.students.models import Student

from .models import FeeCategory, FeeDiscount, FeeStructure, Invoice, InvoiceItem, Payment


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
    category_name = serializers.CharField(source="category.name", read_only=True)
    class_level_name = serializers.CharField(source="class_level.name", read_only=True, default=None)

    class Meta:
        model = FeeStructure
        fields = [
            "id", "name", "category", "category_name", "academic_year", "class_level",
            "class_level_name", "amount", "frequency", "is_active",
        ]
        read_only_fields = ["is_active"]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value


class InvoiceItemSerializer(serializers.ModelSerializer):
    invoice = TenantPrimaryKeyRelatedField(queryset=Invoice.objects.all())
    category = TenantPrimaryKeyRelatedField(
        queryset=FeeCategory.objects.all(), required=False, allow_null=True
    )

    category_name = serializers.CharField(source="category.name", read_only=True, default=None)

    class Meta:
        model = InvoiceItem
        fields = [
            "id", "invoice", "category", "category_name", "description",
            "quantity", "unit_price", "amount", "is_late_fee", "is_active",
        ]
        read_only_fields = ["is_late_fee", "is_active"]
        extra_kwargs = {"amount": {"required": False}}

    def validate(self, attrs):
        if self.instance and "invoice" in attrs and attrs["invoice"] != self.instance.invoice:
            raise serializers.ValidationError({"invoice": "An item cannot be moved to another invoice."})
        # amount = unit_price × quantity. A bare `amount` (older clients) is one unit.
        quantity = merged_value(attrs, self.instance, "quantity") or 1
        if attrs.get("unit_price") is not None:
            unit = attrs["unit_price"]
        elif "amount" in attrs:
            unit, quantity = attrs["amount"], 1
        elif self.instance:
            unit = self.instance.unit_price if self.instance.unit_price is not None else self.instance.amount
        else:
            unit = None
        if unit is None:
            raise serializers.ValidationError({"unit_price": "Provide a unit price (or an amount)."})
        if unit <= 0:
            raise serializers.ValidationError({"unit_price": "Price must be greater than zero."})
        if quantity < 1:
            raise serializers.ValidationError({"quantity": "Quantity must be at least 1."})
        attrs.update(unit_price=unit, quantity=quantity, amount=unit * quantity)
        return attrs


class InvoiceSerializer(serializers.ModelSerializer):
    student = TenantPrimaryKeyRelatedField(queryset=Student.objects.all())
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    admission_number = serializers.CharField(source="student.admission_number", read_only=True)
    class_level_name = serializers.CharField(source="student.class_level.name", read_only=True)
    section_name = serializers.CharField(source="student.section.name", read_only=True, default=None)
    items = InvoiceItemSerializer(many=True, read_only=True)
    net_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id", "student", "student_name", "admission_number", "class_level_name",
            "section_name", "number", "billing_period", "issue_date", "due_date",
            "total_amount", "discount_amount", "net_amount", "paid_amount", "balance", "status",
            "cancelled_reason", "items", "is_active",
        ]
        # number is server-assigned; amounts are derived from items, discounts, payments.
        read_only_fields = [
            "number", "total_amount", "discount_amount", "paid_amount", "status",
            "cancelled_reason", "is_active",
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
    invoice_number = serializers.CharField(source="invoice.number", read_only=True)
    student_name = serializers.CharField(source="invoice.student.full_name", read_only=True)
    received_by = serializers.CharField(source="created_by.full_name", read_only=True, default=None)

    class Meta:
        model = Payment
        fields = [
            "id", "invoice", "invoice_number", "student_name", "receipt_number", "amount",
            "method", "paid_at", "transaction_id", "remarks", "received_by",
            "is_reversed", "reversed_reason", "is_active",
        ]
        read_only_fields = ["receipt_number", "is_reversed", "reversed_reason", "is_active"]
        extra_kwargs = {"paid_at": {"required": False}}

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value


class FeeDiscountSerializer(serializers.ModelSerializer):
    invoice = TenantPrimaryKeyRelatedField(queryset=Invoice.objects.all())
    invoice_number = serializers.CharField(source="invoice.number", read_only=True)
    student_name = serializers.CharField(source="invoice.student.full_name", read_only=True)
    requested_by = serializers.CharField(source="created_by.full_name", read_only=True, default=None)
    decided_by_name = serializers.CharField(source="decided_by.full_name", read_only=True, default=None)

    class Meta:
        model = FeeDiscount
        fields = [
            "id", "invoice", "invoice_number", "student_name", "amount", "reason", "status",
            "requested_by", "decided_by_name", "decided_at", "decision_note", "created_at",
            "is_active",
        ]
        read_only_fields = ["status", "decided_at", "decision_note", "is_active"]

    def validate(self, attrs):
        if self.instance:
            raise serializers.ValidationError("Discount requests can't be edited; withdraw and re-request.")
        invoice = attrs["invoice"]
        if invoice.status == Invoice.Status.CANCELLED:
            raise serializers.ValidationError({"invoice": "This invoice is cancelled."})
        if attrs["amount"] <= 0:
            raise serializers.ValidationError({"amount": "Amount must be greater than zero."})
        if attrs["amount"] > invoice.balance:
            raise serializers.ValidationError({"amount": f"Exceeds the outstanding balance ({invoice.balance})."})
        return attrs


class GenerateInvoicesSerializer(serializers.Serializer):
    academic_year = TenantPrimaryKeyRelatedField(queryset=AcademicYear.objects.all())
    billing_period = serializers.CharField(max_length=40)
    issue_date = serializers.DateField()
    due_date = serializers.DateField(required=False, allow_null=True)
    fee_structures = TenantPrimaryKeyRelatedField(
        queryset=FeeStructure.objects.all(), many=True, required=False
    )
    class_level = TenantPrimaryKeyRelatedField(
        queryset=ClassLevel.objects.all(), required=False, allow_null=True
    )
    students = TenantPrimaryKeyRelatedField(queryset=Student.objects.all(), many=True, required=False)

    def validate(self, attrs):
        due = attrs.get("due_date")
        if due and due < attrs["issue_date"]:
            raise serializers.ValidationError({"due_date": "Due date cannot be before the issue date."})
        return attrs
