"""Class routine / timetable (school.md §7.7).

A PeriodSlot is a time block in a shift (e.g. Morning, period 3, 08:15–09:00).
A RoutineEntry puts a subject, teacher and room into one section's slot on a
weekday. Conflict rules: one entry per section per slot, and a teacher or room
can't be in two places at overlapping times.
"""
from django.db import models

from apps.core.models import TenantBaseModel


class Day(models.TextChoices):
    SUNDAY = "sunday", "Sunday"
    MONDAY = "monday", "Monday"
    TUESDAY = "tuesday", "Tuesday"
    WEDNESDAY = "wednesday", "Wednesday"
    THURSDAY = "thursday", "Thursday"
    FRIDAY = "friday", "Friday"
    SATURDAY = "saturday", "Saturday"


class PeriodSlot(TenantBaseModel):
    class Shift(models.TextChoices):
        MORNING = "morning", "Morning"
        DAY = "day", "Day"
        EVENING = "evening", "Evening"

    shift = models.CharField(max_length=10, choices=Shift.choices, default=Shift.DAY)
    period_no = models.PositiveSmallIntegerField()
    label = models.CharField(max_length=40, blank=True)  # e.g. "1st", "Lunch"
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_break = models.BooleanField(default=False)

    class Meta:
        ordering = ["shift", "start_time"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "shift", "period_no"], condition=models.Q(is_active=True),
                name="uniq_active_period_slot",
            )
        ]

    def __str__(self):
        return f"{self.get_shift_display()} P{self.period_no} {self.start_time:%H:%M}-{self.end_time:%H:%M}"

    @property
    def duration_minutes(self):
        start = self.start_time.hour * 60 + self.start_time.minute
        end = self.end_time.hour * 60 + self.end_time.minute
        return end - start


class RoutineEntry(TenantBaseModel):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        SUSPENDED = "suspended", "Suspended"

    academic_year = models.ForeignKey(
        "academics.AcademicYear", on_delete=models.CASCADE, related_name="routine_entries"
    )
    section = models.ForeignKey(
        "academics.Section", on_delete=models.CASCADE, related_name="routine_entries"
    )
    day = models.CharField(max_length=10, choices=Day.choices)
    period = models.ForeignKey(PeriodSlot, on_delete=models.PROTECT, related_name="entries")
    subject = models.ForeignKey(
        "academics.Subject", on_delete=models.PROTECT, related_name="routine_entries"
    )
    teacher = models.ForeignKey(
        "teachers.Teacher", null=True, blank=True, on_delete=models.SET_NULL,
        related_name="routine_entries",
    )
    room = models.ForeignKey(
        "exams.ExamRoom", null=True, blank=True, on_delete=models.SET_NULL,
        related_name="routine_entries",
    )
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)
    notes = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["day", "period__start_time"]
        constraints = [
            models.UniqueConstraint(
                fields=["academic_year", "section", "day", "period"],
                condition=models.Q(is_active=True, status="active"),
                name="uniq_active_routine_slot_per_section",
            )
        ]
        indexes = [models.Index(fields=["organization", "day"])]

    def __str__(self):
        return f"{self.section} {self.day} {self.period} {self.subject}"
