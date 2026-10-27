"""Download rules for files sent in chats (see apps.files.access)."""
from apps.files.access import register

from . import policy, services
from .models import Message


@register
def message_files(user, stored):
    messages = Message.objects.filter(attachments=stored, deleted_at__isnull=True,
                                      conversation__organization_id=user.organization_id)
    if not messages.exists():
        return False
    if policy.can(user, "message.view_all"):
        return True
    return any(services.membership(m.conversation, user) for m in messages.select_related("conversation")[:20])
