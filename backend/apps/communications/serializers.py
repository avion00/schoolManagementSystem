from django.utils import timezone
from rest_framework import serializers

from apps.academics.models import ClassLevel, Section
from apps.core.serializers import TenantPrimaryKeyRelatedField, merged_value

from .models import Notice, Notification


class NoticeSerializer(serializers.ModelSerializer):
    target_class_levels = TenantPrimaryKeyRelatedField(
        queryset=ClassLevel.objects.all(), many=True, required=False
    )
    target_sections = TenantPrimaryKeyRelatedField(queryset=Section.objects.all(), many=True, required=False)
    published_by_name = serializers.CharField(source="published_by.full_name", read_only=True, default=None)
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True, default=None)

    class Meta:
        model = Notice
        fields = [
            "id", "code", "title", "category", "priority", "status", "audience",
            "target_class_levels", "target_sections", "summary", "body", "instructions",
            "external_link", "publish_at", "expires_on", "pinned", "requires_acknowledgement",
            "send_notification", "send_email", "send_sms", "published_by_name",
            "created_by_name", "internal_notes", "created_at", "is_active",
        ]
        # Status moves only through publish / archive actions.
        read_only_fields = ["code", "status", "published_by_name", "created_at", "is_active"]

    def validate(self, attrs):
        if self.instance and self.instance.status == Notice.Status.ARCHIVED:
            raise serializers.ValidationError("Archived notices can't be edited.")
        expires = merged_value(attrs, self.instance, "expires_on")
        publish_at = merged_value(attrs, self.instance, "publish_at")
        if expires and publish_at and expires < timezone.localtime(publish_at).date():
            raise serializers.ValidationError({"expires_on": "Expiry is before the publish date."})
        return attrs


class MyNoticeSerializer(serializers.ModelSerializer):
    """A notice as its reader sees it (no internal notes)."""

    published_by_name = serializers.CharField(source="published_by.full_name", read_only=True, default=None)
    read_at = serializers.DateTimeField(read_only=True, default=None)
    acknowledged_at = serializers.DateTimeField(read_only=True, default=None)

    class Meta:
        model = Notice
        fields = [
            "id", "code", "title", "category", "priority", "summary", "body", "instructions",
            "external_link", "publish_at", "expires_on", "pinned", "requires_acknowledgement",
            "published_by_name", "read_at", "acknowledged_at",
        ]


class NotificationSerializer(serializers.ModelSerializer):
    is_read = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id", "title", "body", "category", "type", "priority", "related_type",
            "related_id", "action_url", "is_read", "read_at", "archived_at", "created_at",
        ]
        read_only_fields = fields

    def get_is_read(self, obj) -> bool:
        return obj.read_at is not None
