from rest_framework import serializers

from apps.academics.models import AcademicYear, ClassLevel, Section, Subject
from apps.core.serializers import TenantPrimaryKeyRelatedField, merged_value

from .models import StaffAttendance, Teacher, TeacherAssignment


def _class_label(assignment):
    if assignment.section_id:
        return f"{assignment.class_level.name} - {assignment.section.name}"
    return assignment.class_level.name


class TeacherSerializer(serializers.ModelSerializer):
    primary_subject = TenantPrimaryKeyRelatedField(
        queryset=Subject.objects.all(), required=False, allow_null=True
    )
    primary_subject_name = serializers.CharField(source="primary_subject.name", read_only=True, default=None)
    subjects = serializers.SerializerMethodField()
    assigned_classes = serializers.SerializerMethodField()
    class_teacher_of = serializers.SerializerMethodField()
    assignments_count = serializers.SerializerMethodField()
    has_login = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = [
            "id", "full_name", "employee_id", "department", "designation",
            "qualification", "experience_years", "joining_date", "employment_type",
            "primary_subject", "primary_subject_name", "subjects", "assigned_classes",
            "class_teacher_of", "assignments_count",
            "phone", "email", "gender", "date_of_birth", "blood_group", "nationality",
            "religion", "marital_status", "spouse_name", "address", "permanent_address",
            "emergency_contact", "emergency_relation",
            "status", "has_login", "is_active",
        ]
        read_only_fields = ["is_active"]

    # The viewset prefetches active assignments, so these don't query per row.
    def _assignments(self, obj):
        return list(obj.assignments.all())

    def get_subjects(self, obj) -> list[str]:
        names = {a.subject.name for a in self._assignments(obj) if a.subject_id}
        if obj.primary_subject_id:
            names.add(obj.primary_subject.name)
        return sorted(names)

    def get_assigned_classes(self, obj) -> list[str]:
        return sorted({_class_label(a) for a in self._assignments(obj)})

    def get_class_teacher_of(self, obj) -> str | None:
        return next((_class_label(a) for a in self._assignments(obj) if a.is_class_teacher), None)

    def get_assignments_count(self, obj) -> int:
        return len(self._assignments(obj))

    def get_has_login(self, obj) -> bool:
        return obj.user_id is not None


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
    class_level_name = serializers.CharField(source="class_level.name", read_only=True)
    section_name = serializers.CharField(source="section.name", read_only=True, default=None)
    subject_name = serializers.CharField(source="subject.name", read_only=True, default=None)

    class Meta:
        model = TeacherAssignment
        fields = [
            "id", "teacher", "teacher_name", "academic_year", "class_level", "class_level_name",
            "section", "section_name", "subject", "subject_name", "is_class_teacher", "is_active",
        ]
        read_only_fields = ["is_active"]
        # DRF's auto unique-together validator would make the optional section /
        # subject required; duplicates are checked in validate() instead (which
        # also catches NULL-section/subject duplicates the DB constraint misses).
        validators = []

    def validate(self, attrs):
        section = merged_value(attrs, self.instance, "section")
        class_level = merged_value(attrs, self.instance, "class_level")
        if section and class_level and section.class_level_id != class_level.id:
            raise serializers.ValidationError(
                {"section": "Section does not belong to the selected class level."}
            )
        same = TeacherAssignment.objects.filter(
            teacher=merged_value(attrs, self.instance, "teacher"),
            academic_year=merged_value(attrs, self.instance, "academic_year"),
            class_level=class_level, section=section,
            subject=merged_value(attrs, self.instance, "subject"),
        )
        if self.instance:
            same = same.exclude(pk=self.instance.pk)
        if same.exists():
            raise serializers.ValidationError("This teacher already has this assignment.")
        if merged_value(attrs, self.instance, "is_class_teacher"):
            if not section:
                raise serializers.ValidationError(
                    {"is_class_teacher": "A class teacher must be assigned to a section."}
                )
            clash = TeacherAssignment.objects.filter(
                academic_year=merged_value(attrs, self.instance, "academic_year"),
                section=section, is_class_teacher=True,
            )
            if self.instance:
                clash = clash.exclude(pk=self.instance.pk)
            if clash.exists():
                raise serializers.ValidationError(
                    {"is_class_teacher": "This section already has a class teacher."}
                )
        return attrs


class StaffAttendanceSerializer(serializers.ModelSerializer):
    teacher = TenantPrimaryKeyRelatedField(queryset=Teacher.objects.all())
    teacher_name = serializers.CharField(source="teacher.full_name", read_only=True)
    employee_id = serializers.CharField(source="teacher.employee_id", read_only=True)

    class Meta:
        model = StaffAttendance
        fields = [
            "id", "teacher", "teacher_name", "employee_id", "date", "status",
            "check_in", "check_out", "remark", "is_active",
        ]
        read_only_fields = ["is_active"]
        validators = []  # uniqueness enforced by the DB, surfaced as a 400

    def validate(self, attrs):
        check_in = merged_value(attrs, self.instance, "check_in")
        check_out = merged_value(attrs, self.instance, "check_out")
        if check_in and check_out and check_out < check_in:
            raise serializers.ValidationError({"check_out": "Check-out cannot be before check-in."})
        return attrs


class StaffAttendanceRecordSerializer(serializers.Serializer):
    teacher = TenantPrimaryKeyRelatedField(queryset=Teacher.objects.all())
    status = serializers.ChoiceField(choices=StaffAttendance.Status.choices)
    check_in = serializers.TimeField(required=False, allow_null=True, default=None)
    check_out = serializers.TimeField(required=False, allow_null=True, default=None)
    remark = serializers.CharField(required=False, allow_blank=True, default="")


class StaffAttendanceBulkSerializer(serializers.Serializer):
    date = serializers.DateField()
    records = StaffAttendanceRecordSerializer(many=True)

    def validate_records(self, records):
        ids = [r["teacher"].pk for r in records]
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError("Each teacher may appear only once.")
        return records
