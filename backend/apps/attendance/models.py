"""Daily student attendance (school.md §7.8)."""
from django.db import models

from apps.core.models import TenantBaseModel


class Attendance(TenantBaseModel):
    class Status(models.TextChoices):
        PRESENT = "present", "Present"
        ABSENT = "absent", "Absent"
        LATE = "late", "Late"
        HALF_DAY = "half_day", "Half Day"
        LEAVE = "leave", "Leave"
        HOLIDAY = "holiday", "Holiday"
        EXCUSED = "excused", "Excused"

    student = models.ForeignKey(
        "students.Student", on_delete=models.CASCADE, related_name="attendances"
    )
    date = models.DateField(db_index=True)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.PRESENT
    )
    remark = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-date"]
        constraints = [
            models.UniqueConstraint(
                fields=["student", "date"], name="uniq_attendance_student_date"
            )
        ]
        indexes = [models.Index(fields=["organization", "date"])]

    def __str__(self):
        return f"{self.student_id} {self.date} {self.status}"
