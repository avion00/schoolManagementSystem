from rest_framework import serializers


class TenantPrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
    """A related field whose choices are limited to the caller's organization.

    Prevents IDOR (school.md §11.2): a user cannot reference another tenant's
    rows by guessing their IDs. Superusers / platform admins are unrestricted.
    """

    def get_queryset(self):
        qs = super().get_queryset()
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user:
            return qs.none()
        if user.is_superuser or getattr(user, "is_platform_admin", False):
            return qs
        org_id = getattr(user, "organization_id", None)
        if org_id is None:
            return qs.none()
        return qs.filter(organization_id=org_id)
