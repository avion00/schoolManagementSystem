"""Academic structure (school.md §7.6): year → class level → section, plus subjects."""
from django.db import models

from apps.core.models import TenantBaseModel


class AcademicYear(TenantBaseModel):
    name = models.CharField(max_length=32)  # e.g. "2025-2026"
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)

    class Meta:
        ordering = ["-start_date"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "school", "name"],
                name="uniq_academic_year_per_school",
            )
        ]

    def __str__(self):
        return self.name


class ClassLevel(TenantBaseModel):
    name = models.CharField(max_length=64)  # e.g. "Grade 8"
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "school", "name"],
                name="uniq_classlevel_per_school",
            )
        ]

    def __str__(self):
        return self.name


class Section(TenantBaseModel):
    class_level = models.ForeignKey(
        ClassLevel, on_delete=models.CASCADE, related_name="sections"
    )
    name = models.CharField(max_length=16)  # e.g. "A"

    class Meta:
        ordering = ["class_level__order", "name"]
        constraints = [
            models.UniqueConstraint(
                fields=["class_level", "name"], name="uniq_section_per_classlevel"
            )
        ]

    def __str__(self):
        return f"{self.class_level.name} - {self.name}"


class Subject(TenantBaseModel):
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=32)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "school", "code"],
                name="uniq_subject_code_per_school",
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"
