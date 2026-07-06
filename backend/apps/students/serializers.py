from rest_framework import serializers

from apps.academics.models import AcademicYear, ClassLevel, Section
from apps.core.serializers import TenantPrimaryKeyRelatedField
from apps.guardians.models import Guardian

from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    # Org-scoped related fields to prevent cross-tenant references (IDOR).
    academic_year = TenantPrimaryKeyRelatedField(queryset=AcademicYear.objects.all())
    class_level = TenantPrimaryKeyRelatedField(queryset=ClassLevel.objects.all())
    section = TenantPrimaryKeyRelatedField(
        queryset=Section.objects.all(), required=False, allow_null=True
    )
    primary_guardian = TenantPrimaryKeyRelatedField(
        queryset=Guardian.objects.all(), required=False, allow_null=True
    )

    full_name = serializers.CharField(read_only=True)
    class_level_name = serializers.CharField(source="class_level.name", read_only=True)
    section_name = serializers.CharField(source="section.name", read_only=True)

    class Meta:
        model = Student
        fields = [
            "id", "first_name", "middle_name", "last_name", "full_name",
            "date_of_birth", "gender", "blood_group", "nationality", "religion",
            "address", "phone", "email",
            "admission_number", "roll_number",
            "academic_year", "class_level", "class_level_name",
            "section", "section_name", "primary_guardian",
            "status", "is_active",
        ]
        read_only_fields = ["is_active"]

    def validate(self, attrs):
        """Section must belong to the chosen class level."""
        section = attrs.get("section") or getattr(self.instance, "section", None)
        class_level = attrs.get("class_level") or getattr(
            self.instance, "class_level", None
        )
        if section and class_level and section.class_level_id != class_level.id:
            raise serializers.ValidationError(
                {"section": "Section does not belong to the selected class level."}
            )
        return attrs
