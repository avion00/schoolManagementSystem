from rest_framework import serializers

from .models import StoredFile


class UploadSerializer(serializers.Serializer):
    file = serializers.FileField()


class StoredFileSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = StoredFile
        fields = ["id", "original_name", "kind", "content_type", "size", "created_at", "download_url"]

    def get_download_url(self, obj) -> str:
        return f"/api/v1/files/{obj.pk}/download/"


class FileIdsField(serializers.PrimaryKeyRelatedField):
    """Attach previously uploaded files: only ones this user uploaded in their org."""

    def __init__(self, **kwargs):
        kwargs.setdefault("queryset", StoredFile.objects.all())
        super().__init__(**kwargs)

    def get_queryset(self):
        request = self.context.get("request")
        if request is None:
            return StoredFile.objects.none()
        return StoredFile.objects.filter(
            organization_id=request.user.organization_id, uploaded_by=request.user
        )
