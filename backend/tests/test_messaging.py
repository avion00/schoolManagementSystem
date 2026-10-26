"""Messaging: contact policy, conversations, messages, moderation, broadcasts, sockets."""
import datetime

import pytest
from asgiref.sync import async_to_sync
from channels.testing import WebsocketCommunicator
from django.utils import timezone
from rest_framework_simplejwt.tokens import AccessToken

from apps.accounts.models import User
from apps.guardians.models import Guardian, StudentGuardian
from apps.messaging.models import Message, MessageRequest, Participant
from apps.teachers.models import Teacher

pytestmark = pytest.mark.django_db
BASE = "/api/v1/messaging"


@pytest.fixture
def parent(tenant):
    user = User.objects.create_user(email="mum@x.test", password="x", organization=tenant.org, full_name="Mum")
    g = Guardian.objects.create(organization=tenant.org, full_name="Mum", user=user)
    StudentGuardian.objects.create(organization=tenant.org, student=tenant.student, guardian=g,
                                   relation="mother", is_primary=True)
    return user


@pytest.fixture
def stranger_teacher(tenant):
    user = User.objects.create_user(email="other.t@x.test", password="x", organization=tenant.org)
    Teacher.objects.create(organization=tenant.org, full_name="Other T", employee_id="EMP-OT", user=user)
    return user


def start(client, user, **extra):
    return client.post(f"{BASE}/conversations/direct/", {"user": str(user.id), **extra}, format="json")


def test_parent_can_message_own_childs_teacher(api, tenant, parent):
    res = start(api(parent), tenant.users["Teacher"], message="Hello!")
    assert res.status_code == 201 and res.json()["type"] == "parent_teacher"
    again = start(api(parent), tenant.users["Teacher"])
    assert again.status_code == 200 and again.json()["id"] == res.json()["id"]  # one chat per pair


def test_parent_needs_request_for_other_teachers(api, tenant, parent, stranger_teacher):
    res = start(api(parent), stranger_teacher, reason="About the science fair")
    assert res.status_code == 202 and res.json()["request"]["status"] == "pending"
    inbox = api(stranger_teacher)
    req = inbox.get(f"{BASE}/requests/").json()[0]
    approved = inbox.post(f"{BASE}/requests/{req['id']}/approve/").json()
    assert approved["status"] == "approved" and approved["conversation"]
    assert Message.objects.filter(conversation_id=approved["conversation"]).count() == 1


def test_blocked_request_stops_further_requests(api, tenant, parent, stranger_teacher):
    start(api(parent), stranger_teacher)
    req = MessageRequest.objects.get()
    api(stranger_teacher).post(f"{BASE}/requests/{req.id}/block/")
    assert start(api(parent), stranger_teacher).status_code == 403


def test_forbidden_pairs(api, tenant, parent, other_tenant):
    student = api(tenant.users["Student"])
    assert start(student, parent).status_code == 403                    # student -> parent
    assert start(api(parent), tenant.users["Accountant"]).status_code == 403  # parent -> staff
    assert start(student, other_tenant.users["Teacher"]).status_code == 400   # other school


def test_messages_unread_read_and_seen(api, tenant, parent):
    teacher = api(tenant.users["Teacher"])
    conv = start(api(parent), tenant.users["Teacher"], message="Hi").json()
    assert teacher.get(f"{BASE}/conversations/").json()["results"][0]["unread"] == 1
    assert teacher.get(f"{BASE}/conversations/unread-count/").json() == {"unread": 1}
    teacher.post(f"{BASE}/conversations/{conv['id']}/read/")
    assert teacher.get(f"{BASE}/conversations/").json()["results"][0]["unread"] == 0
    msgs = api(parent).get(f"{BASE}/conversations/{conv['id']}/messages/").json()["results"]
    assert msgs[0]["status"] == "seen"


def test_non_member_cannot_read(api, tenant, parent):
    conv = start(api(parent), tenant.users["Teacher"], message="private").json()
    assert api(tenant.users["Accountant"]).get(f"{BASE}/conversations/{conv['id']}/messages/").status_code == 404


def test_edit_window_and_soft_delete(api, tenant, parent):
    conv = start(api(parent), tenant.users["Teacher"], message="typo").json()
    msg = Message.objects.get(conversation_id=conv["id"])
    me = api(parent)
    assert me.patch(f"{BASE}/messages/{msg.id}/", {"body": "fixed"}, format="json").json()["edited_at"]
    assert api(tenant.users["Teacher"]).patch(f"{BASE}/messages/{msg.id}/", {"body": "x"}, format="json").status_code == 403
    Message.objects.filter(pk=msg.pk).update(created_at=timezone.now() - datetime.timedelta(minutes=20))
    assert me.patch(f"{BASE}/messages/{msg.id}/", {"body": "late"}, format="json").status_code == 400
    assert me.delete(f"{BASE}/messages/{msg.id}/").status_code == 204
    shown = me.get(f"{BASE}/conversations/{conv['id']}/messages/").json()["results"][0]
    assert shown["is_deleted"] and shown["body"] == ""


