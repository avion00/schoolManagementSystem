"""School profile, organization settings, and self-service account security."""
import datetime
import re

import pytest
from django.core import mail
from django.utils import timezone
from rest_framework.test import APIClient

from apps.attendance.models import Attendance
from apps.communications.models import Notification
from apps.guardians.models import Guardian, StudentGuardian
from tests.conftest import PASSWORD

pytestmark = pytest.mark.django_db
NEW = "Brand-new-Passw0rd!"


def login(email, password=PASSWORD, ua="TestAgent/1.0"):
    client = APIClient(HTTP_USER_AGENT=ua)
    res = client.post("/api/v1/auth/login/", {"email": email, "password": password}, format="json")
    return client, res


# --- school profile & settings ------------------------------------------------

def test_school_profile(api, tenant):
    principal = api(tenant.users["Principal"])
    res = principal.patch("/api/v1/settings/school/", {"principal_name": "Dr. Rai", "website": "https://alpha.edu"}, format="json")
    assert res.status_code == 200 and res.json()["principal_name"] == "Dr. Rai"
    assert api(tenant.users["Student"]).get("/api/v1/settings/school/").json()["website"] == "https://alpha.edu"
    assert api(tenant.users["Teacher"]).patch("/api/v1/settings/school/", {"name": "x"}, format="json").status_code == 403


def test_settings_validation_and_merge(api, tenant):
    principal = api(tenant.users["Principal"])
    assert principal.get("/api/v1/settings/").json()["security"]["max_login_attempts"] == 5
    bad = principal.patch("/api/v1/settings/security/", {"max_login_attempts": 1, "nope": True}, format="json")
    assert bad.status_code == 400 and len(bad.json()["settings"]) == 2
    assert principal.patch("/api/v1/settings/attendance/", {"lock_after_days": "7"}, format="json").status_code == 400
    ok = principal.patch("/api/v1/settings/notifications/", {"events": {"attendance_alert": False}}, format="json").json()
    assert ok["events"]["attendance_alert"] is False and ok["events"]["result_published"] is True
    assert principal.patch("/api/v1/settings/bogus/", {}, format="json").status_code == 400


def test_attendance_lock_setting_applies(api, tenant):
    teacher = api(tenant.users["Teacher"])
    api(tenant.users["Principal"]).patch("/api/v1/settings/attendance/", {"lock_after_days": 1}, format="json")
    three_days_ago = str(timezone.localdate() - datetime.timedelta(days=3))
    res = teacher.post("/api/v1/attendance/bulk/", {"date": three_days_ago, "records": [
        {"student": str(tenant.student.id), "status": "present"}]}, format="json")
    assert res.status_code == 400 and "1 days" in str(res.json())


def test_absence_alert_toggle(api, tenant, django_capture_on_commit_callbacks):
    from apps.accounts.models import User

    parent = User.objects.create_user(email="p@x.test", password="x", organization=tenant.org)
    g = Guardian.objects.create(organization=tenant.org, full_name="P", user=parent)
    StudentGuardian.objects.create(organization=tenant.org, student=tenant.student, guardian=g, relation="father")
    api(tenant.users["Principal"]).patch("/api/v1/settings/notifications/", {"events": {"attendance_alert": False}}, format="json")
    with django_capture_on_commit_callbacks(execute=True):
        api(tenant.users["Teacher"]).post("/api/v1/attendance/bulk/", {"date": str(timezone.localdate()), "records": [
            {"student": str(tenant.student.id), "status": "absent"}]}, format="json")
    assert Attendance.objects.count() == 1 and not Notification.objects.filter(user=parent).exists()


# --- lockout ------------------------------------------------------------------

