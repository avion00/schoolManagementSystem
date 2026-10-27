"""In-app messaging (school.md §7.16): direct chats, groups, broadcasts,
message requests and moderation.

Safety model: who may start a conversation with whom is decided by
`policy.py` from real profiles (a parent may message their child's teachers,
not arbitrary adults). Anything outside the policy goes through a
MessageRequest the recipient approves.
"""
from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel, UUIDModel

DEFAULT_GROUP_PERMISSIONS = {
    "who_can_send": "everyone",            # everyone | admins
    "who_can_add_members": "admins",       # everyone | admins
    "who_can_delete_messages": "own",      # own | admins
}


class Conversation(UUIDModel, TimeStampedModel):
    class Type(models.TextChoices):
        DIRECT = "direct", "Direct"
        GROUP = "group", "Group"
        CLASS_GROUP = "class_group", "Class group"
        STAFF_GROUP = "staff_group", "Staff group"
        PARENT_TEACHER = "parent_teacher", "Parent–teacher"
        BROADCAST = "broadcast", "Broadcast"
        SUPPORT = "support", "Support request"

    organization = models.ForeignKey(
        "accounts.Organization", on_delete=models.CASCADE, related_name="+"
    )
    type = models.CharField(max_length=16, choices=Type.choices, default=Type.DIRECT)
    title = models.CharField(max_length=150, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="+"
    )
    is_locked = models.BooleanField(default=False)  # read-only (moderation)
    priority = models.CharField(max_length=8, default="normal")
    permissions = models.JSONField(default=dict, blank=True)
    related_student = models.ForeignKey(
        "students.Student", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    related_section = models.ForeignKey(
        "academics.Section", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    last_message_at = models.DateTimeField(null=True, blank=True, db_index=True)
    # For direct chats: sorted "<uuid>:<uuid>" so a pair has exactly one conversation.
    direct_key = models.CharField(max_length=80, null=True, blank=True)

    class Meta:
        ordering = ["-last_message_at", "-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "direct_key"], name="uniq_direct_conversation"
            )
        ]

    def __str__(self):
        return self.title or f"{self.type} {self.pk}"

    def perm(self, key):
        return {**DEFAULT_GROUP_PERMISSIONS, **(self.permissions or {})}[key]


class Participant(UUIDModel, TimeStampedModel):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="participants")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chat_memberships")
    is_admin = models.BooleanField(default=False)
    last_read_at = models.DateTimeField(null=True, blank=True)
    pinned = models.BooleanField(default=False)
    muted = models.BooleanField(default=False)
    archived = models.BooleanField(default=False)
    left_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["conversation", "user"], name="uniq_participant")
        ]


class Message(UUIDModel, TimeStampedModel):
    class Type(models.TextChoices):
        TEXT = "text", "Text"
        SYSTEM = "system", "System"

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="+"
    )
    type = models.CharField(max_length=8, choices=Type.choices, default=Type.TEXT)
    body = models.TextField(blank=True)
    attachments = models.ManyToManyField("files.StoredFile", blank=True, related_name="messages")
    reply_to = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    edited_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    is_pinned = models.BooleanField(default=False)

    class Meta:
        ordering = ["created_at"]
        indexes = [models.Index(fields=["conversation", "created_at"])]


class Reaction(UUIDModel, TimeStampedModel):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="reactions")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="+")
    emoji = models.CharField(max_length=16)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["message", "user", "emoji"], name="uniq_reaction")
        ]


class MessageRequest(UUIDModel, TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        BLOCKED = "blocked", "Blocked"

    organization = models.ForeignKey("accounts.Organization", on_delete=models.CASCADE, related_name="+")
    from_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="+")
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="+")
    reason = models.CharField(max_length=500)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    decided_at = models.DateTimeField(null=True, blank=True)
    conversation = models.ForeignKey(Conversation, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")

    class Meta:
        ordering = ["-created_at"]


class ModerationReport(UUIDModel, TimeStampedModel):
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        DISMISSED = "dismissed", "Dismissed"
        ACTIONED = "actioned", "Actioned"

    organization = models.ForeignKey("accounts.Organization", on_delete=models.CASCADE, related_name="+")
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="reports")
    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="+")
    reason = models.CharField(max_length=500)
    priority = models.CharField(max_length=8, default="normal")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.OPEN)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    resolution = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["message", "reported_by"], name="uniq_report_per_reporter")
        ]
