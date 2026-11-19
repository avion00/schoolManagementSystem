"""Guardian / parent records (school.md §7.4).

A guardian can be linked to many students and a student to many guardians via
StudentGuardian; the link carries the relation and which guardian is primary.
A guardian may get a portal login (`user`) to follow their children.
"""
from django.conf import settings
from django.db import models

from apps.core.models import TenantBaseModel


class Relation(models.TextChoices):
    FATHER = "father", "Father"
    MOTHER = "mother", "Mother"
    GUARDIAN = "guardian", "Guardian"
    UNCLE = "uncle", "Uncle"
    AUNT = "aunt", "Aunt"
    GRANDFATHER = "grandfather", "Grandfather"
    GRANDMOTHER = "grandmother", "Grandmother"
    SIBLING = "sibling", "Sibling"
    OTHER = "other", "Other"


class Guardian(TenantBaseModel):
    # Kept as an alias so `Guardian.Relation` continues to work.
    Relation = Relation

    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        BLOCKED = "blocked", "Blocked"  # portal access suspended

    guardian_code = models.CharField(max_length=40, blank=True, db_index=True)
    full_name = models.CharField(max_length=255)
    gender = models.CharField(max_length=10, choices=Gender.choices, blank=True)
    relation = models.CharField(
        max_length=16, choices=Relation.choices, default=Relation.GUARDIAN
    )
    phone = models.CharField(max_length=32, blank=True)
    alternate_phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    occupation = models.CharField(max_length=120, blank=True)
    nationality = models.CharField(max_length=64, blank=True)
    religion = models.CharField(max_length=64, blank=True)
    address = models.TextField(blank=True)
    permanent_address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=32, blank=True)
    emergency_relation = models.CharField(max_length=64, blank=True)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.ACTIVE, db_index=True
    )
    notes = models.TextField(blank=True)  # staff-only
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="guardian_profile",
    )

    class Meta:
        ordering = ["full_name"]

    def __str__(self):
        return f"{self.full_name} ({self.get_relation_display()})"


class StudentGuardian(TenantBaseModel):
    student = models.ForeignKey(
        "students.Student", on_delete=models.CASCADE, related_name="guardian_links"
    )
    guardian = models.ForeignKey(
        Guardian, on_delete=models.CASCADE, related_name="student_links"
    )
    relation = models.CharField(max_length=16, choices=Relation.choices)
    is_primary = models.BooleanField(default=False)
    is_emergency_contact = models.BooleanField(default=False)

    class Meta:
        ordering = ["-is_primary", "created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["student", "guardian"], condition=models.Q(is_active=True),
                name="uniq_active_student_guardian",
            ),
            models.UniqueConstraint(
                fields=["student"], condition=models.Q(is_active=True, is_primary=True),
                name="uniq_primary_guardian_per_student",
            ),
        ]

    def __str__(self):
        return f"{self.guardian} → {self.student}"
