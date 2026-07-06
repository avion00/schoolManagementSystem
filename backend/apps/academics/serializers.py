from rest_framework import serializers

from apps.accounts.models import School
from apps.core.serializers import TenantPrimaryKeyRelatedField

from .models import AcademicYear, ClassLevel, Section, Subject


class AcademicYearSerializer(serializers.ModelSerializer):
    school = TenantPrimaryKeyRelatedField(queryset=School.objects.all())

    class Meta:
        model = AcademicYear
        fields = ["id", "school", "name", "start_date", "end_date", "is_current", "is_active"]
        read_only_fields = ["is_active"]


class ClassLevelSerializer(serializers.ModelSerializer):
    school = TenantPrimaryKeyRelatedField(queryset=School.objects.all())

    class Meta:
        model = ClassLevel
        fields = ["id", "school", "name", "order", "is_active"]
        read_only_fields = ["is_active"]


class SectionSerializer(serializers.ModelSerializer):
    class_level = TenantPrimaryKeyRelatedField(queryset=ClassLevel.objects.all())
    class_level_name = serializers.CharField(source="class_level.name", read_only=True)

    class Meta:
        model = Section
        fields = ["id", "class_level", "class_level_name", "name", "is_active"]
        read_only_fields = ["is_active"]


class SubjectSerializer(serializers.ModelSerializer):
    school = TenantPrimaryKeyRelatedField(queryset=School.objects.all())

    class Meta:
        model = Subject
        fields = ["id", "school", "name", "code", "is_active"]
        read_only_fields = ["is_active"]
