from rest_framework import serializers

from apps.accounts.models import School
from apps.core.serializers import TenantPrimaryKeyRelatedField, merged_value

from .models import AcademicYear, ClassLevel, ClassSubject, Section, Subject, SyllabusUnit


class AcademicYearSerializer(serializers.ModelSerializer):
    school = TenantPrimaryKeyRelatedField(queryset=School.objects.all())

    class Meta:
        model = AcademicYear
        fields = ["id", "school", "name", "start_date", "end_date", "is_current", "is_active"]
        read_only_fields = ["is_active"]

    def validate(self, attrs):
        start = merged_value(attrs, self.instance, "start_date")
        end = merged_value(attrs, self.instance, "end_date")
        if start and end and end <= start:
            raise serializers.ValidationError({"end_date": "End date must be after the start date."})
        return attrs


class ClassLevelSerializer(serializers.ModelSerializer):
    school = TenantPrimaryKeyRelatedField(queryset=School.objects.all())
    # Annotated by the viewset.
    sections_count = serializers.IntegerField(read_only=True, default=0)
    students_count = serializers.IntegerField(read_only=True, default=0)
    total_capacity = serializers.IntegerField(read_only=True, default=None)

    class Meta:
        model = ClassLevel
        fields = [
            "id", "school", "name", "code", "order", "medium", "shift", "status",
            "building", "main_room", "description",
            "sections_count", "students_count", "total_capacity", "is_active",
        ]
        read_only_fields = ["is_active"]


class SectionSerializer(serializers.ModelSerializer):
    class_level = TenantPrimaryKeyRelatedField(queryset=ClassLevel.objects.all())
    class_level_name = serializers.CharField(source="class_level.name", read_only=True)
    # Annotated by the viewset.
    students_count = serializers.IntegerField(read_only=True, default=0)
    male_count = serializers.IntegerField(read_only=True, default=0)
    female_count = serializers.IntegerField(read_only=True, default=0)
    class_teacher_name = serializers.CharField(read_only=True, default=None)

    class Meta:
        model = Section
        fields = [
            "id", "class_level", "class_level_name", "name", "code", "room", "capacity",
            "students_count", "male_count", "female_count", "class_teacher_name", "is_active",
        ]
        read_only_fields = ["is_active"]

    def validate(self, attrs):
        if self.instance and "class_level" in attrs and attrs["class_level"] != self.instance.class_level:
            if self.instance.students.exists():
                raise serializers.ValidationError(
                    {"class_level": "This section has students; it can't be moved to another class."}
                )
        capacity = attrs.get("capacity")
        if self.instance and capacity is not None:
            enrolled = self.instance.students.filter(status="active").count()
            if capacity < enrolled:
                raise serializers.ValidationError(
                    {"capacity": f"Capacity can't be below the {enrolled} students already enrolled."}
                )
        return attrs


class SubjectSerializer(serializers.ModelSerializer):
    school = TenantPrimaryKeyRelatedField(queryset=School.objects.all())

    class Meta:
        model = Subject
        fields = [
            "id", "school", "name", "code", "type", "category", "status", "description",
            "department", "full_marks", "pass_marks", "theory_marks", "practical_marks",
            "internal_marks", "credit_hours", "exam_duration_minutes", "gpa_enabled",
            "practical_required", "project_required", "viva_required", "assignment_required",
            "is_active",
        ]
        read_only_fields = ["is_active"]

    def validate(self, attrs):
        full = merged_value(attrs, self.instance, "full_marks")
        passing = merged_value(attrs, self.instance, "pass_marks")
        if full is not None and full <= 0:
            raise serializers.ValidationError({"full_marks": "Full marks must be greater than zero."})
        if full is not None and passing is not None and not 0 <= passing <= full:
            raise serializers.ValidationError({"pass_marks": "Pass marks must be between 0 and full marks."})
        parts = [merged_value(attrs, self.instance, f) for f in ("theory_marks", "practical_marks", "internal_marks")]
        if any(p is not None for p in parts) and sum(p or 0 for p in parts) != full:
            raise serializers.ValidationError(
                {"full_marks": "Theory + practical + internal marks must add up to full marks."}
            )
        return attrs


class ClassSubjectSerializer(serializers.ModelSerializer):
    academic_year = TenantPrimaryKeyRelatedField(queryset=AcademicYear.objects.all())
    class_level = TenantPrimaryKeyRelatedField(queryset=ClassLevel.objects.all())
    subject = TenantPrimaryKeyRelatedField(queryset=Subject.objects.all())
    class_level_name = serializers.CharField(source="class_level.name", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    subject_code = serializers.CharField(source="subject.code", read_only=True)
    effective_full_marks = serializers.DecimalField(max_digits=6, decimal_places=2, read_only=True)
    effective_pass_marks = serializers.DecimalField(max_digits=6, decimal_places=2, read_only=True)

    class Meta:
        model = ClassSubject
        fields = [
            "id", "academic_year", "class_level", "class_level_name", "subject", "subject_name",
            "subject_code", "is_optional", "weekly_periods", "full_marks", "pass_marks",
            "effective_full_marks", "effective_pass_marks", "is_active",
        ]
        read_only_fields = ["is_active"]
        validators = []  # active-row uniqueness checked below / by the DB

    def validate(self, attrs):
        key = {f: merged_value(attrs, self.instance, f) for f in ("academic_year", "class_level", "subject")}
        dup = ClassSubject.objects.filter(**key)
        if self.instance:
            dup = dup.exclude(pk=self.instance.pk)
        if dup.exists():
            raise serializers.ValidationError("This class already takes this subject this year.")
        subject = key["subject"]
        full = merged_value(attrs, self.instance, "full_marks")
        passing = merged_value(attrs, self.instance, "pass_marks")
        full = full if full is not None else subject.full_marks
        passing = passing if passing is not None else subject.pass_marks
        if not 0 <= passing <= full:
            raise serializers.ValidationError({"pass_marks": "Pass marks must be between 0 and full marks."})
        return attrs


class SyllabusUnitSerializer(serializers.ModelSerializer):
    subject = TenantPrimaryKeyRelatedField(queryset=Subject.objects.all())
    class_level = TenantPrimaryKeyRelatedField(
        queryset=ClassLevel.objects.all(), required=False, allow_null=True
    )
    topics = serializers.ListField(
        child=serializers.CharField(max_length=200), required=False, max_length=100
    )

    class Meta:
        model = SyllabusUnit
        fields = [
            "id", "subject", "class_level", "unit_no", "title", "topics",
            "estimated_periods", "status", "is_active",
        ]
        read_only_fields = ["is_active"]
        validators = []

    def validate(self, attrs):
        key = {f: merged_value(attrs, self.instance, f) for f in ("subject", "class_level", "unit_no")}
        dup = SyllabusUnit.objects.filter(**key)
        if self.instance:
            dup = dup.exclude(pk=self.instance.pk)
        if dup.exists():
            raise serializers.ValidationError({"unit_no": "This unit number already exists."})
        return attrs
