"""Send queued notification emails (Notification.email_status == "pending").

Run every minute by `run_scheduler`. Each email is marked sent or failed so a
broken SMTP server never causes duplicates; failed ones can be retried with
--retry-failed.
"""
from django.conf import settings
from django.core.mail import get_connection, send_mail
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.communications.models import Notification


class Command(BaseCommand):
    help = "Send pending notification emails."

    def add_arguments(self, parser):
        parser.add_argument("--batch", type=int, default=200)
        parser.add_argument("--retry-failed", action="store_true")

    def handle(self, *args, batch, retry_failed, **options):
        statuses = ["pending", "failed"] if retry_failed else ["pending"]
        rows = list(
            Notification.objects.filter(email_status__in=statuses)
            .select_related("user", "organization").order_by("created_at")[:batch]
        )
        sent = failed = 0
        connection = get_connection()
        for n in rows:
            if not n.user.email or not n.user.is_active:
                n.email_status = "skipped"
                n.save(update_fields=["email_status"])
                continue
            school = n.organization.name if n.organization else "School"
            link = settings.FRONTEND_URL.rstrip("/")
            text = f"{n.body}\n\nOpen the portal to see more: {link}\n\n— {school}".strip()
            try:
                send_mail(f"[{school}] {n.title}", text, settings.DEFAULT_FROM_EMAIL, [n.user.email],
                          connection=connection)
                n.email_status, n.emailed_at = "sent", timezone.now()
                sent += 1
            except Exception as exc:  # noqa: BLE001 — record and move on; SMTP errors vary widely
                n.email_status = "failed"
                failed += 1
                self.stderr.write(f"email to {n.user.email} failed: {exc}")
            n.save(update_fields=["email_status", "emailed_at"])
        self.stdout.write(f"Emails sent: {sent}, failed: {failed}.")
