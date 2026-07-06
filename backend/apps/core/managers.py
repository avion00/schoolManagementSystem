from django.db import models


class SoftDeleteQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_active=True)

    def dead(self):
        return self.filter(is_active=False)


class SoftDeleteManager(models.Manager):
    """Default manager — returns only non-deleted (is_active=True) rows."""

    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db).filter(is_active=True)


class AllObjectsManager(models.Manager):
    """Escape hatch — includes soft-deleted rows."""

    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db)
