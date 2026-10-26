"""Timetable: period slots, clash rules, grids and portal views."""
import datetime

import pytest
from django.utils import timezone

from apps.academics.models import Section, Subject
from apps.exams.models import ExamRoom
from apps.timetable import services
from apps.timetable.models import PeriodSlot, RoutineEntry

pytestmark = pytest.mark.django_db


@pytest.fixture
def principal(api, tenant):
    return api(tenant.users["Principal"])


@pytest.fixture
def slots(tenant):
    mk = lambda shift, no, a, b, brk=False: PeriodSlot.objects.create(  # noqa: E731
        organization=tenant.org, shift=shift, period_no=no,
        start_time=datetime.time(*a), end_time=datetime.time(*b), is_break=brk,
    )
    return {
        "p1": mk("day", 1, (10, 0), (10, 45)),
        "p2": mk("day", 2, (10, 45), (11, 30)),
        "lunch": mk("day", 3, (11, 30), (12, 0), brk=True),
        "m_overlap": mk("morning", 7, (10, 30), (11, 15)),
    }


@pytest.fixture
def room(tenant):
    return ExamRoom.objects.create(organization=tenant.org, name="Room 204", capacity=40)


def entry(client, tenant, period, **extra):
    return client.post("/api/v1/timetable/entries/", {
        "academic_year": str(tenant.year.id), "section": str(tenant.section.id), "day": "monday",
        "period": str(period.id), "subject": str(tenant.subject.id), **extra,
    }, format="json")


def test_period_slots_validate_times_and_overlap(principal):
    url = "/api/v1/timetable/periods/"
    assert principal.post(url, {"shift": "day", "period_no": 1, "start_time": "10:00", "end_time": "09:00"}, format="json").status_code == 400
    assert principal.post(url, {"shift": "day", "period_no": 1, "start_time": "10:00", "end_time": "10:45"}, format="json").status_code == 201
    assert principal.post(url, {"shift": "day", "period_no": 2, "start_time": "10:30", "end_time": "11:00"}, format="json").status_code == 400
    assert principal.post(url, {"shift": "morning", "period_no": 1, "start_time": "10:30", "end_time": "11:00"}, format="json").status_code == 201


def test_section_slot_clash(principal, tenant, slots):
    assert entry(principal, tenant, slots["p1"]).status_code == 201
    res = entry(principal, tenant, slots["p1"])
    assert res.status_code == 400 and "already has" in str(res.json())
    assert entry(principal, tenant, slots["p1"], day="tuesday").status_code == 201


def test_teacher_and_room_clash_across_shifts(principal, tenant, slots, room):
    other = Section.objects.create(organization=tenant.org, class_level=tenant.other_grade, name="B")
    assert entry(principal, tenant, slots["p1"], teacher=str(tenant.teacher.id), room=str(room.id)).status_code == 201
    # 10:30-11:15 (morning shift) overlaps 10:00-10:45 for the same teacher
    res = entry(principal, tenant, slots["m_overlap"], section=str(other.id), teacher=str(tenant.teacher.id))
    assert res.status_code == 400 and tenant.teacher.full_name in str(res.json())
    res = entry(principal, tenant, slots["m_overlap"], section=str(other.id), room=str(room.id))
    assert res.status_code == 400 and "Room 204" in str(res.json())
    # back-to-back is fine
    assert entry(principal, tenant, slots["p2"], section=str(other.id), teacher=str(tenant.teacher.id)).status_code == 201


def test_inactive_entries_do_not_block(principal, tenant, slots):
    first = entry(principal, tenant, slots["p1"]).json()
    principal.patch(f"/api/v1/timetable/entries/{first['id']}/", {"status": "suspended"}, format="json")
    assert entry(principal, tenant, slots["p1"]).status_code == 201


def test_no_classes_in_breaks(principal, tenant, slots):
    assert entry(principal, tenant, slots["lunch"]).status_code == 400


def test_grid_and_stats(principal, tenant, slots):
    entry(principal, tenant, slots["p2"], teacher=str(tenant.teacher.id))
    entry(principal, tenant, slots["p1"], teacher=str(tenant.teacher.id))
    grid = principal.get("/api/v1/timetable/entries/grid/", {"section": str(tenant.section.id)}).json()
    assert [r["period_no"] for r in grid["days"]["monday"]] == [1, 2]
    by_teacher = principal.get("/api/v1/timetable/entries/grid/", {"teacher": str(tenant.teacher.id)}).json()
    assert by_teacher["periods"] == 2
    assert principal.get("/api/v1/timetable/entries/grid/").status_code == 400
    stats = principal.get("/api/v1/timetable/entries/stats/").json()
    assert stats == {"weekly_periods": 2, "sections": 1, "teachers": 1, "unassigned_teacher": 0}


def test_conflict_report_finds_legacy_clashes(principal, tenant, slots):
    other = Section.objects.create(organization=tenant.org, class_level=tenant.other_grade, name="B")
    for sec in (tenant.section, other):  # bypass validation, as imported data might
        RoutineEntry.objects.create(organization=tenant.org, academic_year=tenant.year, section=sec,
                                    day="monday", period=slots["p1"], subject=tenant.subject, teacher=tenant.teacher)
    body = principal.get("/api/v1/timetable/entries/conflicts/").json()
    assert body["count"] == 1


def test_permissions(api, tenant, slots):
    teacher = api(tenant.users["Teacher"])
    assert teacher.get("/api/v1/timetable/entries/").status_code == 200
    assert entry(teacher, tenant, slots["p1"]).status_code == 403
    student = api(tenant.users["Student"])
    assert student.get("/api/v1/timetable/periods/").status_code == 200
    assert student.get("/api/v1/timetable/entries/").status_code == 403


def test_portals(api, principal, tenant, slots):
    sci = Subject.objects.create(organization=tenant.org, school=tenant.school, name="Science", code="SCI")
    today = timezone.localtime().strftime("%A").lower()
    entry(principal, tenant, slots["p1"], day=today, teacher=str(tenant.teacher.id))
    entry(principal, tenant, slots["p2"], day=today, subject=str(sci.id))
    student = api(tenant.users["Student"])
    week = student.get("/api/v1/me/timetable/").json()
    assert len(week[today]) == 2
    now = student.get("/api/v1/me/today/").json()
    assert [p["subject"] for p in now["periods"]] == ["Maths", "Science"]
    assert {p["state"] for p in now["periods"]} <= {"completed", "ongoing", "upcoming"}
    mine = api(tenant.users["Teacher"]).get("/api/v1/me/teacher/today/").json()
    assert [p["subject"] for p in mine["periods"]] == ["Maths"]


def test_today_states():
    class P:  # minimal stand-ins
        def __init__(self, a, b):
            self.start_time, self.end_time, self.period_no, self.label, self.is_break = a, b, 1, "", False
    class E:
        def __init__(self, a, b):
            self.id = self.period_id = self.subject_id = self.section_id = 1
            self.day, self.period = "monday", P(a, b)
            self.subject = type("S", (), {"name": "X"})
            self.teacher_id = self.room_id = None
            self.section, self.status, self.notes = "8-A", "active", ""
    now = timezone.make_aware(datetime.datetime(2026, 10, 26, 10, 50))  # a Monday
    rows = services.today_schedule(
        [E(datetime.time(10, 0), datetime.time(10, 45)), E(datetime.time(10, 45), datetime.time(11, 30)),
         E(datetime.time(11, 30), datetime.time(12, 0))], now=now,
    )["periods"]
    assert [r["state"] for r in rows] == ["completed", "ongoing", "upcoming"]
