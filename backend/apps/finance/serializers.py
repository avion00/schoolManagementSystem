import re

from rest_framework import serializers

from apps.core.serializers import TenantPrimaryKeyRelatedField, merged_value
from apps.files.serializers import FileIdsField, StoredFileSerializer
from apps.teachers.models import Teacher

from .models import Expense, PayrollRun, Payslip, SalaryStructure, Vendor


class VendorSerializer(serializers.ModelSerializer):
    total_purchases = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True, default=0)
    outstanding = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True, default=0)

    class Meta:
        model = Vendor
        fields = ["id", "code", "name", "category", "contact_person", "phone", "email", "address",
                  "tax_id", "status", "total_purchases", "outstanding", "is_active"]
        read_only_fields = ["code", "is_active"]


class ExpenseSerializer(serializers.ModelSerializer):
    vendor = TenantPrimaryKeyRelatedField(queryset=Vendor.objects.all(), required=False, allow_null=True)
    vendor_name = serializers.CharField(source="vendor.name", read_only=True, default=None)
    receipt_id = FileIdsField(required=False, allow_null=True, write_only=True, source="receipt")
    receipt = StoredFileSerializer(read_only=True, allow_null=True)
    recorded_by = serializers.CharField(source="created_by.full_name", read_only=True, default=None)
    decided_by_name = serializers.CharField(source="decided_by.full_name", read_only=True, default=None)

    class Meta:
        model = Expense
        fields = ["id", "code", "category", "vendor", "vendor_name", "description", "amount", "expense_date",
                  "payment_method", "status", "recorded_by", "decided_by_name", "decided_at", "paid_at",
                  "receipt_id", "receipt", "remarks", "payroll_run", "created_at"]
        read_only_fields = ["code", "status", "decided_at", "paid_at", "payroll_run", "created_at"]

    def validate(self, attrs):
        if self.instance and self.instance.status != Expense.Status.PENDING:
            raise serializers.ValidationError("Only pending expenses can be edited.")
        if merged_value(attrs, self.instance, "amount") <= 0:
            raise serializers.ValidationError({"amount": "Amount must be greater than zero."})
        return attrs


class SalaryStructureSerializer(serializers.ModelSerializer):
    teacher = TenantPrimaryKeyRelatedField(queryset=Teacher.objects.all())
    teacher_name = serializers.CharField(source="teacher.full_name", read_only=True)
    employee_id = serializers.CharField(source="teacher.employee_id", read_only=True)

    class Meta:
        model = SalaryStructure
        fields = ["id", "teacher", "teacher_name", "employee_id", "basic", "house_allowance",
                  "transport_allowance", "other_allowance", "provident_fund_pct", "tax_pct",
                  "other_deduction", "payment_method", "bank_name", "account_number"]

    def validate(self, attrs):
        for f in ("basic", "house_allowance", "transport_allowance", "other_allowance", "other_deduction"):
            if attrs.get(f) is not None and attrs[f] < 0:
                raise serializers.ValidationError({f: "Can't be negative."})
        for f in ("provident_fund_pct", "tax_pct"):
            if attrs.get(f) is not None and not 0 <= attrs[f] <= 100:
                raise serializers.ValidationError({f: "Must be between 0 and 100."})
        return attrs


class PayslipSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source="teacher.full_name", read_only=True)
    employee_id = serializers.CharField(source="teacher.employee_id", read_only=True)
    department = serializers.CharField(source="teacher.department", read_only=True)
    month = serializers.CharField(source="run.month", read_only=True)
    run_status = serializers.CharField(source="run.status", read_only=True)

    class Meta:
        model = Payslip
        fields = ["id", "run", "month", "run_status", "teacher", "teacher_name", "employee_id", "department",
                  "basic", "allowances", "bonus", "absent_days", "attendance_deduction", "provident_fund",
                  "tax", "other_deduction", "net", "payment_method", "note"]
        read_only_fields = [f for f in fields if f not in ("bonus", "other_deduction", "note")]


class PayrollRunSerializer(serializers.ModelSerializer):
    approved_by_name = serializers.CharField(source="approved_by.full_name", read_only=True, default=None)
    working_days = serializers.IntegerField(required=False, min_value=1, max_value=31)

    class Meta:
        model = PayrollRun
        fields = ["id", "month", "working_days", "status", "approved_by_name", "approved_at", "paid_at", "created_at"]
        read_only_fields = ["status", "approved_at", "paid_at", "created_at"]

    def validate_month(self, value):
        if not re.fullmatch(r"\d{4}-(0[1-9]|1[0-2])", value):
            raise serializers.ValidationError("Use YYYY-MM.")
        return value
