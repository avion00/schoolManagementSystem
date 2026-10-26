from rest_framework import serializers

from apps.academics.models import AcademicYear, ClassLevel, Subject
from apps.core.serializers import TenantPrimaryKeyRelatedField, merged_value
from apps.students.models import Student
from apps.teachers.models import Teacher

from .models import Exam, ExamRoom, ExamSubject, GradeBand, GradeScale, Mark
from .services import schedule_conflicts

COMPONENTS = ("theory", "practical", "internal")


class GradeBandSerializer(serializers.ModelSerializer):
    scale = TenantPrimaryKeyRelatedField(queryset=GradeScale.objects.all())

    class Meta:
        model = GradeBand
        fields = [
            "id", "scale", "grade", "min_percent", "max_percent", "gpa", "is_pass",
            "comment", "color", "is_active",
        ]
        read_only_fields = ["is_active"]

    def validate(self, attrs):
        low = merged_value(attrs, self.instance, "min_percent")
        high = merged_value(attrs, self.instance, "max_percent")
        if not 0 <= low <= high <= 100:
            raise serializers.ValidationError("Bands need 0 ≤ min_percent ≤ max_percent ≤ 100.")
        overlap = GradeBand.objects.filter(
            scale=merged_value(attrs, self.instance, "scale"),
            min_percent__lte=high, max_percent__gte=low,
        )
        if self.instance:
            overlap = overlap.exclude(pk=self.instance.pk)
        if overlap.exists():
            raise serializers.ValidationError(
                f"Overlaps band {overlap.first().grade} in this scale."
            )
        return attrs


class GradeScaleSerializer(serializers.ModelSerializer):
    bands = GradeBandSerializer(many=True, read_only=True)

    class Meta:
        model = GradeScale
        fields = ["id", "name", "bands", "is_active"]
        read_only_fields = ["is_active"]


class ExamRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamRoom
        fields = ["id", "name", "capacity", "building", "floor", "facilities", "is_active"]
        read_only_fields = ["is_active"]
        validators = []


