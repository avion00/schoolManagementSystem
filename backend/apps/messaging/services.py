"""Messaging operations shared by the REST API and the WebSocket consumer."""
import datetime

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from django.db.models import Count, IntegerField, OuterRef, Subquery, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from .models import Conversation, Message, Participant

EDIT_WINDOW_MINUTES = 15
EPOCH = datetime.datetime(1970, 1, 1, tzinfo=datetime.UTC)


def user_group(user_id):
    return f"user.{user_id}"


def push(user_ids, event, payload):
    """Send a realtime event to these users' sockets after the transaction commits."""
    layer = get_channel_layer()
    if layer is None:
        return

    def send():
        for uid in set(user_ids):
            async_to_sync(layer.group_send)(user_group(uid), {"type": "chat.event", "event": event, "payload": payload})

    transaction.on_commit(send)


def membership(conversation, user):
    return Participant.objects.filter(conversation=conversation, user=user, left_at__isnull=True).first()


def member_ids(conversation):
    return list(
        Participant.objects.filter(conversation=conversation, left_at__isnull=True).values_list("user_id", flat=True)
    )


def direct_key(a, b):
    return ":".join(sorted([str(a.pk), str(b.pk)]))


@transaction.atomic
def get_or_create_direct(organization_id, a, b, *, type=Conversation.Type.DIRECT, related_student=None):
    conv, created = Conversation.objects.get_or_create(
        organization_id=organization_id, direct_key=direct_key(a, b),
        defaults={"type": type, "created_by": a, "related_student": related_student},
    )
    if created:
        Participant.objects.bulk_create([Participant(conversation=conv, user=u) for u in (a, b)])
    else:  # someone who left a direct chat rejoins it
        Participant.objects.filter(conversation=conv, user__in=[a, b]).update(left_at=None, archived=False)
    return conv, created


@transaction.atomic
def create_group(organization_id, creator, title, members, *, type=Conversation.Type.GROUP, permissions=None,
                 related_section=None):
    conv = Conversation.objects.create(
        organization_id=organization_id, type=type, title=title, created_by=creator,
        permissions=permissions or {}, related_section=related_section,
    )
    rows = {m.pk: Participant(conversation=conv, user=m) for m in members}
    rows[creator.pk] = Participant(conversation=conv, user=creator, is_admin=True)
    Participant.objects.bulk_create(rows.values(), batch_size=500)
    system_message(conv, f"{creator.full_name or creator.email} created the group")
    return conv


def system_message(conv, text):
    msg = Message.objects.create(conversation=conv, type=Message.Type.SYSTEM, body=text)
    Conversation.objects.filter(pk=conv.pk).update(last_message_at=msg.created_at)
    return msg


def can_send(conv, participant):
    if conv.is_locked:
        return False
    if conv.perm("who_can_send") == "admins" and not participant.is_admin:
        return False
    return True


@transaction.atomic
def send_message(conv, user, body, reply_to=None):
    me = membership(conv, user)
    if me is None:
        raise PermissionDenied("You're not in this conversation.")
    if not can_send(conv, me):
        raise PermissionDenied("You can't send messages in this conversation.")
    if not body.strip():
        raise ValidationError({"body": "Message can't be empty."})
    if reply_to is not None and reply_to.conversation_id != conv.pk:
        raise ValidationError({"reply_to": "Reply must be in the same conversation."})
    msg = Message.objects.create(conversation=conv, sender=user, body=body.strip(), reply_to=reply_to)
    Conversation.objects.filter(pk=conv.pk).update(last_message_at=msg.created_at)
    me.last_read_at = msg.created_at
    me.archived = False
    me.save(update_fields=["last_read_at", "archived", "updated_at"])
    # A new message brings the chat back for everyone who archived it.
    Participant.objects.filter(conversation=conv, archived=True, left_at__isnull=True).update(archived=False)
    from .serializers import MessageSerializer

    push(member_ids(conv), "message.created", MessageSerializer(msg, context={"user": user}).data)
    return msg


def edit_message(msg, user, body):
    if msg.sender_id != user.pk or msg.deleted_at or msg.type != Message.Type.TEXT:
        raise PermissionDenied("You can only edit your own messages.")
    if (timezone.now() - msg.created_at).total_seconds() > EDIT_WINDOW_MINUTES * 60:
        raise ValidationError(f"Messages can only be edited within {EDIT_WINDOW_MINUTES} minutes.")
    if not body.strip():
        raise ValidationError({"body": "Message can't be empty."})
    msg.body, msg.edited_at = body.strip(), timezone.now()
    msg.save(update_fields=["body", "edited_at", "updated_at"])
    push(member_ids(msg.conversation), "message.updated", {"id": str(msg.pk), "body": msg.body,
                                                          "edited_at": msg.edited_at.isoformat()})
    return msg


def delete_message(msg, user, *, as_moderator=False):
    """Soft delete: the row stays (for moderation/audit) but the body is hidden."""
    conv = msg.conversation
    me = membership(conv, user)
    own = msg.sender_id == user.pk
    group_admin = me is not None and me.is_admin and conv.perm("who_can_delete_messages") == "admins"
    if not (own or group_admin or as_moderator):
        raise PermissionDenied("You can't delete this message.")
    if msg.deleted_at is None:
        msg.deleted_at, msg.deleted_by = timezone.now(), user
        msg.save(update_fields=["deleted_at", "deleted_by", "updated_at"])
        push(member_ids(conv), "message.deleted", {"id": str(msg.pk), "conversation": str(conv.pk)})
    return msg


def mark_read(conv, user):
    me = membership(conv, user)
    if me is None:
        return None
    me.last_read_at = timezone.now()
    me.save(update_fields=["last_read_at", "updated_at"])
    push(member_ids(conv), "conversation.read", {"conversation": str(conv.pk), "user": str(user.pk),
                                                 "read_at": me.last_read_at.isoformat()})
    return me


def conversations_for(user, *, archived=False):
    """The user's conversations, annotated with their own state and unread count."""
    mine = Participant.objects.filter(conversation=OuterRef("pk"), user=user)
    qs = Conversation.objects.filter(
        participants__user=user, participants__left_at__isnull=True, participants__archived=archived,
    ).annotate(
        my_last_read=Subquery(mine.values("last_read_at")[:1]),
        my_pinned=Subquery(mine.values("pinned")[:1]),
        my_muted=Subquery(mine.values("muted")[:1]),
        my_is_admin=Subquery(mine.values("is_admin")[:1]),
    )
    # Never read => everything from others is unread.
    unread = (
        Message.objects.filter(conversation=OuterRef("pk"), deleted_at__isnull=True)
        .exclude(sender=user)
        .filter(created_at__gt=Coalesce(OuterRef("my_last_read"), Value(EPOCH)))
        .order_by().values("conversation").annotate(n=Count("pk")).values("n")
    )
    return qs.annotate(unread=Coalesce(Subquery(unread, output_field=IntegerField()), 0))


def unread_count(conv, user, last_read):
    qs = conv.messages.filter(deleted_at__isnull=True).exclude(sender=user)
    if last_read:
        qs = qs.filter(created_at__gt=last_read)
    return qs.count()


def delivery_state(msg, read_marks):
    """'seen' once every other member has read past it, else 'delivered'."""
    others = [t for uid, t in read_marks.items() if uid != msg.sender_id]
    if others and all(t is not None and t >= msg.created_at for t in others):
        return "seen"
    return "delivered"


def total_unread(user):
    qs = Participant.objects.filter(user=user, left_at__isnull=True, muted=False).select_related("conversation")
    return sum(unread_count(p.conversation, user, p.last_read_at) for p in qs)

