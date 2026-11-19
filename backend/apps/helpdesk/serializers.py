from rest_framework import serializers

from apps.files.serializers import FileIdsField, StoredFileSerializer
from apps.messaging.serializers import ChatUserSerializer

from .models import Ticket, TicketEvent, TicketMessage


class TicketMessageSerializer(serializers.ModelSerializer):
    author = ChatUserSerializer(read_only=True)
    attachments = StoredFileSerializer(many=True, read_only=True)

    class Meta:
        model = TicketMessage
        fields = ["id", "author", "body", "is_internal", "attachments", "created_at"]


class TicketEventSerializer(serializers.ModelSerializer):
    actor = serializers.CharField(source="actor.full_name", read_only=True, default=None)

    class Meta:
        model = TicketEvent
        fields = ["id", "action", "detail", "actor", "created_at"]


class TicketSerializer(serializers.ModelSerializer):
    requester = ChatUserSerializer(read_only=True)
    assignee = ChatUserSerializer(read_only=True)
    attachment_ids = FileIdsField(many=True, required=False, write_only=True, source="attachments")
    attachments = StoredFileSerializer(many=True, read_only=True)
    sla_status = serializers.CharField(read_only=True)
    related_student_name = serializers.CharField(source="related_student.full_name", read_only=True, default=None)

    class Meta:
        model = Ticket
        fields = [
            "id", "code", "requester", "related_student", "related_student_name", "category", "module",
            "department", "subject", "description", "priority", "status", "source", "assignee",
            "due_at", "sla_status", "first_response_at", "resolved_at", "closed_at", "resolution_note",
            "rating", "attachment_ids", "attachments", "created_at",
        ]
        read_only_fields = [
            "code", "status", "assignee", "due_at", "first_response_at", "resolved_at", "closed_at",
            "resolution_note", "rating", "created_at", "related_student",
        ]


class TicketCreateSerializer(TicketSerializer):
    related_student = serializers.UUIDField(required=False, allow_null=True)

    class Meta(TicketSerializer.Meta):
        read_only_fields = [f for f in TicketSerializer.Meta.read_only_fields if f != "related_student"]


class ReplySerializer(serializers.Serializer):
    body = serializers.CharField(max_length=10000)
    is_internal = serializers.BooleanField(default=False)
    attachment_ids = FileIdsField(many=True, required=False)
    status = serializers.ChoiceField(choices=Ticket.Status.choices, required=False)
