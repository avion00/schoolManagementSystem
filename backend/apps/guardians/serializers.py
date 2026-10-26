from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.core.serializers import TenantPrimaryKeyRelatedField, merged_value
from apps.students.models import Student

from .models import Guardian, StudentGuardian


class LinkedChildSerializer(serializers.ModelSerializer):
    """A guardian's view of one linked child (frontend `LinkedChild`)."""

    link_id = serializers.UUIDField(source="id", read_only=True)
    student = serializers.UUIDField(source="student.id", read_only=True)
    name = serializers.CharField(source="student.full_name", read_only=True)
    admission_number = serializers.CharField(source="student.admission_number", read_only=True)
    registration_number = serializers.CharField(source="student.registration_number", read_only=True)
    class_level_name = serializers.CharField(source="student.class_level.name", read_only=True)
    section_name = serializers.CharField(source="student.section.name", read_only=True, default=None)
    roll_number = serializers.CharField(source="student.roll_number", read_only=True)
    gender = serializers.CharField(source="student.gender", read_only=True)
    status = serializers.CharField(source="student.status", read_only=True)

    class Meta:
        model = StudentGuardian
        fields = [
            "link_id", "student", "name", "admission_number", "registration_number",
            "class_level_name", "section_name", "roll_number", "gender", "status",
            "relation", "is_primary", "is_emergency_contact",
        ]


class GuardianSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    children_count = serializers.SerializerMethodField()
    has_login = serializers.SerializerMethodField()

    class Meta:
        model = Guardian
        fields = [
            "id", "guardian_code", "full_name", "gender", "relation",
            "phone", "alternate_phone", "email", "occupation",
            "nationality", "religion", "address", "permanent_address",
            "emergency_contact", "emergency_relation", "status",
            "children", "children_count", "has_login", "is_active",
        ]
        read_only_fields = ["guardian_code", "is_active"]

    def _links(self, obj):
        # Uses the viewset's prefetch; only links to students that still exist.
        return [link for link in obj.student_links.all() if link.student.is_active]

    @extend_schema_field(LinkedChildSerializer(many=True))
    def get_children(self, obj):
        return LinkedChildSerializer(self._links(obj), many=True).data

    def get_children_count(self, obj) -> int:
        return len(self._links(obj))

    def get_has_login(self, obj) -> bool:
        return obj.user_id is not None


class StudentGuardianSerializer(serializers.ModelSerializer):
    student = TenantPrimaryKeyRelatedField(queryset=Student.objects.all())
    guardian = TenantPrimaryKeyRelatedField(queryset=Guardian.objects.all())
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    guardian_name = serializers.CharField(source="guardian.full_name", read_only=True)
    guardian_phone = serializers.CharField(source="guardian.phone", read_only=True)
    guardian_email = serializers.CharField(source="guardian.email", read_only=True)
    relation = serializers.ChoiceField(choices=Guardian.Relation.choices, required=False)

    class Meta:
        model = StudentGuardian
        fields = [
            "id", "student", "student_name", "guardian", "guardian_name",
            "guardian_phone", "guardian_email", "relation", "is_primary",
            "is_emergency_contact", "is_active",
        ]
        read_only_fields = ["is_active"]
        validators = []  # active-link uniqueness is checked in validate()

    def validate(self, attrs):
        student = merged_value(attrs, self.instance, "student")
        guardian = merged_value(attrs, self.instance, "guardian")
        if self.instance and (student != self.instance.student or guardian != self.instance.guardian):
            raise serializers.ValidationError("A link's student and guardian cannot be changed.")
        if not self.instance:
            if StudentGuardian.objects.filter(student=student, guardian=guardian).exists():
                raise serializers.ValidationError("This guardian is already linked to the student.")
            attrs.setdefault("relation", guardian.relation)
        return attrs


class GuardianMiniSerializer(serializers.ModelSerializer):
    """A student's guardian as shown on the student record."""

    link_id = serializers.UUIDField(source="id", read_only=True)
    guardian = serializers.UUIDField(source="guardian.id", read_only=True)
    full_name = serializers.CharField(source="guardian.full_name", read_only=True)
    phone = serializers.CharField(source="guardian.phone", read_only=True)
    email = serializers.CharField(source="guardian.email", read_only=True)
    occupation = serializers.CharField(source="guardian.occupation", read_only=True)

    class Meta:
        model = StudentGuardian
        fields = [
            "link_id", "guardian", "full_name", "relation", "phone", "email",
            "occupation", "is_primary", "is_emergency_contact",
        ]