def test_groups_permissions_and_members(api, tenant, parent):
    teacher = api(tenant.users["Teacher"])
    assert api(parent).post(f"{BASE}/conversations/group/", {"title": "x", "members": [str(tenant.users["Teacher"].id)]}, format="json").status_code == 403
    g = teacher.post(f"{BASE}/conversations/group/", {
        "title": "8A Parents", "members": [str(parent.id)], "permissions": {"who_can_send": "admins"},
    }, format="json").json()
    assert g["is_admin"] and g["effective_permissions"]["who_can_send"] == "admins"
    assert api(parent).post(f"{BASE}/conversations/{g['id']}/messages/", {"body": "hi"}, format="json").status_code == 403
    assert teacher.post(f"{BASE}/conversations/{g['id']}/messages/", {"body": "Welcome"}, format="json").status_code == 201
    teacher.delete(f"{BASE}/conversations/{g['id']}/members/", {"user": str(parent.id)}, format="json")
    assert api(parent).get(f"{BASE}/conversations/{g['id']}/messages/").status_code == 404


def test_reactions_toggle(api, tenant, parent):
    conv = start(api(parent), tenant.users["Teacher"], message="Thanks").json()
    msg = Message.objects.get(conversation_id=conv["id"])
    t = api(tenant.users["Teacher"])
    assert t.post(f"{BASE}/messages/{msg.id}/react/", {"emoji": "👍"}, format="json").json()["reactions"][0]["emoji"] == "👍"
    assert t.post(f"{BASE}/messages/{msg.id}/react/", {"emoji": "👍"}, format="json").json()["reactions"] == []


def test_moderation_flow(api, tenant, parent):
    conv = start(api(parent), tenant.users["Teacher"], message="rude words").json()
    msg = Message.objects.get(conversation_id=conv["id"])
    t = api(tenant.users["Teacher"])
    assert t.post(f"{BASE}/messages/{msg.id}/report/", {"reason": "abusive"}, format="json").status_code == 201
    assert t.get(f"{BASE}/moderation/reports/").status_code == 403
    mod = api(tenant.users["Principal"])
    report = mod.get(f"{BASE}/moderation/reports/").json()[0]
    assert report["message_body"] == "rude words"
    assert mod.post(f"{BASE}/moderation/reports/{report['id']}/remove-message/").json()["status"] == "actioned"
    msg.refresh_from_db()
    assert msg.deleted_at is not None
    mod.post(f"{BASE}/conversations/{conv['id']}/lock/")
    assert api(parent).post(f"{BASE}/conversations/{conv['id']}/messages/", {"body": "x"}, format="json").status_code == 403


def test_export_and_admin_view_are_audited(api, tenant, parent):
    from apps.audit.models import AuditLog

    conv = start(api(parent), tenant.users["Teacher"], message="hello").json()
    principal = api(tenant.users["Principal"])
    assert principal.get(f"{BASE}/conversations/{conv['id']}/messages/").status_code == 200
    body = principal.get(f"{BASE}/conversations/{conv['id']}/export/").json()
    assert body["messages"][0]["body"] == "hello"
    actions = set(AuditLog.objects.values_list("action", flat=True))
    assert {"message.admin_opened_conversation", "message.exported"} <= actions
    assert api(tenant.users["Teacher"]).get(f"{BASE}/conversations/{conv['id']}/export/").status_code == 403


def test_broadcast(api, tenant, parent):
    principal = api(tenant.users["Principal"])
    res = principal.post(f"{BASE}/broadcasts/", {"title": "School closed", "body": "Snow day", "audience": "parents"}, format="json")
    assert res.status_code == 201 and res.json()["recipients"] == 1
    conv = api(parent).get(f"{BASE}/conversations/").json()["results"][0]
    assert conv["type"] == "broadcast" and conv["members"] == []  # recipients don't see each other
    assert api(parent).post(f"{BASE}/conversations/{conv['id']}/messages/", {"body": "ok"}, format="json").status_code == 403
    assert principal.get(f"{BASE}/broadcasts/").json()[0]["audience_count"] == 1
    assert api(tenant.users["Teacher"]).post(f"{BASE}/broadcasts/", {"title": "x", "body": "y", "audience": "all"}, format="json").status_code == 403


def test_contacts(api, tenant, parent, stranger_teacher):
    rows = {r["email"]: r["access"] for r in api(parent).get(f"{BASE}/conversations/contacts/").json()}
    assert rows[tenant.users["Teacher"].email] == "allowed"
    assert rows[stranger_teacher.email] == "request"
    assert tenant.users["Accountant"].email not in rows


@pytest.mark.django_db(transaction=True)
def test_websocket_receives_new_messages(tenant, parent):
    from config.asgi import application

    teacher = tenant.users["Teacher"]
    token = str(AccessToken.for_user(teacher))

    async def scenario():
        comm = WebsocketCommunicator(application, "/ws/messaging/", headers=[
            (b"cookie", f"access_token={token}".encode()), (b"origin", b"http://localhost"),
        ])
        connected, _ = await comm.connect()
        assert connected

        from channels.db import database_sync_to_async

        from apps.messaging import services

        @database_sync_to_async
        def send():
            conv, _ = services.get_or_create_direct(tenant.org.id, parent, teacher)
            services.send_message(conv, parent, "ping")

        await send()
        event = await comm.receive_json_from(timeout=2)
        assert event["event"] == "message.created" and event["payload"]["body"] == "ping"
        await comm.disconnect()

    async_to_sync(scenario)()


@pytest.mark.django_db(transaction=True)
def test_websocket_rejects_anonymous(tenant):
    from config.asgi import application

    async def scenario():
        comm = WebsocketCommunicator(application, "/ws/messaging/", headers=[(b"origin", b"http://localhost")])
        connected, code = await comm.connect()
        assert not connected

    async_to_sync(scenario)()


def test_participants_table_consistency(tenant, parent):
    from apps.messaging import services

    conv, _ = services.get_or_create_direct(tenant.org.id, parent, tenant.users["Teacher"])
    assert Participant.objects.filter(conversation=conv).count() == 2
