"""Ticket attachments: the requester and help desk agents may read them.
Files on internal notes are agents-only."""
from apps.files.access import register
from apps.rbac.services import user_has_permission


@register
def ticket_files(user, stored):
    if user_has_permission(user, "helpdesk.manage"):
        return stored.tickets.exists() or stored.ticket_messages.exists()
    return (
        stored.tickets.filter(requester=user).exists()
        or stored.ticket_messages.filter(ticket__requester=user, is_internal=False).exists()
    )
