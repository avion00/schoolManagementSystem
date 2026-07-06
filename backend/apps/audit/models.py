"""Audit logging (school.md §7.19).

Captures who did what, when, from where, and (for changes) old vs new values.
Records are append-only — never edited or deleted in normal operation.
"""
from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel, UUIDModel


class AuditLog(UUIDModel, TimeStampedModel):
    organization = models.ForeignKey(
        "accounts.Organization", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="audit_logs",
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="audit_logs",
    )
    action = models.CharField(max_length=100, db_index=True)  # e.g. auth.login
    object_type = models.CharField(max_length=100, blank=True)
    object_id = models.CharField(max_length=64, blank=True)
    changes = models.JSONField(default=dict, blank=True)  # {field: [old, new]}
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "action"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.action} by {self.actor_id} @ {self.created_at:%Y-%m-%d %H:%M}"
