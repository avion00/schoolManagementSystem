"""Teachers: records, class scoping, staff attendance and the teacher portal."""
import datetime

import pytest
from django.utils import timezone

from apps.attendance.models import Attendance
from apps.exams.models import Mark
from apps.students.models import Student
from apps.teachers.models import StaffAttendance, Teacher, TeacherAssignment

pytestmark = pytest.mark.django_db


@pytest.fixture
def principal(api, tenant):
    return api(tenant.users["Principal"])


@pytest.fixture
def teacher_client(api, tenant):
    return api(tenant.users["Teacher"])


@pytest.fixture
def outsider(tenant):
    """A student in a section the teacher does not teach."""
    return Student.objects.create(
        organization=tenant.org, first_name="Out", last_name="Sider", admission_number="ADM-OUT",
        academic_year=tenant.year, class_level=tenant.other_grade,
    )


# --- records ----------------------------------------------------------------

def test_teacher_serializer_derives_classes_and_subjects(principal, tenant):
    body = principal.get(f"/api/v1/teachers/{tenant.teacher.id}/").json()
    assert body["subjects"] == ["Maths"]
    assert body["assigned_classes"] == ["Grade 8 - A"]
    assert body["class_teacher_of"] == "Grade 8 - A"
    assert body["has_login"] is True


def test_duplicate_employee_id_is_400(principal):
    res = principal.post("/api/v1/teachers/", {"full_name": "Dup", "employee_id": "EMP-1"}, format="json")
    assert res.status_code == 400 and "employee_id" in res.json()


def test_one_class_teacher_per_section(principal, tenant):
    other = Teacher.objects.create(organization=tenant.org, full_name="B", employee_id="EMP-2")
    res = principal.post("/api/v1/teacher-assignments/", {
        "teacher": str(other.id), "academic_year": str(tenant.year.id),
        "class_level": str(tenant.grade.id), "section": str(tenant.section.id),
        "is_class_teacher": True,
    }, format="json")
    assert res.status_code == 400 and "is_class_teacher" in res.json()


def test_create_login_and_leaving_revokes_access(principal, tenant):
    t = Teacher.objects.create(organization=tenant.org, full_name="New T", employee_id="EMP-9")
    res = principal.post(f"/api/v1/teachers/{t.id}/create-login/", {"email": "newt@x.test"}, format="json")
    assert res.status_code == 200
    t.refresh_from_db()
    assert t.user.user_roles.get().role.name == "Teacher"
    principal.patch(f"/api/v1/teachers/{t.id}/", {"status": "resigned"}, format="json")
    t.user.refresh_from_db()
    assert t.user.is_active is False


# --- class scoping (student.view.class) -------------------------------------

def test_teacher_only_sees_their_students(teacher_client, tenant, outsider):
    ids = {s["id"] for s in teacher_client.get("/api/v1/students/").json()["results"]}
    assert ids == {str(tenant.student.id)}
    assert teacher_client.get(f"/api/v1/students/{outsider.id}/").status_code == 404
    assert teacher_client.get(f"/api/v1/students/{tenant.student.id}/overview/").status_code == 200


def test_principal_sees_all_students(principal, tenant, outsider):
    assert principal.get("/api/v1/students/").json()["count"] == 2


def test_teacher_without_assignments_sees_nobody(api, tenant):
    TeacherAssignment.objects.all().delete()
    assert api(tenant.users["Teacher"]).get("/api/v1/students/").json()["count"] == 0


# --- staff attendance -------------------------------------------------------

def test_bulk_staff_attendance_upserts(principal, tenant):
    today = str(timezone.localdate())
    payload = {"date": today, "records": [{"teacher": str(tenant.teacher.id), "status": "present"}]}
    assert principal.post("/api/v1/staff-attendance/bulk/", payload, format="json").json()["results"][0]["created"]
    payload["records"][0]["status"] = "late"
    res = principal.post("/api/v1/staff-attendance/bulk/", payload, format="json").json()
    assert res["results"][0] == {"teacher": str(tenant.teacher.id), "status": "late", "created": False}
    assert StaffAttendance.objects.count() == 1


