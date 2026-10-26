from rest_framework import serializers

from apps.academics.models import AcademicYear, ClassLevel, Section
from apps.core.serializers import TenantPrimaryKeyRelatedField, merged_value
from apps.guardians.serializers import GuardianMiniSerializer

from .models import Student, StudentHistory


def section_is_full(section, extra):
    """Would adding `extra` active students exceed the section's capacity?"""
    if section.capacity is None:
        return False
    enrolled = Student.objects.filter(section=section, status=Student.Status.ACTIVE).count()
    return enrolled + extra > section.capacity


class StudentSerializer(serializers.ModelSerializer):
    # Org-scoped related fields to prevent cross-tenant references (IDOR).
    academic_year = TenantPrimaryKeyRelatedField(queryset=AcademicYear.objects.all())
    class_level = TenantPrimaryKeyRelatedField(queryset=ClassLevel.objects.all())
    section = TenantPrimaryKeyRelatedField(
        queryset=Section.objects.all(), required=False, allow_null=True
    )

    full_name = serializers.CharField(read_only=True)
    academic_year_name = serializers.CharField(source="academic_year.name", read_only=True)
    class_level_name = serializers.CharField(source="class_level.name", read_only=True)
    section_name = serializers.CharField(source="section.name", read_only=True)
    guardians = GuardianMiniSerializer(source="guardian_links", many=True, read_only=True)
    primary_guardian_name = serializers.SerializerMethodField()
    has_login = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            "id", "first_name", "middle_name", "last_name", "full_name",
            "date_of_birth", "gender", "blood_group", "nationality", "religion",
            "address", "permanent_address", "city", "state", "country", "postal_code",
            "phone", "email",
            "admission_number", "registration_number", "admission_date", "roll_number",
            "house", "previous_school",
            "academic_year", "academic_year_name", "class_level", "class_level_name",
            "section", "section_name",
            "medical_conditions", "allergies", "emergency_contact_name", "emergency_contact_phone",
            "guardians", "primary_guardian_name", "has_login",
            "status", "is_active",
        ]
        # Status moves through the change-status / promote actions so every
        # change lands in the student's history.
        read_only_fields = ["status", "is_active"]
        extra_kwargs = {"registration_number": {"required": False}}

    def get_primary_guardian_name(self, obj) -> str | None:
        guardian = obj.primary_guardian
        return guardian.full_name if guardian else None

    def get_has_login(self, obj) -> bool:
        return obj.user_id is not None

    def validate(self, attrs):
        """Section must belong to the chosen class level."""
        section = merged_value(attrs, self.instance, "section")
        class_level = merged_value(attrs, self.instance, "class_level")
        if section and class_level and section.class_level_id != class_level.id:
            raise serializers.ValidationError(
                {"section": "Section does not belong to the selected class level."}
            )
        moving_in = section and (self.instance is None or self.instance.section_id != section.id)
        if moving_in and section_is_full(section, extra=1):
            raise serializers.ValidationError({"section": f"Section {section} is full."})
        return attrs


class StudentListSerializer(StudentSerializer):
    """Lighter list payload: no health data, no guardian details."""

    class Meta(StudentSerializer.Meta):
        fields = [
            "id", "first_name", "middle_name", "last_name", "full_name",
            "gender", "date_of_birth", "phone", "email", "address",
            "admission_number", "registration_number", "roll_number",
            "academic_year", "academic_year_name", "class_level", "class_level_name",
            "section", "section_name", "primary_guardian_name", "has_login",
            "status", "is_active",
        ]


class StatusChangeSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Student.Status.choices)
    reason = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")
    effective_date = serializers.DateField(required=False)


class PromoteSerializer(serializers.Serializer):
    students = TenantPrimaryKeyRelatedField(queryset=Student.objects.all(), many=True)
    to_academic_year = TenantPrimaryKeyRelatedField(queryset=AcademicYear.objects.all())
    to_class_level = TenantPrimaryKeyRelatedField(queryset=ClassLevel.objects.all())
    to_section = TenantPrimaryKeyRelatedField(
        queryset=Section.objects.all(), required=False, allow_null=True, default=None
    )
    reason = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")
    effective_date = serializers.DateField(required=False)

    def validate(self, attrs):
        if not attrs["students"]:
            raise serializers.ValidationError({"students": "Select at least one student."})
        section = attrs["to_section"]
        if section and section.class_level_id != attrs["to_class_level"].id:
            raise serializers.ValidationError(
                {"to_section": "Section does not belong to the selected class level."}
            )
        if section:
            incoming = sum(1 for s in attrs["students"] if s.section_id != section.id)
            if section_is_full(section, extra=incoming):
                raise serializers.ValidationError({"to_section": f"Section {section} doesn't have room for {incoming} more students."})
        inactive = [s.admission_number for s in attrs["students"] if s.status != Student.Status.ACTIVE]
        if inactive:
            raise serializers.ValidationError(
                {"students": f"Only active students can be promoted: {', '.join(inactive)}"}
            )
        return attrs


class StudentHistorySerializer(serializers.ModelSerializer):
    actor = serializers.CharField(source="created_by.full_name", read_only=True, default=None)
    from_class_level_name = serializers.CharField(source="from_class_level.name", default=None)
    to_class_level_name = serializers.CharField(source="to_class_level.name", default=None)
    from_section_name = serializers.CharField(source="from_section.name", default=None)
    to_section_name = serializers.CharField(source="to_section.name", default=None)
    from_academic_year_name = serializers.CharField(source="from_academic_year.name", default=None)
    to_academic_year_name = serializers.CharField(source="to_academic_year.name", default=None)

    class Meta:
        model = StudentHistory
        fields = [
            "id", "kind", "effective_date", "reason", "from_status", "to_status",
            "from_academic_year_name", "to_academic_year_name",
            "from_class_level_name", "to_class_level_name",
            "from_section_name", "to_section_name", "actor", "created_at",
        ]
