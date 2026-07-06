"""Exams, grading, schedule and marks (school.md §7.9).

Workflow: create exam → add exam-subjects (full/pass marks) → teachers enter
marks → lock (no more edits) → publish (visible to students/parents).
"""
from django.db import models

from apps.core.models import TenantBaseModel


class GradeScale(TenantBaseModel):
    name = models.CharField(max_length=80)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class GradeBand(TenantBaseModel):
    scale = models.ForeignKey(
        GradeScale, on_delete=models.CASCADE, related_name="bands"
    )
    grade = models.CharField(max_length=8)  # e.g. "A+"
    min_percent = models.DecimalField(max_digits=5, decimal_places=2)
    max_percent = models.DecimalField(max_digits=5, decimal_places=2)
    gpa = models.DecimalField(max_digits=4, decimal_places=2, default=0)

    class Meta:
        ordering = ["-min_percent"]

    def __str__(self):
        return f"{self.grade} ({self.min_percent}-{self.max_percent})"


class Exam(TenantBaseModel):
    name = models.CharField(max_length=150)  # e.g. "First Term 2025"
    academic_year = models.ForeignKey(
        "academics.AcademicYear", on_delete=models.PROTECT, related_name="exams"
    )
    grade_scale = models.ForeignKey(
        GradeScale, null=True, blank=True, on_delete=models.SET_NULL, related_name="exams"
    )
    term = models.CharField(max_length=60, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_locked = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ["-start_date", "name"]

    def __str__(self):
        return self.name


class ExamSubject(TenantBaseModel):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="exam_subjects")
    class_level = models.ForeignKey(
        "academics.ClassLevel", on_delete=models.CASCADE, related_name="exam_subjects"
    )
    subject = models.ForeignKey(
        "academics.Subject", on_delete=models.CASCADE, related_name="exam_subjects"
    )
    full_marks = models.DecimalField(max_digits=6, decimal_places=2, default=100)
    pass_marks = models.DecimalField(max_digits=6, decimal_places=2, default=40)
    exam_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["exam_date"]
        constraints = [
            models.UniqueConstraint(
                fields=["exam", "class_level", "subject"],
                name="uniq_exam_subject_per_class",
            )
        ]

    def __str__(self):
        return f"{self.exam} · {self.subject} · {self.class_level}"


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
    is_absent = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["exam_subject", "student"], name="uniq_mark_per_student_subject"
            )
        ]

    def __str__(self):
        return f"{self.student_id} · {self.exam_subject_id} = {self.marks_obtained}"
