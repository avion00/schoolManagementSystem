"""Download rules for files attached to notices (see apps.files.access)."""
from apps.files.access import register
from apps.rbac.services import user_has_permission

from . import services
from .models import Notice


@register
def notice_files(user, stored):
    notices = Notice.objects.filter(attachments=stored, organization_id=user.organization_id)
    if not notices.exists():
        return False
    if user_has_permission(user, "notice.manage"):
        return True
    return services.visible_notices(user).filter(attachments=stored).exists()
