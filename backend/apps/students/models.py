"""Student records (school.md §7.3).

Constraints enforce real-world rules (school.md §8.2):
  - admission_number unique per organization
  - roll_number unique per (organization, class_level, section, academic_year)
"""
from django.conf import settings
from django.db import models

from apps.core.models import TenantBaseModel


class Student(TenantBaseModel):
    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        GRADUATED = "graduated", "Graduated"
        TRANSFERRED = "transferred", "Transferred"
        SUSPENDED = "suspended", "Suspended"
        LEFT = "left", "Left"

    # Identity
    first_name = models.CharField(max_length=80)
    middle_name = models.CharField(max_length=80, blank=True)
    last_name = models.CharField(max_length=80)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=Gender.choices, blank=True)
    blood_group = models.CharField(max_length=8, blank=True)
    nationality = models.CharField(max_length=64, blank=True)
    religion = models.CharField(max_length=64, blank=True)

    # Contact
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)

    # Enrollment
    admission_number = models.CharField(max_length=40)
    roll_number = models.CharField(max_length=20, blank=True)
    academic_year = models.ForeignKey(
        "academics.AcademicYear", on_delete=models.PROTECT, related_name="students"
    )
    class_level = models.ForeignKey(
        "academics.ClassLevel", on_delete=models.PROTECT, related_name="students"
    )
    section = models.ForeignKey(
        "academics.Section", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="students",
    )
    primary_guardian = models.ForeignKey(
        "guardians.Guardian", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="students",
    )
    # Optional login account so the student can access their own portal.
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="student_profile",
    )

    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.ACTIVE, db_index=True
    )

    class Meta:
        ordering = ["first_name", "last_name"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "admission_number"],
                name="uniq_admission_number_per_org",
            ),
            models.UniqueConstraint(
                fields=["organization", "class_level", "section", "academic_year", "roll_number"],
                condition=~models.Q(roll_number=""),
                name="uniq_roll_number_per_class_section_year",
            ),
        ]
        indexes = [
            models.Index(fields=["organization", "status"]),
            models.Index(fields=["class_level", "section"]),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.admission_number})"

    @property
    def full_name(self):
        parts = [self.first_name, self.middle_name, self.last_name]
        return " ".join(p for p in parts if p)
