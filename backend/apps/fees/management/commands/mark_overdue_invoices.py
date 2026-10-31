"""Daily fee housekeeping: flip unpaid/partial invoices past their due date to
OVERDUE, then add the school's late fee (if enabled in Settings → Fees) once to
invoices overdue beyond the grace period.

Run daily (the production stack schedules it):
    python manage.py mark_overdue_invoices
"""
from django.core.management.base import BaseCommand

from apps.fees.services import apply_late_fees, mark_overdue


class Command(BaseCommand):
    help = "Mark invoices past their due date as overdue and apply late fees."

    def handle(self, *args, **options):
        count = mark_overdue()
        charged = apply_late_fees()
        self.stdout.write(self.style.SUCCESS(f"Invoices marked overdue: {count}; late fees added: {charged}"))
