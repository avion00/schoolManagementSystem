"""Guardian / parent records (school.md §7.4).

A guardian can be linked to many students (their children) via the reverse
relation Student.primary_guardian.
"""
from django.db import models

from apps.core.models import TenantBaseModel


class Guardian(TenantBaseModel):
    class Relation(models.TextChoices):
        FATHER = "father", "Father"
        MOTHER = "mother", "Mother"
        GUARDIAN = "guardian", "Guardian"
        OTHER = "other", "Other"

    full_name = models.CharField(max_length=255)
    relation = models.CharField(
        max_length=16, choices=Relation.choices, default=Relation.GUARDIAN
    )
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    occupation = models.CharField(max_length=120, blank=True)
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=32, blank=True)

    class Meta:
        ordering = ["full_name"]

    def __str__(self):
        return f"{self.full_name} ({self.get_relation_display()})"
