from django.apps import AppConfig


class RbacConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.rbac"
    label = "rbac"

    def ready(self):
        from django.db.models.signals import post_migrate

        from .catalog import sync_catalog

        post_migrate.connect(sync_catalog, sender=self, dispatch_uid="rbac.sync_catalog")
