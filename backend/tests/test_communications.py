"""Notices (audiences, receipts, scheduling) and notifications (inbox + hooks)."""
import datetime
from decimal import Decimal

import pytest
from django.core.management import call_command
from django.utils import timezone

from apps.academics.models import Section
from apps.communications.models import Notice, Notification
from apps.communications.services import audience_users, visible_notices
from apps.fees.models import FeeDiscount
from apps.guardians.models import Guardian, StudentGuardian
from apps.students.models import Student

pytestmark = pytest.mark.django_db


@pytest.fixture
def principal(api, tenant):
    return api(tenant.users["Principal"])


@pytest.fixture
def parent_user(tenant):
    from apps.accounts.models import User

    user = User.objects.create_user(email="dad@x.test", password="x", organization=tenant.org)
    g = Guardian.objects.create(organization=tenant.org, full_name="Dad", user=user)
    StudentGuardian.objects.create(organization=tenant.org, student=tenant.student, guardian=g,
                                   relation="father", is_primary=True)
    return user


def create_notice(client, **extra):
    return client.post("/api/v1/notices/", {"title": "Sports day", "body": "Friday.", **extra}, format="json").json()


def publish(client, notice):
    return client.post(f"/api/v1/notices/{notice['id']}/publish/")


def test_publish_notifies_whole_school(principal, tenant, parent_user):
    n = create_notice(principal)
    assert n["code"].startswith("NTC-") and n["status"] == "draft"
    res = publish(principal, n).json()
    assert res["status"] == "published"
    expected = set(audience_users(Notice.objects.get(pk=n["id"])))
    assert res["notified"] == len(expected) and parent_user in expected and tenant.users["Student"] in expected
    assert publish(principal, n).status_code == 400  # already published


def test_audiences_and_class_targeting(principal, tenant, parent_user, api):
    other = Section.objects.create(organization=tenant.org, class_level=tenant.other_grade, name="B")
    n = create_notice(principal, audience="students_parents", target_sections=[str(other.id)])
    publish(principal, n)
    # the tenant student is in Grade 8 A, so neither they nor their parent see it
    assert api(tenant.users["Student"]).get("/api/v1/me/notices/").json()["count"] == 0
    assert api(parent_user).get("/api/v1/me/notices/").json()["count"] == 0
    hit = create_notice(principal, audience="parents", target_class_levels=[str(tenant.grade.id)])
    publish(principal, hit)
    assert api(parent_user).get("/api/v1/me/notices/").json()["count"] == 1
    assert api(tenant.users["Teacher"]).get("/api/v1/me/notices/").json()["count"] == 0


def test_visibility_matches_audience(principal, tenant, parent_user):
    for aud in ("all", "students", "parents", "teachers", "staff", "students_parents"):
        publish(principal, create_notice(principal, audience=aud, title=aud))
    users = [tenant.users[r] for r in ("Principal", "Teacher", "Accountant", "Student")] + [parent_user]
    for notice in Notice.objects.all():
        reached = set(audience_users(notice))
        for u in users:
            assert (u in reached) == visible_notices(u).filter(pk=notice.pk).exists(), (notice.audience, u.email)


def test_read_and_acknowledge_and_stats(principal, tenant, api):
    n = create_notice(principal, audience="students", requires_acknowledgement=True)
    publish(principal, n)
    student = api(tenant.users["Student"])
    assert student.get("/api/v1/me/notices/", {"unread": "1"}).json()["count"] == 1
    body = student.get(f"/api/v1/me/notices/{n['id']}/").json()
    assert body["read_at"] is not None and "internal_notes" not in body
    student.post(f"/api/v1/me/notices/{n['id']}/acknowledge/")
    rec = principal.get(f"/api/v1/notices/{n['id']}/recipients/").json()
    assert rec["stats"] == {"total": 1, "read": 1, "unread": 0, "acknowledged": 1}


def test_drafts_scheduled_and_expired_hidden(principal, tenant, api):
    create_notice(principal, title="draft")
    future = create_notice(principal, publish_at=(timezone.now() + datetime.timedelta(hours=2)).isoformat())
    assert publish(principal, future).json()["status"] == "scheduled"
    old = create_notice(principal, expires_on=str(timezone.localdate() - datetime.timedelta(days=1)),
                        publish_at=(timezone.now() - datetime.timedelta(days=3)).isoformat())
    publish(principal, old)
    assert api(tenant.users["Student"]).get("/api/v1/me/notices/").json()["count"] == 0
    Notice.objects.filter(pk=future["id"]).update(publish_at=timezone.now() - datetime.timedelta(minutes=1))
    call_command("dispatch_scheduled_notices", stdout=open("/dev/null", "w"))
    assert Notice.objects.get(pk=future["id"]).status == "published"
    assert api(tenant.users["Student"]).get("/api/v1/me/notices/").json()["count"] == 1


def test_notice_permissions_and_rules(api, principal, tenant):
    assert api(tenant.users["Teacher"]).post("/api/v1/notices/", {"title": "x", "body": "y"}, format="json").status_code == 403
    n = create_notice(principal)
    publish(principal, n)
    assert principal.delete(f"/api/v1/notices/{n['id']}/").status_code == 400
    principal.post(f"/api/v1/notices/{n['id']}/archive/")
    assert principal.patch(f"/api/v1/notices/{n['id']}/", {"title": "z"}, format="json").status_code == 400


