from rest_framework import serializers

from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            "id", "action", "actor", "actor_email", "object_type", "object_id",
            "changes", "ip_address", "user_agent", "created_at",
        ]

    def get_actor_email(self, obj):
        return obj.actor.email if obj.actor_id else None
