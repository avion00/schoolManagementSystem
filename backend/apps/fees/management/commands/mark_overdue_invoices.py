"""Flip unpaid/partial invoices past their due date to OVERDUE.

Run daily (cron now; a Celery beat task once Celery lands):
    python manage.py mark_overdue_invoices
"""
from django.core.management.base import BaseCommand

from apps.fees.services import mark_overdue


class Command(BaseCommand):
    help = "Mark invoices past their due date as overdue."

    def handle(self, *args, **options):
        count = mark_overdue()
        self.stdout.write(self.style.SUCCESS(f"Invoices marked overdue: {count}"))
