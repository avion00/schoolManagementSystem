"""Delete uploads never attached to anything, older than a day (abandoned forms).

Run daily:  python manage.py purge_orphan_files
"""
import datetime

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.files.models import StoredFile


def _attached(f):
    for rel in f._meta.related_objects:
        accessor = rel.get_accessor_name()
        if accessor and getattr(f, accessor).exists():
            return True
    return False


class Command(BaseCommand):
    help = "Delete unattached uploads older than 24 hours."

    def handle(self, *args, **options):
        cutoff = timezone.now() - datetime.timedelta(days=1)
        removed = 0
        for f in StoredFile.objects.filter(created_at__lt=cutoff):
            if not _attached(f):
                f.file.delete(save=False)
                f.delete()
                removed += 1
        self.stdout.write(self.style.SUCCESS(f"Removed {removed} orphan uploads."))
