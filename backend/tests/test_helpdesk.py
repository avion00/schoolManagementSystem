"""Help desk: tickets, SLA, replies/internal notes, agent workflow."""
import datetime

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone

from apps.communications.models import Notification
from apps.helpdesk.models import Ticket

pytestmark = pytest.mark.django_db
H = "/api/v1/helpdesk/tickets"


@pytest.fixture(autouse=True)
def media(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path


@pytest.fixture
def agent(api, tenant):
    return api(tenant.users["Principal"])


@pytest.fixture
def requester(api, tenant):
    return api(tenant.users["Student"])


def open_ticket(client, **extra):
    res = client.post(f"{H}/", {"subject": "Can't see results", "description": "Portal blank",
                                "category": "exam", "priority": "high", **extra}, format="json")
    assert res.status_code == 201, res.json()
    return res.json()


def test_create_sets_code_and_sla(requester):
    t = open_ticket(requester, source="phone")
    assert t["code"].startswith("TKT-") and t["status"] == "new" and t["source"] == "web"
    due = datetime.datetime.fromisoformat(t["due_at"])
    created = datetime.datetime.fromisoformat(t["created_at"])
    assert round((due - created).total_seconds() / 3600) == 8  # high priority
    assert t["sla_status"] == "on_track"


def test_requesters_only_see_their_tickets(requester, api, tenant, agent):
    t = open_ticket(requester)
    assert api(tenant.users["Teacher"]).get(f"{H}/").json()["count"] == 0
    assert api(tenant.users["Teacher"]).get(f"{H}/{t['id']}/").status_code == 404
    assert agent.get(f"{H}/").json()["count"] == 1


def test_internal_notes_hidden_from_requester(requester, agent):
    t = open_ticket(requester)
    agent.post(f"{H}/{t['id']}/reply/", {"body": "Check exam publish flag", "is_internal": True}, format="json")
    agent.post(f"{H}/{t['id']}/reply/", {"body": "Looking into it"}, format="json")
    seen = [m["body"] for m in requester.get(f"{H}/{t['id']}/").json()["messages"]]
    assert seen == ["Looking into it"]
    assert len(agent.get(f"{H}/{t['id']}/").json()["messages"]) == 2
    assert requester.post(f"{H}/{t['id']}/reply/", {"body": "x", "is_internal": True}, format="json").status_code == 403


def test_first_response_and_status_flow(requester, agent, tenant):
    t = open_ticket(requester)
    agent.post(f"{H}/{t['id']}/assign/", {"user": str(tenant.users["Principal"].id)}, format="json")
    reply = agent.post(f"{H}/{t['id']}/reply/", {"body": "Can you send a screenshot?", "status": "waiting_user"}, format="json")
    assert reply.status_code == 201
    body = agent.get(f"{H}/{t['id']}/").json()
    assert body["status"] == "waiting_user" and body["first_response_at"] and body["sla_status"] == "met"
    assert Notification.objects.filter(user=tenant.users["Student"], title__startswith="Reply on").exists()
    requester.post(f"{H}/{t['id']}/reply/", {"body": "Here"}, format="json")
    assert agent.get(f"{H}/{t['id']}/").json()["status"] == "open"  # user replied
    agent.post(f"{H}/{t['id']}/resolve/", {"note": "Results were unpublished; fixed"}, format="json")
    assert requester.post(f"{H}/{t['id']}/rate/", {"rating": 5}, format="json").json() == {"rating": 5}
    events = [e["action"] for e in agent.get(f"{H}/{t['id']}/").json()["events"]]
    assert events[:2] == ["created", "assigned"] and "resolved" in events


def test_assign_requires_agent_assignee(agent, requester, tenant):
    t = open_ticket(requester)
    assert agent.post(f"{H}/{t['id']}/assign/", {"user": str(tenant.users["Teacher"].id)}, format="json").status_code == 400
    assert requester.post(f"{H}/{t['id']}/assign/", {"user": str(tenant.users["Principal"].id)}, format="json").status_code == 403


def test_reopen_window(requester, agent):
    t = open_ticket(requester)
    agent.post(f"{H}/{t['id']}/resolve/")
    assert requester.post(f"{H}/{t['id']}/reopen/").json()["status"] == "open"
    agent.post(f"{H}/{t['id']}/resolve/")
    Ticket.objects.filter(pk=t["id"]).update(resolved_at=timezone.now() - datetime.timedelta(days=8))
    assert requester.post(f"{H}/{t['id']}/reopen/").status_code == 400
    assert agent.post(f"{H}/{t['id']}/reopen/").status_code == 200  # staff can always reopen


def test_overdue_and_stats(requester, agent):
    t = open_ticket(requester, priority="urgent")
    Ticket.objects.filter(pk=t["id"]).update(due_at=timezone.now() - datetime.timedelta(minutes=5))
    assert agent.get(f"{H}/{t['id']}/").json()["sla_status"] == "overdue"
    stats = agent.get(f"{H}/stats/").json()
    assert stats["open"] == 1 and stats["overdue"] == 1 and stats["unassigned"] == 1
    assert requester.get(f"{H}/stats/").status_code == 403


def test_priority_change_moves_sla(requester, agent):
    t = open_ticket(requester, priority="low")
    res = agent.post(f"{H}/{t['id']}/set-status/", {"status": "in_progress", "priority": "urgent"}, format="json").json()
    hours = (datetime.datetime.fromisoformat(res["due_at"]) - datetime.datetime.fromisoformat(res["created_at"])).total_seconds() / 3600
    assert round(hours) == 2


def test_ticket_attachments_access(requester, agent, api, tenant):
    f = requester.post("/api/v1/files/", {"file": SimpleUploadedFile("shot.png", b"\x89PNG\r\n\x1a\nxxxx")},
                       format="multipart").json()
    open_ticket(requester, attachment_ids=[f["id"]])
    assert agent.get(f["download_url"]).status_code == 200
    assert api(tenant.users["Teacher"]).get(f["download_url"]).status_code == 404


def test_tenant_isolation(requester, api, other_tenant):
    t = open_ticket(requester)
    assert api(other_tenant.users["Principal"]).get(f"{H}/{t['id']}/").status_code == 404


def test_agents_list_for_assignment(api, tenant):
    principal = api(tenant.users["Principal"])
    agents = principal.get("/api/v1/helpdesk/tickets/agents/").json()
    assert any(a["email"] == tenant.users["Principal"].email for a in agents)
    assert api(tenant.users["Student"]).get("/api/v1/helpdesk/tickets/agents/").status_code == 403


def test_agent_can_log_ticket_for_someone(api, tenant):
    student_user = tenant.users["Student"]
    res = api(tenant.users["Principal"]).post("/api/v1/helpdesk/tickets/", {
        "category": "account", "subject": "Can't log in", "description": "Called the office.",
        "priority": "normal", "source": "phone", "requester": str(student_user.id),
    }, format="json")
    assert res.status_code == 201 and res.json()["requester"]["id"] == str(student_user.id)
    # non-agents can't file for others
    other = api(student_user).post("/api/v1/helpdesk/tickets/", {
        "category": "other", "subject": "x", "description": "y", "requester": str(tenant.users["Principal"].id),
    }, format="json").json()
    assert other["requester"]["id"] == str(student_user.id)
