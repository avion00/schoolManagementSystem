"""Teacher / staff records and their class/subject assignments (school.md §7.5)."""
from django.conf import settings
from django.db import models

from apps.core.models import TenantBaseModel


class Teacher(TenantBaseModel):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        ON_LEAVE = "on_leave", "On leave"
        RESIGNED = "resigned", "Resigned"
        TERMINATED = "terminated", "Terminated"

    # Optional link to a login account.
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="teacher_profile",
    )
    full_name = models.CharField(max_length=255)
    employee_id = models.CharField(max_length=40)
    department = models.CharField(max_length=120, blank=True)
    designation = models.CharField(max_length=120, blank=True)
    qualification = models.CharField(max_length=255, blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    joining_date = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.ACTIVE, db_index=True
    )

    class Meta:
        ordering = ["full_name"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "employee_id"],
                name="uniq_employee_id_per_org",
            )
        ]

    def __str__(self):
        return f"{self.full_name} ({self.employee_id})"


class TeacherAssignment(TenantBaseModel):
    teacher = models.ForeignKey(
        Teacher, on_delete=models.CASCADE, related_name="assignments"
    )
    academic_year = models.ForeignKey(
        "academics.AcademicYear", on_delete=models.CASCADE, related_name="teacher_assignments"
    )
    class_level = models.ForeignKey(
        "academics.ClassLevel", on_delete=models.CASCADE, related_name="teacher_assignments"
    )
    section = models.ForeignKey(
        "academics.Section", null=True, blank=True,
        on_delete=models.CASCADE, related_name="teacher_assignments",
    )
    subject = models.ForeignKey(
        "academics.Subject", null=True, blank=True,
        on_delete=models.CASCADE, related_name="teacher_assignments",
    )
    is_class_teacher = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["teacher", "academic_year", "class_level", "section", "subject"],
                name="uniq_teacher_assignment",
            )
        ]

    def __str__(self):
        return f"{self.teacher} → {self.class_level} {self.subject or ''}".strip()
