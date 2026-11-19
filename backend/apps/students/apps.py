from django.apps import AppConfig


class StudentsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.students"
    label = "students"

    def ready(self):
        from . import access  # noqa: F401  (photo download rules)
