"""Production operations: email outbox, scheduler, customer bootstrap, readiness."""
import pytest
from django.core import mail
from django.core.management import call_command

from apps.accounts.models import Organization, User
from apps.communications.models import Notification
from apps.communications.services import notify
from apps.orgsettings.models import OrganizationSettings
from apps.rbac.models import UserRole

pytestmark = pytest.mark.django_db


def test_notifications_are_emailed_only_when_the_channel_is_on(tenant):
    teacher = tenant.users["Teacher"]
    notify([teacher], title="Quiet")
    assert Notification.objects.get(title="Quiet").email_status == ""

    OrganizationSettings.objects.create(organization=tenant.org, data={"notifications": {"channels": {"email": True}}})
    notify([teacher], title="Loud", body="Hello")
    assert Notification.objects.get(title="Loud").email_status == "pending"

    call_command("send_notification_emails")
    assert [m.to for m in mail.outbox] == [[teacher.email]]
    assert "Loud" in mail.outbox[0].subject and "Hello" in mail.outbox[0].body
    n = Notification.objects.get(title="Loud")
    assert n.email_status == "sent" and n.emailed_at is not None
    call_command("send_notification_emails")
    assert len(mail.outbox) == 1  # never sent twice


def test_forced_email_and_users_without_address(tenant):
    teacher = tenant.users["Teacher"]
    User.objects.filter(pk=teacher.pk).update(email="")
    teacher.refresh_from_db()
    notify([teacher, tenant.users["Principal"]], title="Notice", email=True)
    call_command("send_notification_emails")
    assert len(mail.outbox) == 1
    assert Notification.objects.get(title="Notice", user=teacher).email_status == ""


def test_scheduler_runs_every_job_once(tenant):
    call_command("run_scheduler", once=True)


def test_bootstrap_school_creates_customer_without_demo_data(capsys):
    args = dict(org="Sunrise Education", slug="sunrise", school="Sunrise Academy", code="SA",
                admin_email="Principal@Sunrise.edu", admin_name="Asha Rai")
    call_command("bootstrap_school", **args)
    out = capsys.readouterr().out
    assert "One-time password:" in out
    user = User.objects.get(email="principal@sunrise.edu")
    assert user.must_change_password and user.organization.slug == "sunrise"
    assert UserRole.objects.filter(user=user, role__name="Principal").exists()
    call_command("bootstrap_school", **args)  # idempotent
    assert Organization.objects.filter(slug="sunrise").count() == 1
    assert User.objects.filter(organization__slug="sunrise").count() == 1


def test_readiness_checks_database_and_cache(client):
    res = client.get("/ready/")
    assert res.status_code == 200 and res.json() == {"status": "ok", "database": "ok", "cache": "ok"}
    assert client.get("/health/").status_code == 200
