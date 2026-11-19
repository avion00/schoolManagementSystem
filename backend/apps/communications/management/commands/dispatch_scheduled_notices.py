"""Publish scheduled notices whose time has come and send their notifications.

Visibility doesn't depend on this (due notices show up at query time); it
flips status and fans out notifications. Run every few minutes (cron now,
Celery beat later):  python manage.py dispatch_scheduled_notices
"""
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.communications.models import Notice
from apps.communications.services import notify_notice


class Command(BaseCommand):
    help = "Publish due scheduled notices and notify their audiences."

    def handle(self, *args, **options):
        due = Notice.objects.filter(status=Notice.Status.SCHEDULED, publish_at__lte=timezone.now())
        sent = 0
        for notice in due:
            notice.status = Notice.Status.PUBLISHED
            notice.save(update_fields=["status", "updated_at"])
            sent += notify_notice(notice)
        self.stdout.write(self.style.SUCCESS(f"Published {len(due)} notices, {sent} notifications."))
