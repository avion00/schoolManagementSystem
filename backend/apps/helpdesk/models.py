"""Help desk tickets with SLA targets, replies, internal notes and history."""
import datetime

from django.db import models
from django.utils import timezone

from apps.core.models import TenantBaseModel, TimeStampedModel, UUIDModel

SLA_HOURS = {"urgent": 2, "high": 8, "normal": 24, "low": 48}


class Ticket(TenantBaseModel):
    class Category(models.TextChoices):
        STUDENT = "student", "Student Issue"
        PARENT = "parent", "Parent Issue"
        TEACHER_COMPLAINT = "teacher_complaint", "Teacher Complaint"
        STAFF_REQUEST = "staff_request", "Staff Request"
        ATTENDANCE = "attendance", "Attendance Problem"
        EXAM = "exam", "Exam / Result Problem"
        FEES = "fees", "Fee / Payment Problem"
        LIBRARY = "library", "Library Issue"
        TRANSPORT = "transport", "Transport Issue"
        HOSTEL = "hostel", "Hostel Issue"
        ACCOUNT = "account", "Account/Login Issue"
        BUG = "bug", "Technical Bug"
        DATA_CORRECTION = "data_correction", "Data Correction Request"
        EMERGENCY = "emergency", "Emergency / Safety"
        OTHER = "other", "Other"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        NORMAL = "normal", "Normal"
        HIGH = "high", "High"
        URGENT = "urgent", "Urgent"

    class Status(models.TextChoices):
        NEW = "new", "New"
        OPEN = "open", "Open"
        IN_PROGRESS = "in_progress", "In Progress"
        WAITING_USER = "waiting_user", "Waiting for User"
        WAITING_DEPARTMENT = "waiting_department", "Waiting for Department"
        ESCALATED = "escalated", "Escalated"
        RESOLVED = "resolved", "Resolved"
        CLOSED = "closed", "Closed"

    class Source(models.TextChoices):
        WEB = "web", "Web Portal"
        MOBILE = "mobile", "Mobile App"
        EMAIL = "email", "Email"
        PHONE = "phone", "Phone Call"
        WALK_IN = "walk_in", "Walk-in Office"
        ADMIN = "admin", "Admin Created"

    class Department(models.TextChoices):
        ACADEMICS = "academics", "Academics"
        ACCOUNTS = "accounts", "Accounts"
        LIBRARY = "library", "Library"
        TRANSPORT = "transport", "Transport"
        HOSTEL = "hostel", "Hostel"
        ADMINISTRATION = "administration", "Administration"
        IT = "it", "IT"
        EXAMINATION = "examination", "Examination"
        HR = "hr", "HR"

    code = models.CharField(max_length=40, blank=True, db_index=True)
    requester = models.ForeignKey("accounts.User", on_delete=models.PROTECT, related_name="tickets")
    related_student = models.ForeignKey(
        "students.Student", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    category = models.CharField(max_length=18, choices=Category.choices, default=Category.OTHER)
    module = models.CharField(max_length=40, blank=True)
    department = models.CharField(max_length=16, choices=Department.choices, blank=True)
    subject = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=8, choices=Priority.choices, default=Priority.NORMAL)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW, db_index=True)
    source = models.CharField(max_length=8, choices=Source.choices, default=Source.WEB)
    assignee = models.ForeignKey(
        "accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="assigned_tickets"
    )
    due_at = models.DateTimeField()  # first-response target
    first_response_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    resolution_note = models.TextField(blank=True)
    rating = models.PositiveSmallIntegerField(null=True, blank=True)  # 1–5
    attachments = models.ManyToManyField("files.StoredFile", blank=True, related_name="tickets")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.code} {self.subject}"

    def set_sla(self, start=None):
        self.due_at = (start or timezone.now()) + datetime.timedelta(hours=SLA_HOURS[self.priority])

    @property
    def sla_status(self):
        if self.first_response_at or self.status in (self.Status.RESOLVED, self.Status.CLOSED):
            return "met" if self.first_response_at and self.first_response_at <= self.due_at else (
                "breached" if self.first_response_at else "n/a")
        now = timezone.now()
        if now > self.due_at:
            return "overdue"
        window = datetime.timedelta(hours=SLA_HOURS[self.priority])
        return "due_soon" if self.due_at - now <= window / 4 else "on_track"


class TicketMessage(UUIDModel, TimeStampedModel):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="messages")
    author = models.ForeignKey("accounts.User", null=True, on_delete=models.SET_NULL, related_name="+")
    body = models.TextField()
    is_internal = models.BooleanField(default=False)  # agents only
    attachments = models.ManyToManyField("files.StoredFile", blank=True, related_name="ticket_messages")

    class Meta:
        ordering = ["created_at"]


class TicketEvent(UUIDModel, TimeStampedModel):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="events")
    actor = models.ForeignKey("accounts.User", null=True, on_delete=models.SET_NULL, related_name="+")
    action = models.CharField(max_length=40)
    detail = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["created_at"]