def test_lockout_after_failed_attempts(tenant):
    email = tenant.users["Teacher"].email
    codes = [login(email, "wrong")[1].status_code for _ in range(5)]
    assert codes == [401] * 5
    _, res = login(email)  # right password, but locked now
    assert res.status_code == 403 and res.json()["code"] == "account_locked"
    tenant.users["Teacher"].refresh_from_db()
    tenant.users["Teacher"].locked_until = timezone.now() - datetime.timedelta(seconds=1)
    tenant.users["Teacher"].save()
    assert login(email)[1].status_code == 200


# --- sessions -----------------------------------------------------------------

def test_sessions_list_and_immediate_revocation(tenant):
    email = tenant.users["Principal"].email
    laptop, _ = login(email, ua="Laptop")
    phone, _ = login(email, ua="Phone")
    rows = laptop.get("/api/v1/auth/sessions/").json()
    assert {r["user_agent"] for r in rows} == {"Laptop", "Phone"}
    current = next(r for r in rows if r["is_current"])
    assert current["user_agent"] == "Laptop"
    other = next(r for r in rows if not r["is_current"])
    assert laptop.delete(f"/api/v1/auth/sessions/{other['id']}/").status_code == 204
    # the phone's still-unexpired access token stops working at once, and refresh fails
    assert phone.get("/api/v1/auth/me/").status_code == 401
    assert phone.post("/api/v1/auth/refresh/").status_code == 401
    assert laptop.get("/api/v1/auth/me/").status_code == 200


def test_logout_revokes_session(tenant):
    client, _ = login(tenant.users["Principal"].email)
    access = client.cookies["access_token"].value
    client.post("/api/v1/auth/logout/")
    replay = APIClient()
    replay.cookies["access_token"] = access
    assert replay.get("/api/v1/auth/me/").status_code == 401


# --- passwords ----------------------------------------------------------------

def test_change_password_signs_out_other_devices(tenant):
    email = tenant.users["Accountant"].email
    me, _ = login(email)
    other, _ = login(email)
    assert me.post("/api/v1/auth/change-password/", {"current_password": "bad", "new_password": NEW}, format="json").status_code == 400
    assert me.post("/api/v1/auth/change-password/", {"current_password": PASSWORD, "new_password": "short"}, format="json").status_code == 400
    res = me.post("/api/v1/auth/change-password/", {"current_password": PASSWORD, "new_password": NEW}, format="json")
    assert res.json()["other_sessions_revoked"] == 1
    assert me.get("/api/v1/auth/me/").status_code == 200
    assert other.get("/api/v1/auth/me/").status_code == 401
    assert login(email, NEW)[1].status_code == 200


def test_password_reset_flow(tenant):
    client = APIClient()
    assert client.post("/api/v1/auth/password-reset/", {"email": "ghost@x.test"}, format="json").status_code == 200
    assert len(mail.outbox) == 0  # same answer, no email for unknown accounts
    email = tenant.users["Teacher"].email
    client.post("/api/v1/auth/password-reset/", {"email": email}, format="json")
    uid, token = re.search(r"uid=([^&]+)&token=(\S+)", mail.outbox[0].body).groups()
    assert client.post("/api/v1/auth/password-reset/confirm/", {"uid": uid, "token": "bad", "new_password": NEW}, format="json").status_code == 400
    assert client.post("/api/v1/auth/password-reset/confirm/", {"uid": uid, "token": token, "new_password": NEW}, format="json").status_code == 200
    # links are single-use
    assert client.post("/api/v1/auth/password-reset/confirm/", {"uid": uid, "token": token, "new_password": NEW + "x"}, format="json").status_code == 400
    assert login(email, NEW)[1].status_code == 200


def test_profile_update(api, tenant):
    me = api(tenant.users["Teacher"])
    body = me.patch("/api/v1/auth/me/", {"phone": "9800000000", "timezone": "UTC", "email": "hijack@x.test"}, format="json").json()
    assert body["phone"] == "9800000000" and body["timezone"] == "UTC"
    assert body["email"] == tenant.users["Teacher"].email  # email isn't self-editable
