from rest_framework import serializers

from apps.academics.models import ClassLevel, Section
from apps.files.serializers import FileIdsField, StoredFileSerializer

from .models import DEFAULT_GROUP_PERMISSIONS, Conversation, Message, MessageRequest, ModerationReport
from .policy import chat_role


class ChatUserSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.SerializerMethodField()
    email = serializers.EmailField()
    role = serializers.SerializerMethodField()

    def get_name(self, user) -> str:
        return user.full_name or user.email

    def get_role(self, user) -> str:
        return chat_role(user)


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    body = serializers.SerializerMethodField()
    reactions = serializers.SerializerMethodField()
    is_deleted = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    attachments = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            "id", "conversation", "sender", "sender_name", "type", "body", "attachments", "reply_to",
            "created_at", "edited_at", "is_deleted", "is_pinned", "reactions", "status",
        ]

    def get_sender_name(self, obj) -> str | None:
        return (obj.sender.full_name or obj.sender.email) if obj.sender_id else None

    def get_body(self, obj) -> str:
        return "" if obj.deleted_at else obj.body  # deleted content is never sent to clients

    def get_attachments(self, obj) -> list[dict]:
        if obj.deleted_at:
            return []
        return StoredFileSerializer(obj.attachments.all(), many=True).data

    def get_is_deleted(self, obj) -> bool:
        return obj.deleted_at is not None

    def get_reactions(self, obj) -> list[dict]:
        grouped = {}
        for r in obj.reactions.all():
            grouped.setdefault(r.emoji, []).append(str(r.user_id))
        return [{"emoji": e, "user_ids": ids} for e, ids in grouped.items()]

    def get_status(self, obj) -> str | None:
        from .services import delivery_state

        marks = self.context.get("read_marks")
        if marks is None or obj.sender_id is None:
            return None
        return delivery_state(obj, marks)


class ConversationSerializer(serializers.ModelSerializer):
    unread = serializers.IntegerField(read_only=True, default=0)
    pinned = serializers.BooleanField(source="my_pinned", read_only=True, default=False)
    muted = serializers.BooleanField(source="my_muted", read_only=True, default=False)
    is_admin = serializers.BooleanField(source="my_is_admin", read_only=True, default=False)
    display_title = serializers.SerializerMethodField()
    members = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    effective_permissions = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id", "type", "title", "display_title", "is_locked", "priority", "related_student",
            "related_section", "last_message_at", "last_message", "unread", "pinned", "muted",
            "is_admin", "members", "effective_permissions", "created_at",
        ]

    def _members(self, obj):
        return [p for p in obj.participants.all() if p.left_at is None]

    def get_members(self, obj) -> list[dict]:
        return [
            {**ChatUserSerializer(p.user).data, "is_admin": p.is_admin}
            for p in self._members(obj)
        ] if obj.type != Conversation.Type.BROADCAST or getattr(obj, "my_is_admin", False) else []

    def get_display_title(self, obj) -> str:
        if obj.title:
            return obj.title
        me = self.context["request"].user
        others = [p.user for p in self._members(obj) if p.user_id != me.pk]
        return ", ".join(u.full_name or u.email for u in others) or "Conversation"

    def get_last_message(self, obj) -> dict | None:
        msg = obj.messages.order_by("-created_at").first()
        if msg is None:
            return None
        return {"id": str(msg.id), "body": "" if msg.deleted_at else msg.body[:140],
                "sender": str(msg.sender_id) if msg.sender_id else None, "created_at": msg.created_at}

    def get_effective_permissions(self, obj) -> dict:
        return {**DEFAULT_GROUP_PERMISSIONS, **(obj.permissions or {})}


class StartDirectSerializer(serializers.Serializer):
    user = serializers.UUIDField()
    message = serializers.CharField(required=False, allow_blank=True)
    reason = serializers.CharField(required=False, allow_blank=True, max_length=500)
    related_student = serializers.UUIDField(required=False, allow_null=True)


class CreateGroupSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=150)
    members = serializers.ListField(child=serializers.UUIDField(), allow_empty=False, max_length=500)
    type = serializers.ChoiceField(
        choices=[Conversation.Type.GROUP, Conversation.Type.CLASS_GROUP, Conversation.Type.STAFF_GROUP],
        default=Conversation.Type.GROUP,
    )
    permissions = serializers.DictField(required=False)
    related_section = serializers.UUIDField(required=False, allow_null=True)

    def validate_permissions(self, value):
        allowed = {
            "who_can_send": {"everyone", "admins"},
            "who_can_add_members": {"everyone", "admins"},
            "who_can_delete_messages": {"own", "admins"},
        }
        for key, val in value.items():
            if key not in allowed or val not in allowed[key]:
                raise serializers.ValidationError(f"Invalid setting {key}={val}.")
        return value


class SendMessageSerializer(serializers.Serializer):
    body = serializers.CharField(max_length=5000, trim_whitespace=False, required=False, allow_blank=True, default="")
    reply_to = serializers.UUIDField(required=False, allow_null=True)
    attachment_ids = FileIdsField(many=True, required=False)

    def validate_attachment_ids(self, value):
        if len(value) > 10:
            raise serializers.ValidationError("Attach at most 10 files.")
        return value


class BroadcastSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=150)
    body = serializers.CharField(max_length=5000)
    audience = serializers.ChoiceField(
        choices=["all", "students", "parents", "teachers", "staff", "students_parents"]
    )
    class_levels = serializers.PrimaryKeyRelatedField(queryset=ClassLevel.objects.all(), many=True, required=False)
    sections = serializers.PrimaryKeyRelatedField(queryset=Section.objects.all(), many=True, required=False)
    allow_replies = serializers.BooleanField(default=False)

    def validate(self, attrs):
        org = self.context["request"].user.organization_id
        for key in ("class_levels", "sections"):
            if any(o.organization_id != org for o in attrs.get(key, [])):
                raise serializers.ValidationError({key: "Not in your organization."})
        return attrs


class MessageRequestSerializer(serializers.ModelSerializer):
    from_user = ChatUserSerializer(read_only=True)
    to_user = ChatUserSerializer(read_only=True)

    class Meta:
        model = MessageRequest
        fields = ["id", "from_user", "to_user", "reason", "status", "decided_at", "conversation", "created_at"]


class ModerationReportSerializer(serializers.ModelSerializer):
    reported_by = ChatUserSerializer(read_only=True)
    message_body = serializers.CharField(source="message.body", read_only=True)
    sender = serializers.SerializerMethodField()
    conversation = serializers.UUIDField(source="message.conversation_id", read_only=True)

    class Meta:
        model = ModerationReport
        fields = [
            "id", "message", "message_body", "sender", "conversation", "reported_by", "reason",
            "priority", "status", "reviewed_at", "resolution", "created_at",
        ]

    def get_sender(self, obj) -> dict | None:
        return ChatUserSerializer(obj.message.sender).data if obj.message.sender_id else None