def test_staff_attendance_rejects_future_and_bad_times(principal, tenant):
    tomorrow = str(timezone.localdate() + datetime.timedelta(days=1))
    res = principal.post("/api/v1/staff-attendance/bulk/", {
        "date": tomorrow, "records": [{"teacher": str(tenant.teacher.id), "status": "present"}],
    }, format="json")
    assert res.status_code == 400
    res = principal.post("/api/v1/staff-attendance/", {
        "teacher": str(tenant.teacher.id), "date": str(timezone.localdate()), "status": "present",
        "check_in": "10:00", "check_out": "09:00",
    }, format="json")
    assert res.status_code == 400


def test_staff_attendance_requires_permission(teacher_client):
    assert teacher_client.get("/api/v1/staff-attendance/").status_code == 403


def test_monthly_sheet_and_summary(principal, tenant):
    d = datetime.date(2026, 9, 3)
    StaffAttendance.objects.create(organization=tenant.org, teacher=tenant.teacher, date=d, status="absent")
    sheet = principal.get("/api/v1/staff-attendance/monthly/", {"year": 2026, "month": 9}).json()
    row = sheet["rows"][0]
    assert sheet["days"] == 30 and row["records"]["3"] == "absent" and row["absent"] == 1
    summary = principal.get("/api/v1/staff-attendance/summary/", {"date__gte": "2026-09-01"}).json()
    assert summary["absent"] == 1 and summary["percentage"] == 0.0
    assert principal.get("/api/v1/staff-attendance/monthly/", {"month": 13}).status_code == 400


# --- teacher portal ---------------------------------------------------------

def test_teacher_dashboard(teacher_client, tenant):
    Mark.objects.create(
        organization=tenant.org, exam_subject=tenant.exam_subject, student=tenant.student,
        marks_obtained=50,
    )
    body = teacher_client.get("/api/v1/me/teacher/dashboard/").json()
    card = body["classes"][0]
    assert card["students"] == 1 and card["is_class_teacher"]
    assert card["marks_progress"][0]["status"] == "complete"
    assert body["pending_attendance"][0]["section_name"] == "A"
    assert body["totals"] == {"classes": 1, "students": 1, "pending_attendance": 1, "pending_marks": 0}


def test_attendance_taken_clears_pending(teacher_client, tenant):
    Attendance.objects.create(
        organization=tenant.org, student=tenant.student, date=timezone.localdate(), status="present"
    )
    assert teacher_client.get("/api/v1/me/teacher/dashboard/").json()["pending_attendance"] == []


def test_class_roster_is_scoped_to_own_assignments(teacher_client, api, tenant, other_tenant):
    assignment = tenant.teacher.assignments.get()
    roster = teacher_client.get(f"/api/v1/me/teacher/classes/{assignment.id}/students/").json()
    assert [r["id"] for r in roster] == [str(tenant.student.id)]
    foreign = other_tenant.teacher.assignments.get()
    assert teacher_client.get(f"/api/v1/me/teacher/classes/{foreign.id}/students/").status_code == 404


def test_teacher_portal_requires_teacher_profile(api, tenant):
    assert api(tenant.users["Principal"]).get("/api/v1/me/teacher/dashboard/").status_code == 403
    assert api(tenant.users["Teacher"]).get("/api/v1/auth/me/").json()["is_teacher"] is True


def test_assignment_without_subject_and_duplicates(principal, tenant):
    payload = {
        "teacher": str(tenant.teacher.id), "academic_year": str(tenant.year.id),
        "class_level": str(tenant.other_grade.id),
    }
    assert principal.post("/api/v1/teacher-assignments/", payload, format="json").status_code == 201
    assert principal.post("/api/v1/teacher-assignments/", payload, format="json").status_code == 400
