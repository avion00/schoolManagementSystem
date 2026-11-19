from django.apps import AppConfig


class OrgSettingsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.orgsettings"
    label = "orgsettings"

    def ready(self):
        from . import access  # noqa: F401
