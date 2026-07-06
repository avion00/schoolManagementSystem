"""Helper for writing audit entries.

Falls back to the thread-local request (set by RequestContextMiddleware) for
IP / user-agent when not passed explicitly.
"""
from apps.core.context import get_client_ip, get_current_request


def record_audit(
    *,
    action,
    actor=None,
    instance=None,
    changes=None,
    request=None,
    organization=None,
    object_type="",
    object_id="",
):
    from .models import AuditLog

    request = request or get_current_request()
    ip_address = get_client_ip(request)
    user_agent = ""
    if request is not None:
        user_agent = request.META.get("HTTP_USER_AGENT", "")[:300]

    if instance is not None and not object_type:
        object_type = instance.__class__.__name__
        object_id = str(getattr(instance, "pk", "") or "")

    return AuditLog.objects.create(
        action=action,
        actor=actor if getattr(actor, "is_authenticated", False) else None,
        organization=organization,
        object_type=object_type,
        object_id=object_id or "",
        changes=changes or {},
        ip_address=ip_address,
        user_agent=user_agent,
    )
