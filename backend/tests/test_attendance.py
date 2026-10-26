"""Attendance rules (scope, dates, holidays) and reports."""
import datetime

import pytest
from django.utils import timezone

from apps.attendance.models import Attendance, Holiday
from apps.students.models import Student

pytestmark = pytest.mark.django_db

TODAY = timezone.localdate


@pytest.fixture
def teacher(api, tenant):
    return api(tenant.users["Teacher"])


@pytest.fixture
def principal(api, tenant):
    return api(tenant.users["Principal"])


@pytest.fixture
def outsider(tenant):
    return Student.objects.create(
        organization=tenant.org, first_name="Out", last_name="Sider", admission_number="ADM-OUT",
        academic_year=tenant.year, class_level=tenant.other_grade,
    )


def bulk(client, date, *records):
    return client.post("/api/v1/attendance/bulk/", {
        "date": str(date), "records": [{"student": str(s.id), "status": st} for s, st in records],
    }, format="json")


def test_teacher_marks_own_class(teacher, tenant):
    res = bulk(teacher, TODAY(), (tenant.student, "present"))
    assert res.status_code == 200 and res.json()["results"][0]["created"]
    res = bulk(teacher, TODAY(), (tenant.student, "late"))
    assert res.json()["results"][0] == {"student": str(tenant.student.id), "status": "late", "created": False}


def test_teacher_cannot_mark_other_classes(teacher, tenant, outsider):
    assert bulk(teacher, TODAY(), (outsider, "absent")).status_code == 400
    res = teacher.post("/api/v1/attendance/", {
        "student": str(outsider.id), "date": str(TODAY()), "status": "absent",
    }, format="json")
    assert res.status_code == 400
    assert not Attendance.objects.exists()


def test_principal_marks_any_class(principal, outsider):
    assert bulk(principal, TODAY(), (outsider, "absent")).status_code == 200


def test_future_and_holiday_rejected(principal, tenant):
    assert bulk(principal, TODAY() + datetime.timedelta(days=1), (tenant.student, "present")).status_code == 400
    Holiday.objects.create(organization=tenant.org, name="Dashain", start_date=TODAY(), end_date=TODAY())
    res = bulk(principal, TODAY(), (tenant.student, "present"))
    assert res.status_code == 400 and "Dashain" in str(res.json())


def test_edit_window_locks_old_days_for_teachers(teacher, principal, tenant, settings):
    settings.ATTENDANCE_EDIT_WINDOW_DAYS = 3
    old = TODAY() - datetime.timedelta(days=5)
    assert bulk(teacher, old, (tenant.student, "present")).status_code == 400
    assert bulk(principal, old, (tenant.student, "present")).status_code == 200
    rec = Attendance.objects.get()
    assert teacher.patch(f"/api/v1/attendance/{rec.id}/", {"status": "absent"}, format="json").status_code == 400
    assert teacher.delete(f"/api/v1/attendance/{rec.id}/").status_code == 400


def test_inactive_and_duplicate_students_rejected(principal, tenant):
    assert bulk(principal, TODAY(), (tenant.student, "present"), (tenant.student, "absent")).status_code == 400
    Student.objects.filter(pk=tenant.student.pk).update(status="left")
    assert bulk(principal, TODAY(), (tenant.student, "present")).status_code == 400


def test_soft_deleted_record_can_be_recreated(principal, tenant):
    bulk(principal, TODAY(), (tenant.student, "present"))
    rec = Attendance.objects.get()
    assert principal.delete(f"/api/v1/attendance/{rec.id}/").status_code == 204
    res = principal.post("/api/v1/attendance/", {
        "student": str(tenant.student.id), "date": str(TODAY()), "status": "absent",
    }, format="json")
    assert res.status_code == 201


def test_teacher_list_is_scoped(teacher, principal, tenant, outsider):
    bulk(principal, TODAY(), (tenant.student, "present"), (outsider, "absent"))
    assert teacher.get("/api/v1/attendance/").json()["count"] == 1
    assert principal.get("/api/v1/attendance/").json()["count"] == 2


def test_register_shows_existing_marks_and_holiday(teacher, tenant):
    bulk(teacher, TODAY(), (tenant.student, "late"))
    body = teacher.get("/api/v1/attendance/register/", {"section": str(tenant.section.id)}).json()
    assert body["marked"] == 1 and body["students"][0]["status"] == "late" and body["holiday"] is None
    assert teacher.get("/api/v1/attendance/register/").status_code == 400


def test_monthly_sheet(principal, tenant):
    d = datetime.date(2026, 9, 2)
    Attendance.objects.create(organization=tenant.org, student=tenant.student, date=d, status="absent")
    Attendance.objects.create(organization=tenant.org, student=tenant.student, date=d.replace(day=3), status="present")
    Holiday.objects.create(organization=tenant.org, name="Teej", start_date=d.replace(day=10), end_date=d.replace(day=10))
    body = principal.get("/api/v1/attendance/monthly/", {"year": 2026, "month": 9, "section": str(tenant.section.id)}).json()
    row = body["rows"][0]
    assert row["records"]["2"] == "absent" and row["records"]["4"] is None
    assert row["counts"]["absent"] == 1 and row["rate"] == 50.0
    assert body["holidays"][0]["name"] == "Teej"


def test_student_and_class_reports(principal, tenant):
    for day, status in [(1, "present"), (2, "absent"), (3, "late"), (4, "present")]:
        Attendance.objects.create(organization=tenant.org, student=tenant.student,
                                  date=datetime.date(2026, 9, day), status=status)
    rep = principal.get("/api/v1/attendance/student-report/", {
        "student": str(tenant.student.id), "date_from": "2026-09-01", "date_to": "2026-09-30",
    }).json()
    assert rep["total"] == 4 and rep["rate"] == 75.0 and rep["months"] == [
        {"month": "2026-09", "present": 3, "absent": 1, "total": 4}
    ]
    cls = principal.get("/api/v1/attendance/class-report/", {"date_from": "2026-09-01", "date_to": "2026-09-30"}).json()
    row = next(r for r in cls["rows"] if r["section_name"] == "A")
    assert row["students"] == 1 and row["rate"] == 75.0


def test_stats(principal, tenant):
    Attendance.objects.create(organization=tenant.org, student=tenant.student, date=TODAY(), status="late")
    body = principal.get("/api/v1/attendance/stats/").json()
    assert body["today"]["late"] == 1 and body["monthly_rate"] == 100.0
    assert len(body["monthly_trend"]) == 6


def test_holidays_readable_by_everyone_but_managed_by_admins(api, tenant):
    principal = api(tenant.users["Principal"])
    res = principal.post("/api/v1/holidays/", {"name": "Tihar", "start_date": "2026-11-01", "end_date": "2026-11-05"}, format="json")
    assert res.status_code == 201
    assert principal.post("/api/v1/holidays/", {"name": "Bad", "start_date": "2026-11-05", "end_date": "2026-11-01"}, format="json").status_code == 400
    single = principal.post("/api/v1/holidays/", {"name": "One", "start_date": "2026-12-25"}, format="json").json()
    assert single["end_date"] == "2026-12-25"
    student = api(tenant.users["Student"])
    assert student.get("/api/v1/holidays/").json()["count"] == 2
    assert student.post("/api/v1/holidays/", {"name": "x", "start_date": "2026-12-01"}, format="json").status_code == 403
