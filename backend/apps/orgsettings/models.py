from django.db import models

from apps.core.models import TimeStampedModel, UUIDModel


class OrganizationSettings(UUIDModel, TimeStampedModel):
    """Per-school configuration. Stored sparsely: only values that differ
    from DEFAULTS (see defaults.py) are kept, so new defaults reach everyone."""

    organization = models.OneToOneField("accounts.Organization", on_delete=models.CASCADE,
                                        related_name="settings")
    data = models.JSONField(default=dict, blank=True)
    updated_by = models.ForeignKey("accounts.User", null=True, blank=True, on_delete=models.SET_NULL,
                                   related_name="+")
