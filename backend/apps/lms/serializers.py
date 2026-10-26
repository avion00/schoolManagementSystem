from rest_framework import serializers

from apps.academics.models import AcademicYear, ClassLevel, Section, Subject
from apps.core.serializers import TenantPrimaryKeyRelatedField, merged_value
from apps.files.serializers import FileIdsField, StoredFileSerializer

from .models import Assignment, LessonPlan, Material, Submission


def _check_section(attrs, instance):
    section = merged_value(attrs, instance, "section")
    class_level = merged_value(attrs, instance, "class_level")
    if section and section.class_level_id != class_level.pk:
        raise serializers.ValidationError({"section": "Section does not belong to the selected class."})


class AssignmentSerializer(serializers.ModelSerializer):
    academic_year = TenantPrimaryKeyRelatedField(queryset=AcademicYear.objects.all())
    class_level = TenantPrimaryKeyRelatedField(queryset=ClassLevel.objects.all())
    section = TenantPrimaryKeyRelatedField(queryset=Section.objects.all(), required=False, allow_null=True)
    subject = TenantPrimaryKeyRelatedField(queryset=Subject.objects.all())
    attachment_ids = FileIdsField(many=True, required=False, write_only=True, source="attachments")
    attachments = StoredFileSerializer(many=True, read_only=True)
    class_level_name = serializers.CharField(source="class_level.name", read_only=True)
    section_name = serializers.CharField(source="section.name", read_only=True, default=None)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    teacher_name = serializers.CharField(source="teacher.full_name", read_only=True, default=None)
    submissions_count = serializers.IntegerField(read_only=True, default=None)
    graded_count = serializers.IntegerField(read_only=True, default=None)

    class Meta:
        model = Assignment
        fields = [
            "id", "academic_year", "class_level", "class_level_name", "section", "section_name",
            "subject", "subject_name", "teacher", "teacher_name", "kind", "title", "instructions",
            "rubric", "due_at", "max_marks", "allow_late", "status", "published_at",
            "attachment_ids", "attachments", "submissions_count", "graded_count", "created_at",
        ]
        read_only_fields = ["teacher", "status", "published_at", "created_at"]

    def validate(self, attrs):
        _check_section(attrs, self.instance)
        if self.instance and self.instance.status != Assignment.Status.DRAFT:
            frozen = {"class_level", "section", "subject", "academic_year", "max_marks"} & set(attrs)
            if frozen:
                raise serializers.ValidationError(f"Can't change {', '.join(sorted(frozen))} after publishing.")
        marks = attrs.get("max_marks")
        if marks is not None and marks <= 0:
            raise serializers.ValidationError({"max_marks": "Must be greater than zero."})
        return attrs


class SubmissionSerializer(serializers.ModelSerializer):
    attachments = StoredFileSerializer(many=True, read_only=True)
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    roll_number = serializers.CharField(source="student.roll_number", read_only=True)
    graded_by_name = serializers.CharField(source="graded_by.full_name", read_only=True, default=None)

    class Meta:
        model = Submission
        fields = [
            "id", "assignment", "student", "student_name", "roll_number", "text_answer", "attachments",
            "submitted_at", "is_late", "status", "marks", "feedback", "graded_by_name", "graded_at",
        ]
        read_only_fields = fields


class SubmitSerializer(serializers.Serializer):
    text_answer = serializers.CharField(required=False, allow_blank=True, max_length=20000)
    attachment_ids = FileIdsField(many=True, required=False)

    def validate(self, attrs):
        if not attrs.get("text_answer", "").strip() and not attrs.get("attachment_ids"):
            raise serializers.ValidationError("Write an answer or attach a file.")
        return attrs


class GradeSerializer(serializers.Serializer):
    marks = serializers.DecimalField(max_digits=6, decimal_places=2, required=False, allow_null=True)
    feedback = serializers.CharField(required=False, allow_blank=True, max_length=5000)
    return_for_changes = serializers.BooleanField(default=False)


class MaterialSerializer(serializers.ModelSerializer):
    class_level = TenantPrimaryKeyRelatedField(queryset=ClassLevel.objects.all())
    section = TenantPrimaryKeyRelatedField(queryset=Section.objects.all(), required=False, allow_null=True)
    subject = TenantPrimaryKeyRelatedField(queryset=Subject.objects.all())
    file_id = FileIdsField(required=False, allow_null=True, write_only=True, source="file")
    file = StoredFileSerializer(read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    class_level_name = serializers.CharField(source="class_level.name", read_only=True)
    section_name = serializers.CharField(source="section.name", read_only=True, default=None)
    teacher_name = serializers.CharField(source="teacher.full_name", read_only=True, default=None)

    class Meta:
        model = Material
        fields = [
            "id", "class_level", "class_level_name", "section", "section_name", "subject", "subject_name",
            "teacher_name", "title", "description", "type", "file_id", "file", "url", "is_shared",
            "views", "created_at",
        ]
        read_only_fields = ["views", "created_at"]

    def validate(self, attrs):
        _check_section(attrs, self.instance)
        kind = merged_value(attrs, self.instance, "type")
        f, url = merged_value(attrs, self.instance, "file"), merged_value(attrs, self.instance, "url")
        if kind == Material.Type.LINK and not url:
            raise serializers.ValidationError({"url": "Links need a URL."})
        if kind != Material.Type.LINK and f is None:
            raise serializers.ValidationError({"file_id": "Upload the file first."})
        return attrs


class LessonPlanSerializer(serializers.ModelSerializer):
    class_level = TenantPrimaryKeyRelatedField(queryset=ClassLevel.objects.all())
    section = TenantPrimaryKeyRelatedField(queryset=Section.objects.all(), required=False, allow_null=True)
    subject = TenantPrimaryKeyRelatedField(queryset=Subject.objects.all())
    objectives = serializers.ListField(child=serializers.CharField(max_length=300), required=False)
    materials = serializers.ListField(child=serializers.CharField(max_length=300), required=False)
    teacher_name = serializers.CharField(source="teacher.full_name", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    class_level_name = serializers.CharField(source="class_level.name", read_only=True)
    reviewed_by_name = serializers.CharField(source="reviewed_by.full_name", read_only=True, default=None)

    class Meta:
        model = LessonPlan
        fields = [
            "id", "teacher", "teacher_name", "class_level", "class_level_name", "section", "subject",
            "subject_name", "week_start", "topic", "objectives", "materials", "homework", "status",
            "review_note", "reviewed_by_name", "reviewed_at",
        ]
        read_only_fields = ["teacher", "status", "review_note", "reviewed_at"]

    def validate(self, attrs):
        _check_section(attrs, self.instance)
        if self.instance and self.instance.status in (LessonPlan.Status.SUBMITTED, LessonPlan.Status.APPROVED):
            raise serializers.ValidationError("Submitted or approved plans can't be edited.")
        return attrs
