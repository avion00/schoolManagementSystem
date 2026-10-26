"""Teacher / staff records and their class/subject assignments (school.md §7.5)."""
from django.conf import settings
from django.db import models

from apps.core.models import TenantBaseModel


class Teacher(TenantBaseModel):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        ON_LEAVE = "on_leave", "On leave"
        INACTIVE = "inactive", "Inactive"
        RESIGNED = "resigned", "Resigned"
        TERMINATED = "terminated", "Terminated"

    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        OTHER = "other", "Other"

    class EmploymentType(models.TextChoices):
        FULL_TIME = "full_time", "Full-time"
        PART_TIME = "part_time", "Part-time"
        CONTRACT = "contract", "Contract"
        SUBSTITUTE = "substitute", "Substitute"

    class MaritalStatus(models.TextChoices):
        SINGLE = "single", "Single"
        MARRIED = "married", "Married"
        DIVORCED = "divorced", "Divorced"
        WIDOWED = "widowed", "Widowed"

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
    employment_type = models.CharField(
        max_length=12, choices=EmploymentType.choices, default=EmploymentType.FULL_TIME
    )
    primary_subject = models.ForeignKey(
        "academics.Subject", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="primary_teachers",
    )
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.ACTIVE, db_index=True
    )

    # Personal
    gender = models.CharField(max_length=10, choices=Gender.choices, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    blood_group = models.CharField(max_length=8, blank=True)
    nationality = models.CharField(max_length=64, blank=True)
    religion = models.CharField(max_length=64, blank=True)
    marital_status = models.CharField(max_length=10, choices=MaritalStatus.choices, blank=True)
    spouse_name = models.CharField(max_length=120, blank=True)
    address = models.TextField(blank=True)
    permanent_address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=32, blank=True)
    emergency_relation = models.CharField(max_length=64, blank=True)

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


class StaffAttendance(TenantBaseModel):
    """Daily attendance for teachers / staff (school.md §7.5, §7.8)."""

    class Status(models.TextChoices):
        PRESENT = "present", "Present"
        ABSENT = "absent", "Absent"
        LATE = "late", "Late"
        HALF_DAY = "half_day", "Half Day"
        LEAVE = "leave", "Leave"
        HOLIDAY = "holiday", "Holiday"

    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name="attendances")
    date = models.DateField(db_index=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PRESENT)
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    remark = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-date"]
        constraints = [
            models.UniqueConstraint(
                fields=["teacher", "date"], condition=models.Q(is_active=True),
                name="uniq_staff_attendance_teacher_date",
            )
        ]
        indexes = [models.Index(fields=["organization", "date"])]

    def __str__(self):
        return f"{self.teacher_id} {self.date} {self.status}"
