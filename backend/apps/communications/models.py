"""Notices (school.md §7.16) and in-app notifications.

Notices target an audience (role groups, optionally narrowed to classes /
sections). Visibility is resolved at query time and read receipts are written
only when someone opens a notice, so publishing to the whole school doesn't
fan out thousands of rows.
"""
from django.conf import settings
from django.db import models

from apps.core.models import TenantBaseModel, TimeStampedModel, UUIDModel


class Notice(TenantBaseModel):
    class Category(models.TextChoices):
        GENERAL = "general", "General"
        EXAM = "exam", "Exam"
        FEES = "fees", "Fees"
        HOLIDAY = "holiday", "Holiday"
        EVENT = "event", "Event"
        MEETING = "meeting", "Meeting"
        EMERGENCY = "emergency", "Emergency"
        ACADEMIC = "academic", "Academic"
        TRANSPORT = "transport", "Transport"
        HOSTEL = "hostel", "Hostel"
        LIBRARY = "library", "Library"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        NORMAL = "normal", "Normal"
        HIGH = "high", "High"
        URGENT = "urgent", "Urgent"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SCHEDULED = "scheduled", "Scheduled"
        PUBLISHED = "published", "Published"
        ARCHIVED = "archived", "Archived"

    class Audience(models.TextChoices):
        ALL = "all", "All"
        STUDENTS = "students", "Students"
        PARENTS = "parents", "Parents"
        TEACHERS = "teachers", "Teachers"
        STAFF = "staff", "Staff"
        STUDENTS_PARENTS = "students_parents", "Students & Parents"

    code = models.CharField(max_length=40, blank=True, db_index=True)
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=12, choices=Category.choices, default=Category.GENERAL)
    priority = models.CharField(max_length=8, choices=Priority.choices, default=Priority.NORMAL)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT, db_index=True)
    audience = models.CharField(max_length=20, choices=Audience.choices, default=Audience.ALL)
    target_class_levels = models.ManyToManyField("academics.ClassLevel", blank=True, related_name="+")
    target_sections = models.ManyToManyField("academics.Section", blank=True, related_name="+")
    summary = models.CharField(max_length=300, blank=True)
    body = models.TextField()
    instructions = models.TextField(blank=True)
    external_link = models.URLField(blank=True)
    publish_at = models.DateTimeField(null=True, blank=True, db_index=True)
    expires_on = models.DateField(null=True, blank=True)
    pinned = models.BooleanField(default=False)
    requires_acknowledgement = models.BooleanField(default=False)
    send_notification = models.BooleanField(default=True)
    send_email = models.BooleanField(default=False)
    send_sms = models.BooleanField(default=False)
    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    notified_at = models.DateTimeField(null=True, blank=True)
    internal_notes = models.TextField(blank=True)
    attachments = models.ManyToManyField("files.StoredFile", blank=True, related_name="notices")

    class Meta:
        ordering = ["-pinned", "-publish_at", "-created_at"]

    def __str__(self):
        return self.title


class NoticeReceipt(UUIDModel, TimeStampedModel):
    notice = models.ForeignKey(Notice, on_delete=models.CASCADE, related_name="receipts")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="+")
    read_at = models.DateTimeField(auto_now_add=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["notice", "user"], name="uniq_notice_receipt")
        ]


class Notification(UUIDModel, TimeStampedModel):
    """One in-app message for one user."""

    class Category(models.TextChoices):
        ATTENDANCE = "attendance", "Attendance"
        EXAMS = "exams", "Exams"
        FEES = "fees", "Fees"
        NOTICES = "notices", "Notices"
        MESSAGES = "messages", "Messages"
        APPROVALS = "approvals", "Approvals"
        SECURITY = "security", "Security"
        SYSTEM = "system", "System"

    class Type(models.TextChoices):
        INFO = "info", "Info"
        SUCCESS = "success", "Success"
        WARNING = "warning", "Warning"
        ERROR = "error", "Error"
        APPROVAL = "approval", "Approval"
        REMINDER = "reminder", "Reminder"

    organization = models.ForeignKey(
        "accounts.Organization", null=True, blank=True, on_delete=models.CASCADE, related_name="+"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    category = models.CharField(max_length=12, choices=Category.choices, default=Category.SYSTEM)
    type = models.CharField(max_length=10, choices=Type.choices, default=Type.INFO)
    priority = models.CharField(max_length=8, choices=Notice.Priority.choices, default=Notice.Priority.NORMAL)
    related_type = models.CharField(max_length=40, blank=True)
    related_id = models.CharField(max_length=64, blank=True)
    action_url = models.CharField(max_length=255, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    archived_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "read_at", "archived_at"])]

    def __str__(self):
        return f"{self.user_id}: {self.title}"