class ExamSerializer(serializers.ModelSerializer):
    academic_year = TenantPrimaryKeyRelatedField(queryset=AcademicYear.objects.all())
    academic_year_name = serializers.CharField(source="academic_year.name", read_only=True)
    grade_scale = TenantPrimaryKeyRelatedField(
        queryset=GradeScale.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Exam
        fields = [
            "id", "code", "name", "academic_year", "academic_year_name", "grade_scale",
            "exam_type", "term", "status", "start_date", "end_date", "instructions",
            "is_locked", "is_published", "published_at", "is_active",
        ]
        read_only_fields = ["code", "is_locked", "is_published", "published_at", "is_active"]

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
    room = TenantPrimaryKeyRelatedField(queryset=ExamRoom.objects.all(), required=False, allow_null=True)
    invigilator = TenantPrimaryKeyRelatedField(queryset=Teacher.objects.all(), required=False, allow_null=True)
    assistant_invigilator = TenantPrimaryKeyRelatedField(
        queryset=Teacher.objects.all(), required=False, allow_null=True
    )
    exam_name = serializers.CharField(source="exam.name", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    class_level_name = serializers.CharField(source="class_level.name", read_only=True)
    room_name = serializers.CharField(source="room.name", read_only=True, default=None)
    invigilator_name = serializers.CharField(source="invigilator.full_name", read_only=True, default=None)
    assistant_invigilator_name = serializers.CharField(
        source="assistant_invigilator.full_name", read_only=True, default=None
    )
    marks_entered = serializers.IntegerField(read_only=True, default=None)

    class Meta:
        model = ExamSubject
        fields = [
            "id", "exam", "exam_name", "class_level", "class_level_name", "subject", "subject_name",
            "full_marks", "pass_marks", "theory_marks", "practical_marks", "internal_marks",
            "exam_date", "start_time", "end_time", "reporting_time",
            "room", "room_name", "invigilator", "invigilator_name",
            "assistant_invigilator", "assistant_invigilator_name",
            "instructions", "notes", "marks_entered", "is_active",
        ]
        read_only_fields = ["is_active"]

    def validate(self, attrs):
        exam = merged_value(attrs, self.instance, "exam")
        if not self.instance:
            self._default_marks(attrs, exam)
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
        parts = [merged_value(attrs, self.instance, f"{c}_marks") for c in COMPONENTS]
        if any(p is not None for p in parts) and sum(p or 0 for p in parts) != full:
            raise serializers.ValidationError(
                {"full_marks": "Theory + practical + internal marks must add up to full marks."}
            )

        data = {f: merged_value(attrs, self.instance, f) for f in (
            "exam_date", "start_time", "end_time", "room", "invigilator",
            "assistant_invigilator", "class_level",
        )}
        if data["start_time"] and data["end_time"] and data["end_time"] <= data["start_time"]:
            raise serializers.ValidationError({"end_time": "End time must be after the start time."})
        if data["exam_date"] and exam.start_date and exam.end_date and not (
            exam.start_date <= data["exam_date"] <= exam.end_date
        ):
            raise serializers.ValidationError({"exam_date": "Date is outside the exam's date range."})
        inv, asst = data["invigilator"], data["assistant_invigilator"]
        if inv and asst and inv == asst:
            raise serializers.ValidationError(
                {"assistant_invigilator": "Choose a different assistant invigilator."}
            )
        clashes = schedule_conflicts(
            data, exclude_id=getattr(self.instance, "pk", None), organization_id=exam.organization_id,
        )
        if clashes:
            raise serializers.ValidationError({"schedule": clashes})
        return attrs

    @staticmethod
    def _default_marks(attrs, exam):
        """Unspecified full/pass marks come from the class curriculum, else the subject."""
        from apps.academics.models import ClassSubject

        if "full_marks" in attrs and "pass_marks" in attrs:
            return
        cs = ClassSubject.objects.filter(
            academic_year_id=exam.academic_year_id, class_level=attrs["class_level"],
            subject=attrs["subject"],
        ).select_related("subject").first()
        subject = attrs["subject"]
        attrs.setdefault("full_marks", cs.effective_full_marks if cs else subject.full_marks)
        attrs.setdefault("pass_marks", cs.effective_pass_marks if cs else subject.pass_marks)


def clean_mark(attrs, paper):
    """Validate a mark against its paper and derive marks_obtained.

    Papers split into components take per-component marks (each within its
    maximum) and the total is their sum; other papers take marks_obtained.
    An absent student has no marks at all.
    """
    if attrs.get("is_absent"):
        attrs["marks_obtained"] = None
        for c in COMPONENTS:
            attrs[f"{c}_marks"] = None
        return attrs
    maxima = paper.components
    if maxima:
        missing = [c for c in maxima if attrs.get(f"{c}_marks") is None]
        if missing:
            raise serializers.ValidationError(
                {f"{c}_marks": "Required for this paper." for c in missing}
            )
        for c, top in maxima.items():
            if not 0 <= attrs[f"{c}_marks"] <= top:
                raise serializers.ValidationError({f"{c}_marks": f"Must be between 0 and {top}."})
        for c in set(COMPONENTS) - set(maxima):
            attrs[f"{c}_marks"] = None
        attrs["marks_obtained"] = sum(attrs[f"{c}_marks"] for c in maxima)
        return attrs
    marks = attrs.get("marks_obtained")
    if marks is not None and not 0 <= marks <= paper.full_marks:
        raise serializers.ValidationError(
            {"marks_obtained": "Marks must be between 0 and the subject's full marks."}
        )
    return attrs


class MarkSerializer(serializers.ModelSerializer):
    exam_subject = TenantPrimaryKeyRelatedField(queryset=ExamSubject.objects.all())
    student = TenantPrimaryKeyRelatedField(queryset=Student.objects.all())
    student_name = serializers.CharField(source="student.full_name", read_only=True)

    class Meta:
        model = Mark
        fields = [
            "id", "exam_subject", "student", "student_name", "marks_obtained",
            "theory_marks", "practical_marks", "internal_marks", "is_absent", "remarks",
            "is_active",
        ]
        read_only_fields = ["is_active"]
        validators = []

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
        if self.instance:  # partial updates validate against the full record
            for f in ("marks_obtained", "is_absent", *(f"{c}_marks" for c in COMPONENTS)):
                attrs.setdefault(f, getattr(self.instance, f))
        return clean_mark(attrs, exam_subject)


class MarkRecordSerializer(serializers.Serializer):
    student = TenantPrimaryKeyRelatedField(queryset=Student.objects.all())
    marks_obtained = serializers.DecimalField(max_digits=6, decimal_places=2, required=False, allow_null=True)
    theory_marks = serializers.DecimalField(max_digits=6, decimal_places=2, required=False, allow_null=True)
    practical_marks = serializers.DecimalField(max_digits=6, decimal_places=2, required=False, allow_null=True)
    internal_marks = serializers.DecimalField(max_digits=6, decimal_places=2, required=False, allow_null=True)
    is_absent = serializers.BooleanField(default=False)
    remarks = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")


class MarkBulkSerializer(serializers.Serializer):
    exam_subject = TenantPrimaryKeyRelatedField(queryset=ExamSubject.objects.all())
    records = MarkRecordSerializer(many=True, allow_empty=False)

    def validate(self, attrs):
        paper = attrs["exam_subject"]
        if paper.exam.is_locked:
            raise serializers.ValidationError("Marks for this exam are locked and cannot be changed.")
        ids = [r["student"].pk for r in attrs["records"]]
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError({"records": "Each student may appear only once."})
        errors = {}
        for i, rec in enumerate(attrs["records"]):
            if rec["student"].class_level_id != paper.class_level_id:
                errors[i] = {"student": "Not in this paper's class."}
                continue
            try:
                clean_mark(rec, paper)
            except serializers.ValidationError as exc:
                errors[i] = exc.detail
        if errors:
            raise serializers.ValidationError({"records": errors})
        return attrs
