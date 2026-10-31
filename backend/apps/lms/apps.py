from django.apps import AppConfig


class LmsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.lms"
    label = "lms"

    def ready(self):
        from . import access  # noqa: F401  (registers file download rules)
