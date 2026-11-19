"""Exams, grading, schedule and marks (school.md §7.9).

Workflow: create exam → add papers (exam subjects: marks scheme, date, room,
invigilators) → teachers enter marks → lock (no more edits) → publish (visible
to students/parents).
"""
from django.db import models

from apps.core.models import TenantBaseModel


class GradeScale(TenantBaseModel):
    name = models.CharField(max_length=80)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    def band_for(self, percent):
        """The band covering `percent` (bands are prefetched by callers when hot)."""
        for band in self.bands.all():
            if band.min_percent <= percent <= band.max_percent:
                return band
        return None


class GradeBand(TenantBaseModel):
    scale = models.ForeignKey(
        GradeScale, on_delete=models.CASCADE, related_name="bands"
    )
    grade = models.CharField(max_length=8)  # e.g. "A+"
    min_percent = models.DecimalField(max_digits=5, decimal_places=2)
    max_percent = models.DecimalField(max_digits=5, decimal_places=2)
    gpa = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    is_pass = models.BooleanField(default=True)
    comment = models.CharField(max_length=120, blank=True)  # e.g. "Outstanding"
    color = models.CharField(max_length=20, blank=True)

    class Meta:
        ordering = ["-min_percent"]

    def __str__(self):
        return f"{self.grade} ({self.min_percent}-{self.max_percent})"


class ExamRoom(TenantBaseModel):
    name = models.CharField(max_length=60)
    capacity = models.PositiveIntegerField(default=0)
    building = models.CharField(max_length=80, blank=True)
    floor = models.CharField(max_length=20, blank=True)
    facilities = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "name"], condition=models.Q(is_active=True),
                name="uniq_active_exam_room_name",
            )
        ]

    def __str__(self):
        return self.name


class Exam(TenantBaseModel):
    class Type(models.TextChoices):
        CLASS_TEST = "class_test", "Class Test"
        UNIT_TEST = "unit_test", "Unit Test"
        MID_TERM = "mid_term", "Mid Term"
        FINAL_TERM = "final_term", "Final Term"
        PRACTICAL = "practical", "Practical Exam"
        BOARD = "board", "Board Exam"
        MOCK = "mock", "Mock Test"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SCHEDULED = "scheduled", "Scheduled"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    code = models.CharField(max_length=40, blank=True, db_index=True)
    name = models.CharField(max_length=150)  # e.g. "First Term 2025"
    academic_year = models.ForeignKey(
        "academics.AcademicYear", on_delete=models.PROTECT, related_name="exams"
    )
    grade_scale = models.ForeignKey(
        GradeScale, null=True, blank=True, on_delete=models.SET_NULL, related_name="exams"
    )
    exam_type = models.CharField(max_length=12, choices=Type.choices, default=Type.FINAL_TERM)
    term = models.CharField(max_length=60, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    instructions = models.TextField(blank=True)
    is_locked = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-start_date", "name"]

    def __str__(self):
        return self.name


class ExamSubject(TenantBaseModel):
    """One paper: a subject sat by a class in an exam, with its schedule and scheme."""

    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="exam_subjects")
    class_level = models.ForeignKey(
        "academics.ClassLevel", on_delete=models.CASCADE, related_name="exam_subjects"
    )
    subject = models.ForeignKey(
        "academics.Subject", on_delete=models.CASCADE, related_name="exam_subjects"
    )
    full_marks = models.DecimalField(max_digits=6, decimal_places=2, default=100)
    pass_marks = models.DecimalField(max_digits=6, decimal_places=2, default=40)
    # Optional component maxima; when set, marks are entered per component.
    theory_marks = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    practical_marks = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    internal_marks = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    # Schedule
    exam_date = models.DateField(null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    reporting_time = models.TimeField(null=True, blank=True)
    room = models.ForeignKey(
        ExamRoom, null=True, blank=True, on_delete=models.SET_NULL, related_name="papers"
    )
    invigilator = models.ForeignKey(
        "teachers.Teacher", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    assistant_invigilator = models.ForeignKey(
        "teachers.Teacher", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    instructions = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["exam_date", "start_time"]
        constraints = [
            models.UniqueConstraint(
                fields=["exam", "class_level", "subject"],
                name="uniq_exam_subject_per_class",
            )
        ]

    def __str__(self):
        return f"{self.exam} · {self.subject} · {self.class_level}"

    @property
    def components(self):
        """{component: max} for the components this paper is split into."""
        return {
            name: getattr(self, f"{name}_marks")
            for name in ("theory", "practical", "internal")
            if getattr(self, f"{name}_marks") is not None
        }


class Mark(TenantBaseModel):
    exam_subject = models.ForeignKey(
        ExamSubject, on_delete=models.CASCADE, related_name="marks"
    )
    student = models.ForeignKey(
        "students.Student", on_delete=models.CASCADE, related_name="marks"
    )
    marks_obtained = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True
    )
    theory_marks = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    practical_marks = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    internal_marks = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    is_absent = models.BooleanField(default=False)
    remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["exam_subject", "student"], condition=models.Q(is_active=True),
                name="uniq_mark_per_student_subject",
            )
        ]

    def __str__(self):
        return f"{self.student_id} · {self.exam_subject_id} = {self.marks_obtained}"
