"""Reusable abstract base models (school.md §8.1).

Every important record gets: UUID pk, created/updated timestamps, created_by /
updated_by, and soft delete. Tenant-scoped records additionally carry
organization (and optionally school) for multi-tenant isolation (school.md §6).
"""
import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.core.managers import AllObjectsManager, SoftDeleteManager


class UUIDModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class AuthorStampedModel(models.Model):
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, editable=False,
        related_name="+", on_delete=models.SET_NULL,
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, editable=False,
        related_name="+", on_delete=models.SET_NULL,
    )

    class Meta:
        abstract = True


class SoftDeleteModel(models.Model):
    is_active = models.BooleanField(default=True, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True, editable=False)

    objects = SoftDeleteManager()
    all_objects = AllObjectsManager()

    class Meta:
        abstract = True

    def soft_delete(self):
        self.is_active = False
        self.deleted_at = timezone.now()
        self.save(update_fields=["is_active", "deleted_at", "updated_at"])

    def restore(self):
        self.is_active = True
        self.deleted_at = None
        self.save(update_fields=["is_active", "deleted_at", "updated_at"])


class BaseModel(UUIDModel, TimeStampedModel, AuthorStampedModel, SoftDeleteModel):
    """UUID + timestamps + author + soft delete. Use for non-tenant records."""

    class Meta:
        abstract = True


class TenantBaseModel(BaseModel):
    """BaseModel + tenant scoping. Use for all per-school data."""

    organization = models.ForeignKey(
        "accounts.Organization", on_delete=models.CASCADE, related_name="%(class)ss",
    )
    school = models.ForeignKey(
        "accounts.School", null=True, blank=True,
        on_delete=models.CASCADE, related_name="%(class)ss",
    )

    class Meta:
        abstract = True
