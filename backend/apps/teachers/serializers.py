from rest_framework import serializers

from apps.academics.models import AcademicYear, ClassLevel, Section, Subject
from apps.core.serializers import TenantPrimaryKeyRelatedField

from .models import Teacher, TeacherAssignment


class TeacherSerializer(serializers.ModelSerializer):
    assignments_count = serializers.IntegerField(
        source="assignments.count", read_only=True
    )

    class Meta:
        model = Teacher
        fields = [
            "id", "full_name", "employee_id", "department", "designation",
            "qualification", "experience_years", "joining_date",
            "phone", "email", "status", "assignments_count", "is_active",
        ]
        read_only_fields = ["is_active"]


class TeacherAssignmentSerializer(serializers.ModelSerializer):
    teacher = TenantPrimaryKeyRelatedField(queryset=Teacher.objects.all())
    academic_year = TenantPrimaryKeyRelatedField(queryset=AcademicYear.objects.all())
    class_level = TenantPrimaryKeyRelatedField(queryset=ClassLevel.objects.all())
    section = TenantPrimaryKeyRelatedField(
        queryset=Section.objects.all(), required=False, allow_null=True
    )
    subject = TenantPrimaryKeyRelatedField(
        queryset=Subject.objects.all(), required=False, allow_null=True
    )
    teacher_name = serializers.CharField(source="teacher.full_name", read_only=True)

    class Meta:
        model = TeacherAssignment
        fields = [
            "id", "teacher", "teacher_name", "academic_year", "class_level",
            "section", "subject", "is_class_teacher", "is_active",
        ]
        read_only_fields = ["is_active"]

    def validate(self, attrs):
        section = attrs.get("section") or getattr(self.instance, "section", None)
        class_level = attrs.get("class_level") or getattr(
            self.instance, "class_level", None
        )
        if section and class_level and section.class_level_id != class_level.id:
            raise serializers.ValidationError(
                {"section": "Section does not belong to the selected class level."}
            )
        return attrs
