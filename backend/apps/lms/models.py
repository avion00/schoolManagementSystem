"""Learning management (school.md §7.10): assignments & homework,
submissions, learning materials, lesson plans."""
from django.db import models

from apps.core.models import TenantBaseModel


class Assignment(TenantBaseModel):
    class Kind(models.TextChoices):
        HOMEWORK = "homework", "Homework"
        ASSIGNMENT = "assignment", "Assignment"
        PROJECT = "project", "Project"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        CLOSED = "closed", "Closed"

    academic_year = models.ForeignKey("academics.AcademicYear", on_delete=models.PROTECT, related_name="+")
    class_level = models.ForeignKey("academics.ClassLevel", on_delete=models.PROTECT, related_name="+")
    section = models.ForeignKey(
        "academics.Section", null=True, blank=True, on_delete=models.PROTECT, related_name="+"
    )  # null = every section of the class
    subject = models.ForeignKey("academics.Subject", on_delete=models.PROTECT, related_name="+")
    teacher = models.ForeignKey(
        "teachers.Teacher", null=True, blank=True, on_delete=models.SET_NULL, related_name="assignments_set"
    )
    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.HOMEWORK)
    title = models.CharField(max_length=200)
    instructions = models.TextField(blank=True)
    rubric = models.TextField(blank=True)
    due_at = models.DateTimeField()
    max_marks = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    allow_late = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT, db_index=True)
    published_at = models.DateTimeField(null=True, blank=True)
    attachments = models.ManyToManyField("files.StoredFile", blank=True, related_name="assignments")

    class Meta:
        ordering = ["-due_at"]

    def __str__(self):
        return self.title


class Submission(TenantBaseModel):
    class Status(models.TextChoices):
        SUBMITTED = "submitted", "Submitted"
        GRADED = "graded", "Graded"
        RETURNED = "returned", "Returned for changes"

    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="submissions")
    student = models.ForeignKey("students.Student", on_delete=models.CASCADE, related_name="submissions")
    text_answer = models.TextField(blank=True)
    attachments = models.ManyToManyField("files.StoredFile", blank=True, related_name="submissions")
    submitted_at = models.DateTimeField()
    is_late = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.SUBMITTED)
    marks = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(
        "accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    graded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-submitted_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["assignment", "student"], condition=models.Q(is_active=True),
                name="uniq_active_submission",
            )
        ]


class Material(TenantBaseModel):
    class Type(models.TextChoices):
        PDF = "pdf", "PDF"
        DOC = "doc", "Document"
        IMAGE = "image", "Image"
        VIDEO = "video", "Video"
        LINK = "link", "Link"

    class_level = models.ForeignKey("academics.ClassLevel", on_delete=models.PROTECT, related_name="+")
    section = models.ForeignKey(
        "academics.Section", null=True, blank=True, on_delete=models.PROTECT, related_name="+"
    )
    subject = models.ForeignKey("academics.Subject", on_delete=models.PROTECT, related_name="+")
    teacher = models.ForeignKey(
        "teachers.Teacher", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=6, choices=Type.choices)
    file = models.ForeignKey(
        "files.StoredFile", null=True, blank=True, on_delete=models.PROTECT, related_name="materials"
    )
    url = models.URLField(blank=True)
    is_shared = models.BooleanField(default=True)  # visible to students/parents
    views = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class LessonPlan(TenantBaseModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        APPROVED = "approved", "Approved"
        CHANGES_REQUESTED = "changes_requested", "Changes requested"

    teacher = models.ForeignKey("teachers.Teacher", on_delete=models.CASCADE, related_name="lesson_plans")
    class_level = models.ForeignKey("academics.ClassLevel", on_delete=models.PROTECT, related_name="+")
    section = models.ForeignKey(
        "academics.Section", null=True, blank=True, on_delete=models.PROTECT, related_name="+"
    )
    subject = models.ForeignKey("academics.Subject", on_delete=models.PROTECT, related_name="+")
    week_start = models.DateField()
    topic = models.CharField(max_length=200)
    objectives = models.JSONField(default=list, blank=True)
    materials = models.JSONField(default=list, blank=True)
    homework = models.TextField(blank=True)
    status = models.CharField(max_length=18, choices=Status.choices, default=Status.DRAFT)
    review_note = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        "accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-week_start"]
