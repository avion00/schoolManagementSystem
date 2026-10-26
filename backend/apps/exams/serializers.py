from rest_framework import serializers

from apps.academics.models import AcademicYear, ClassLevel, Subject
from apps.core.serializers import TenantPrimaryKeyRelatedField, merged_value
from apps.students.models import Student

from .models import Exam, ExamSubject, GradeBand, GradeScale, Mark


class GradeBandSerializer(serializers.ModelSerializer):
    scale = TenantPrimaryKeyRelatedField(queryset=GradeScale.objects.all())

    class Meta:
        model = GradeBand
        fields = ["id", "scale", "grade", "min_percent", "max_percent", "gpa", "is_active"]
        read_only_fields = ["is_active"]


class GradeScaleSerializer(serializers.ModelSerializer):
    bands = GradeBandSerializer(many=True, read_only=True)

    class Meta:
        model = GradeScale
        fields = ["id", "name", "bands", "is_active"]
        read_only_fields = ["is_active"]


class ExamSerializer(serializers.ModelSerializer):
    academic_year = TenantPrimaryKeyRelatedField(queryset=AcademicYear.objects.all())
    grade_scale = TenantPrimaryKeyRelatedField(
        queryset=GradeScale.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Exam
        fields = [
            "id", "name", "academic_year", "grade_scale", "term",
            "start_date", "end_date", "is_locked", "is_published", "is_active",
        ]
        read_only_fields = ["is_locked", "is_published", "is_active"]

    def validate(self, attrs):
        start = merged_value(attrs, self.instance, "start_date")
        end = merged_value(attrs, self.instance, "end_date")
        if start and end and end < start:
            raise serializers.ValidationError({"end_date": "End date cannot be before the start date."})
        return attrs


class ExamSubjectSerializer(serializers.ModelSerializer):
    exam = TenantPrimaryKeyRelatedField(queryset=Exam.objects.all())
    class_level = TenantPrimaryKeyRelatedField(queryset=ClassLevel.objects.all())
    subject = TenantPrimaryKeyRelatedField(queryset=Subject.objects.all())
    subject_name = serializers.CharField(source="subject.name", read_only=True)

    class Meta:
        model = ExamSubject
        fields = [
            "id", "exam", "class_level", "subject", "subject_name",
            "full_marks", "pass_marks", "exam_date", "is_active",
        ]
        read_only_fields = ["is_active"]

    def validate(self, attrs):
        exam = merged_value(attrs, self.instance, "exam")
        if exam and exam.is_locked:
            raise serializers.ValidationError("This exam is locked and its subjects cannot be changed.")
        if self.instance and "exam" in attrs and attrs["exam"] != self.instance.exam:
            raise serializers.ValidationError({"exam": "An exam subject cannot be moved to another exam."})
        full = merged_value(attrs, self.instance, "full_marks")
        passing = merged_value(attrs, self.instance, "pass_marks")
        if full is not None and full <= 0:
            raise serializers.ValidationError({"full_marks": "Full marks must be greater than zero."})
        if passing is not None and full is not None and not 0 <= passing <= full:
            raise serializers.ValidationError({"pass_marks": "Pass marks must be between 0 and full marks."})
        return attrs


class MarkSerializer(serializers.ModelSerializer):
    exam_subject = TenantPrimaryKeyRelatedField(queryset=ExamSubject.objects.all())
    student = TenantPrimaryKeyRelatedField(queryset=Student.objects.all())
    student_name = serializers.CharField(source="student.full_name", read_only=True)

    class Meta:
        model = Mark
        fields = [
            "id", "exam_subject", "student", "student_name",
            "marks_obtained", "is_absent", "is_active",
        ]
        read_only_fields = ["is_active"]

    def validate(self, attrs):
        exam_subject = merged_value(attrs, self.instance, "exam_subject")
        student = merged_value(attrs, self.instance, "student")
        if self.instance and any(
            k in attrs and attrs[k] != getattr(self.instance, k) for k in ("exam_subject", "student")
        ):
            raise serializers.ValidationError("A mark's exam subject and student cannot be changed.")
        if exam_subject.exam.is_locked:
            raise serializers.ValidationError(
                "Marks for this exam are locked and cannot be changed."
            )
        if student.class_level_id != exam_subject.class_level_id:
            raise serializers.ValidationError(
                {"student": "Student is not in the class this exam subject is for."}
            )
        if merged_value(attrs, self.instance, "is_absent"):
            attrs["marks_obtained"] = None  # an absent student has no score
            return attrs
        marks = attrs.get("marks_obtained")
        if marks is not None and not 0 <= marks <= exam_subject.full_marks:
            raise serializers.ValidationError(
                {"marks_obtained": "Marks must be between 0 and the subject's full marks."}
            )
        return attrs
