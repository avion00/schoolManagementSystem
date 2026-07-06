from rest_framework import serializers

from apps.students.models import Student


class StudentSelfSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    class_level_name = serializers.CharField(source="class_level.name", read_only=True)
    section_name = serializers.CharField(source="section.name", read_only=True, default=None)
    academic_year_name = serializers.CharField(source="academic_year.name", read_only=True)
    guardian_name = serializers.CharField(
        source="primary_guardian.full_name", read_only=True, default=None
    )

    class Meta:
        model = Student
        fields = [
            "id", "full_name", "first_name", "middle_name", "last_name",
            "date_of_birth", "gender", "blood_group", "nationality", "religion",
            "address", "phone", "email", "admission_number", "roll_number",
            "class_level_name", "section_name", "academic_year_name",
            "guardian_name", "status",
        ]


class StudentSelfUpdateSerializer(serializers.ModelSerializer):
    """A student may only edit limited contact fields — never academic records."""

    class Meta:
        model = Student
        fields = ["phone", "email", "address"]
