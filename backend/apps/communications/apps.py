from django.apps import AppConfig


class CommunicationsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.communications"
    label = "communications"

    def ready(self):
        from . import access  # noqa: F401  (registers file download rules)
