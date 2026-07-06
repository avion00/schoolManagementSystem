from rest_framework import serializers

from apps.academics.models import AcademicYear, ClassLevel, Subject
from apps.core.serializers import TenantPrimaryKeyRelatedField
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
        exam_subject = attrs.get("exam_subject") or getattr(
            self.instance, "exam_subject", None
        )
        if exam_subject and exam_subject.exam.is_locked:
            raise serializers.ValidationError(
                "Marks for this exam are locked and cannot be changed."
            )
        marks = attrs.get("marks_obtained")
        if marks is not None and exam_subject and marks > exam_subject.full_marks:
            raise serializers.ValidationError(
                {"marks_obtained": "Marks cannot exceed the subject's full marks."}
            )
        return attrs
