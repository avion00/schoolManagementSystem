"""Uploaded files (school.md §7.10 file upload rules).

Files are stored under random names outside any public URL and served only
through FileDownloadView, which asks the registered access checkers whether
the requesting user may read the file.
"""
import uuid

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel, UUIDModel


def upload_path(instance, filename):
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "bin"
    return f"uploads/{instance.organization_id}/{instance.created_at:%Y/%m}/{uuid.uuid4().hex}.{ext}"


class StoredFile(UUIDModel, TimeStampedModel):
    class Kind(models.TextChoices):
        PDF = "pdf", "PDF"
        IMAGE = "image", "Image"
        DOC = "doc", "Document"
        SHEET = "sheet", "Spreadsheet"
        SLIDES = "slides", "Slides"
        VIDEO = "video", "Video"
        AUDIO = "audio", "Audio"
        TEXT = "text", "Text"

    organization = models.ForeignKey("accounts.Organization", on_delete=models.CASCADE, related_name="+")
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="+"
    )
    file = models.FileField(upload_to=upload_path, max_length=255)
    original_name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=100)
    kind = models.CharField(max_length=8, choices=Kind.choices)
    size = models.PositiveBigIntegerField()
    sha256 = models.CharField(max_length=64)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.original_name
