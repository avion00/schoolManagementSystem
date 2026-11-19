"""Academic structure (school.md §7.6): year → class level → section, plus
subjects, the subjects each class takes per year, and syllabus units."""
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

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Only one current academic year per school.
        if self.is_current:
            AcademicYear.objects.filter(
                organization_id=self.organization_id, school_id=self.school_id, is_current=True,
            ).exclude(pk=self.pk).update(is_current=False)


class ClassLevel(TenantBaseModel):
    class Medium(models.TextChoices):
        ENGLISH = "english", "English"
        NEPALI = "nepali", "Nepali"
        BILINGUAL = "bilingual", "Bilingual"

    class Shift(models.TextChoices):
        MORNING = "morning", "Morning"
        DAY = "day", "Day"
        EVENING = "evening", "Evening"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        SUSPENDED = "suspended", "Suspended"

    name = models.CharField(max_length=64)  # e.g. "Grade 8"
    code = models.CharField(max_length=20, blank=True)
    order = models.PositiveIntegerField(default=0)  # grade level, used for sorting
    medium = models.CharField(max_length=12, choices=Medium.choices, blank=True)
    shift = models.CharField(max_length=10, choices=Shift.choices, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)
    building = models.CharField(max_length=80, blank=True)
    main_room = models.CharField(max_length=40, blank=True)
    description = models.TextField(blank=True)

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
    code = models.CharField(max_length=20, blank=True)
    room = models.CharField(max_length=40, blank=True)
    capacity = models.PositiveIntegerField(null=True, blank=True)  # null = unlimited

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
    class Type(models.TextChoices):
        THEORY = "theory", "Theory"
        PRACTICAL = "practical", "Practical"
        BOTH = "theory_practical", "Theory + Practical"

    class Category(models.TextChoices):
        COMPULSORY = "compulsory", "Compulsory"
        OPTIONAL = "optional", "Optional"
        LANGUAGE = "language", "Language"
        SCIENCE = "science", "Science"
        COMMERCE = "commerce", "Commerce"
        TECHNICAL = "technical", "Technical"
        EXTRA_CURRICULAR = "extra_curricular", "Extra-curricular"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        DRAFT = "draft", "Draft"
        ARCHIVED = "archived", "Archived"

    name = models.CharField(max_length=120)
    code = models.CharField(max_length=32)
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.THEORY)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.COMPULSORY)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)
    description = models.TextField(blank=True)
    department = models.CharField(max_length=120, blank=True)
    # Default marking scheme (a class can override full/pass via ClassSubject).
    full_marks = models.DecimalField(max_digits=6, decimal_places=2, default=100)
    pass_marks = models.DecimalField(max_digits=6, decimal_places=2, default=40)
    theory_marks = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    practical_marks = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    internal_marks = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    credit_hours = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    exam_duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    gpa_enabled = models.BooleanField(default=True)
    practical_required = models.BooleanField(default=False)
    project_required = models.BooleanField(default=False)
    viva_required = models.BooleanField(default=False)
    assignment_required = models.BooleanField(default=False)

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


class ClassSubject(TenantBaseModel):
    """A subject in a class's curriculum for one academic year."""

    academic_year = models.ForeignKey(
        AcademicYear, on_delete=models.CASCADE, related_name="class_subjects"
    )
    class_level = models.ForeignKey(
        ClassLevel, on_delete=models.CASCADE, related_name="class_subjects"
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="class_subjects")
    is_optional = models.BooleanField(default=False)
    weekly_periods = models.PositiveSmallIntegerField(default=0)
    # Overrides of the subject's default scheme for this class (null = use subject's).
    full_marks = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    pass_marks = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    class Meta:
        ordering = ["class_level__order", "subject__name"]
        constraints = [
            models.UniqueConstraint(
                fields=["academic_year", "class_level", "subject"],
                condition=models.Q(is_active=True),
                name="uniq_active_class_subject",
            )
        ]

    def __str__(self):
        return f"{self.class_level} · {self.subject}"

    @property
    def effective_full_marks(self):
        return self.full_marks if self.full_marks is not None else self.subject.full_marks

    @property
    def effective_pass_marks(self):
        return self.pass_marks if self.pass_marks is not None else self.subject.pass_marks


class SyllabusUnit(TenantBaseModel):
    class Status(models.TextChoices):
        NOT_STARTED = "not_started", "Not started"
        IN_PROGRESS = "in_progress", "In progress"
        COMPLETED = "completed", "Completed"

    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="syllabus_units")
    class_level = models.ForeignKey(
        ClassLevel, null=True, blank=True, on_delete=models.CASCADE, related_name="syllabus_units"
    )
    unit_no = models.PositiveSmallIntegerField()
    title = models.CharField(max_length=200)
    topics = models.JSONField(default=list, blank=True)  # list[str]
    estimated_periods = models.PositiveSmallIntegerField(default=0)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.NOT_STARTED)

    class Meta:
        ordering = ["subject", "class_level", "unit_no"]
        constraints = [
            models.UniqueConstraint(
                fields=["subject", "class_level", "unit_no"],
                condition=models.Q(is_active=True),
                name="uniq_active_syllabus_unit",
            )
        ]

    def __str__(self):
        return f"{self.subject} · Unit {self.unit_no}: {self.title}"
