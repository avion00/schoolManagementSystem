from django.apps import AppConfig


class MessagingConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.messaging"
    label = "messaging"

    def ready(self):
        from . import access  # noqa: F401  (registers file download rules)
