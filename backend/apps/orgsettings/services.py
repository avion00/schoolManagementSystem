from .defaults import DEFAULTS, merged
from .models import OrganizationSettings


def org_settings(organization_id):
    if organization_id is None:
        return merged({})
    row = OrganizationSettings.objects.filter(organization_id=organization_id).first()
    return merged(row.data if row else {})


def get_setting(organization_id, section, key, sub=None):
    value = org_settings(organization_id)[section][key]
    return value[sub] if sub is not None else value


def explicit_setting(organization_id, section, key):
    """The school's own value, or None if it never changed the default."""
    row = OrganizationSettings.objects.filter(organization_id=organization_id).first()
    return ((row.data if row else {}).get(section) or {}).get(key)


__all__ = ["DEFAULTS", "org_settings", "get_setting", "explicit_setting"]
