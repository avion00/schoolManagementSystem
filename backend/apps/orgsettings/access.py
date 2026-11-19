"""School logos are readable by everyone in the organization."""
from apps.files.access import register


@register
def school_logo(user, stored):
    return stored.school_logos.filter(organization_id=user.organization_id).exists()
