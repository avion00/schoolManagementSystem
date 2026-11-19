"""Long-running scheduler for background jobs (the `scheduler` container).

Every minute: publish due scheduled notices and send queued emails.
Daily (at DAILY_JOBS_HOUR, server time): mark overdue invoices and apply late
fees, purge orphaned uploads, flush expired JWT blacklist entries.

One scheduler per deployment. Jobs are idempotent, so a restart that re-runs
one is harmless.
"""
import logging
import time

from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import close_old_connections
from django.utils import timezone

log = logging.getLogger("scheduler")

MINUTELY = ["dispatch_scheduled_notices", "send_notification_emails"]
DAILY = ["mark_overdue_invoices", "purge_orphan_files", "flushexpiredtokens"]


class Command(BaseCommand):
    help = "Run scheduled jobs forever (Ctrl+C to stop)."

    def add_arguments(self, parser):
        parser.add_argument("--daily-hour", type=int, default=1, help="Hour (0-23, local time) for daily jobs.")
        parser.add_argument("--once", action="store_true", help="Run every job once and exit.")

    def run(self, name):
        close_old_connections()
        try:
            call_command(name)
        except Exception:  # keep the loop alive; the error is logged with traceback
            log.exception("job %s failed", name)

    def handle(self, *args, daily_hour, once, **options):
        if once:
            for name in MINUTELY + DAILY:
                self.run(name)
            return
        last_daily = None
        log.info("scheduler started (daily jobs at %02d:00)", daily_hour)
        while True:
            started = time.monotonic()
            for name in MINUTELY:
                self.run(name)
            today = timezone.localdate()
            if timezone.localtime().hour >= daily_hour and last_daily != today:
                for name in DAILY:
                    self.run(name)
                last_daily = today
            time.sleep(max(1.0, 60 - (time.monotonic() - started)))