def test_notification_inbox(api, tenant, principal):
    publish(principal, create_notice(principal, audience="students"))
    inbox = api(tenant.users["Student"])
    assert inbox.get("/api/v1/me/notifications/unread-count/").json() == {"unread": 1}
    nid = inbox.get("/api/v1/me/notifications/").json()["results"][0]["id"]
    inbox.post(f"/api/v1/me/notifications/{nid}/read/")
    assert inbox.get("/api/v1/me/notifications/", {"status": "unread"}).json()["count"] == 0
    inbox.post(f"/api/v1/me/notifications/{nid}/archive/")
    assert inbox.get("/api/v1/me/notifications/").json()["count"] == 0
    assert inbox.get("/api/v1/me/notifications/", {"status": "archived"}).json()["count"] == 1
    inbox.post(f"/api/v1/me/notifications/{nid}/unarchive/")
    inbox.post(f"/api/v1/me/notifications/{nid}/unread/")
    assert inbox.get("/api/v1/me/notifications/unread-count/").json() == {"unread": 1}
    # someone else's notification is invisible
    assert api(tenant.users["Teacher"]).post(f"/api/v1/me/notifications/{nid}/read/").status_code == 404


def test_absence_notifies_guardian_once(api, tenant, parent_user, django_capture_on_commit_callbacks):
    teacher = api(tenant.users["Teacher"])
    payload = {"date": str(timezone.localdate()), "records": [{"student": str(tenant.student.id), "status": "absent"}]}
    with django_capture_on_commit_callbacks(execute=True):
        teacher.post("/api/v1/attendance/bulk/", payload, format="json")
    with django_capture_on_commit_callbacks(execute=True):
        teacher.post("/api/v1/attendance/bulk/", payload, format="json")  # re-saving doesn't re-notify
    notes = Notification.objects.filter(user=parent_user, category="attendance")
    assert notes.count() == 1 and "absent" in notes.get().title


def test_results_published_notifies_students_and_parents(principal, tenant, parent_user):
    principal.post("/api/v1/exams/marks/", {"exam_subject": str(tenant.exam_subject.id),
                                            "student": str(tenant.student.id), "marks_obtained": "70"}, format="json")
    principal.post(f"/api/v1/exams/exams/{tenant.exam.id}/lock/")
    principal.post(f"/api/v1/exams/exams/{tenant.exam.id}/publish/")
    got = set(Notification.objects.filter(category="exams").values_list("user__email", flat=True))
    assert got == {tenant.users["Student"].email, parent_user.email}


def test_discount_decision_notifies_requester(api, tenant):
    d = FeeDiscount.objects.create(organization=tenant.org, invoice=tenant.invoice, amount=Decimal("50"),
                                   reason="x", created_by=tenant.users["Accountant"])
    api(tenant.users["Principal"]).post(f"/api/v1/fees/discounts/{d.id}/reject/", {"note": "no"}, format="json")
    n = Notification.objects.get(user=tenant.users["Accountant"])
    assert "rejected" in n.title


def test_notices_are_tenant_scoped(api, principal, other_tenant):
    publish(principal, create_notice(principal))
    assert api(other_tenant.users["Student"]).get("/api/v1/me/notices/").json()["count"] == 0
    assert api(other_tenant.users["Principal"]).get("/api/v1/notices/").json()["count"] == 0


def test_inactive_students_excluded(principal, tenant):
    Student.objects.filter(pk=tenant.student.pk).update(status="left")
    n = create_notice(principal, audience="students")
    assert publish(principal, n).json()["notified"] == 0


def test_notice_attachments_downloadable_by_audience_only(principal, tenant, parent_user, api):
    from django.core.files.uploadedfile import SimpleUploadedFile

    pdf = SimpleUploadedFile("circular.pdf", b"%PDF-1.4\n%fake but well-formed enough\n")
    stored = principal.post("/api/v1/files/", {"file": pdf}, format="multipart").json()
    notice = create_notice(principal, audience="parents", attachment_ids=[stored["id"]])
    assert [a["id"] for a in notice["attachments"]] == [stored["id"]]
    dad = api(parent_user)
    teacher = api(tenant.users["Teacher"])
    url = f"/api/v1/files/{stored['id']}/download/"
    assert dad.get(url).status_code == 404  # not published yet
    publish(principal, notice)
    mine = dad.get(f"/api/v1/me/notices/{notice['id']}/").json()
    assert mine["attachments"][0]["id"] == stored["id"]
    assert dad.get(url).status_code == 200
    assert teacher.get(url).status_code == 404  # parents-only notice


def test_notice_list_counts_and_recipient_roles(principal, tenant, parent_user, api):
    notice = create_notice(principal, audience="parents")
    publish(principal, notice)
    api(parent_user).get(f"/api/v1/me/notices/{notice['id']}/")
    row = next(n for n in principal.get("/api/v1/notices/").json()["results"] if n["id"] == notice["id"])
    assert row["read_count"] == 1 and row["acknowledged_count"] == 0
    rec = principal.get(f"/api/v1/notices/{notice['id']}/recipients/").json()
    dad = next(r for r in rec["results"] if r["email"] == "dad@x.test")
    assert dad["role"] == "parent" and dad["read_at"]
