"""Exam workflow: marks validation, lock and publish rules."""
from decimal import Decimal

import pytest

from apps.academics.models import Subject
from apps.exams.models import ExamRoom, ExamSubject, GradeBand, GradeScale, Mark
from apps.students.models import Student
from apps.teachers.models import Teacher

pytestmark = pytest.mark.django_db


@pytest.fixture
def teacher(api, tenant):
    return api(tenant.users["Teacher"])


@pytest.fixture
def principal(api, tenant):
    return api(tenant.users["Principal"])


def mark(client, tenant, student=None, **data):
    return client.post("/api/v1/exams/marks/", {
        "exam_subject": str(tenant.exam_subject.id),
        "student": str((student or tenant.student).id), **data,
    }, format="json")


def test_valid_mark(teacher, tenant):
    assert mark(teacher, tenant, marks_obtained="78.5").status_code == 201


@pytest.mark.parametrize("value", ["-1", "100.5"])
def test_marks_out_of_range_rejected(teacher, tenant, value):
    assert mark(teacher, tenant, marks_obtained=value).status_code == 400


def test_student_must_be_in_exam_subject_class(teacher, tenant):
    other = Student.objects.create(
        organization=tenant.org, first_name="B", last_name="C", admission_number="ADM-2",
        academic_year=tenant.year, class_level=tenant.other_grade,
    )
    res = mark(teacher, tenant, student=other, marks_obtained="50")
    assert res.status_code == 400
    assert "student" in res.json()


def test_absent_clears_marks(teacher, tenant):
    res = mark(teacher, tenant, marks_obtained="50", is_absent=True)
    assert res.status_code == 201
    assert res.json()["marks_obtained"] is None


def test_locked_exam_freezes_marks_including_delete(teacher, principal, tenant):
    mid = mark(teacher, tenant, marks_obtained="60").json()["id"]
    assert principal.post(f"/api/v1/exams/exams/{tenant.exam.id}/lock/").status_code == 200
    assert teacher.patch(f"/api/v1/exams/marks/{mid}/", {"marks_obtained": "99"}, format="json").status_code == 400
    assert teacher.delete(f"/api/v1/exams/marks/{mid}/").status_code == 400
    assert Mark.objects.filter(pk=mid).exists()


def test_locked_exam_freezes_exam_subjects(principal, tenant):
    principal.post(f"/api/v1/exams/exams/{tenant.exam.id}/lock/")
    res = principal.patch(f"/api/v1/exams/exam-subjects/{tenant.exam_subject.id}/", {"full_marks": "50"}, format="json")
    assert res.status_code == 400


def test_pass_marks_cannot_exceed_full_marks(principal, tenant):
    res = principal.patch(f"/api/v1/exams/exam-subjects/{tenant.exam_subject.id}/", {"pass_marks": "120"}, format="json")
    assert res.status_code == 400


def test_publish_requires_lock_and_unlock_requires_unpublish(principal, tenant):
    base = f"/api/v1/exams/exams/{tenant.exam.id}"
    assert principal.post(f"{base}/publish/").status_code == 400
    assert principal.post(f"{base}/lock/").status_code == 200
    missing = principal.post(f"{base}/publish/")
    assert missing.status_code == 400 and missing.json()["missing"][0]["total"] == 1
    assert principal.post(f"{base}/publish/", {"force": True}, format="json").status_code == 200
    assert principal.post(f"{base}/unlock/").status_code == 400


def test_exam_dates_must_be_ordered(principal, tenant):
    res = principal.post("/api/v1/exams/exams/", {
        "name": "T2", "academic_year": str(tenant.year.id),
        "start_date": "2026-12-10", "end_date": "2026-12-01",
    }, format="json")
    assert res.status_code == 400


# --- grading, components, results -------------------------------------------



@pytest.fixture
def scale(tenant):
    s = GradeScale.objects.create(organization=tenant.org, name="Standard")
    for grade, lo, hi, gpa, ok in [("A", 80, 100, 4, True), ("B", 60, Decimal("79.99"), 3, True),
                                   ("C", 40, Decimal("59.99"), 2, True), ("F", 0, Decimal("39.99"), 0, False)]:
        GradeBand.objects.create(organization=tenant.org, scale=s, grade=grade, min_percent=lo,
                                 max_percent=hi, gpa=gpa, is_pass=ok)
    tenant.exam.grade_scale = s
    tenant.exam.save()
    return s


def test_grade_bands_cannot_overlap(principal, scale):
    res = principal.post("/api/v1/exams/grade-bands/", {
        "scale": str(scale.id), "grade": "X", "min_percent": "75", "max_percent": "85", "gpa": "3.5",
    }, format="json")
    assert res.status_code == 400


def test_component_marks_sum_to_total(teacher, tenant):
    ExamSubject.objects.filter(pk=tenant.exam_subject.pk).update(theory_marks=75, practical_marks=25)
    missing = mark(teacher, tenant, theory_marks="60")
    assert missing.status_code == 400 and "practical_marks" in missing.json()
    over = mark(teacher, tenant, theory_marks="80", practical_marks="20")
    assert over.status_code == 400
    ok = mark(teacher, tenant, theory_marks="60", practical_marks="20.5")
    assert ok.status_code == 201 and ok.json()["marks_obtained"] == "80.50"


def test_results_grades_gpa_and_ranks(principal, tenant, scale):
    s2 = Student.objects.create(organization=tenant.org, first_name="Bina", last_name="K", admission_number="ADM-2",
                                academic_year=tenant.year, class_level=tenant.grade, section=tenant.section)
    s3 = Student.objects.create(organization=tenant.org, first_name="Chet", last_name="K", admission_number="ADM-3",
                                academic_year=tenant.year, class_level=tenant.grade, section=tenant.section)
    res = principal.post("/api/v1/exams/marks/bulk/", {"exam_subject": str(tenant.exam_subject.id), "records": [
        {"student": str(tenant.student.id), "marks_obtained": "85"},
        {"student": str(s2.id), "marks_obtained": "85"},
        {"student": str(s3.id), "marks_obtained": "30"},
    ]}, format="json")
    assert res.status_code == 200 and res.json() == {"saved": 3, "created": 3}
    rows = principal.get(f"/api/v1/exams/exams/{tenant.exam.id}/results/", {"class_level": str(tenant.grade.id)}).json()["rows"]
    by_name = {r["name"]: r for r in rows}
    assert by_name["Asha Rai"]["rank"] == 1 and by_name["Bina K"]["rank"] == 1 and by_name["Chet K"]["rank"] == 3
    assert by_name["Asha Rai"]["grade"] == "A" and by_name["Asha Rai"]["gpa"] == 4.0
    assert by_name["Chet K"]["result"] == "fail" and by_name["Chet K"]["grade"] == "F"


def test_missing_marks_are_incomplete_and_unranked(principal, tenant):
    rows = principal.get(f"/api/v1/exams/exams/{tenant.exam.id}/results/", {"class_level": str(tenant.grade.id)}).json()["rows"]
    assert rows[0]["result"] == "incomplete" and rows[0]["rank"] is None


def test_bulk_marks_scope_and_lock(teacher, principal, tenant):
    other = Student.objects.create(organization=tenant.org, first_name="O", last_name="S", admission_number="ADM-O",
                                   academic_year=tenant.year, class_level=tenant.grade)  # no section
    res = teacher.post("/api/v1/exams/marks/bulk/", {"exam_subject": str(tenant.exam_subject.id), "records": [
        {"student": str(other.id), "marks_obtained": "50"},
    ]}, format="json")
    assert res.status_code == 400  # teacher teaches section A only
    principal.post(f"/api/v1/exams/exams/{tenant.exam.id}/lock/")
    res = principal.post("/api/v1/exams/marks/bulk/", {"exam_subject": str(tenant.exam_subject.id), "records": [
        {"student": str(tenant.student.id), "marks_obtained": "50"},
    ]}, format="json")
    assert res.status_code == 400


def test_marks_sheet_lists_gradable_students(teacher, tenant):
    mark(teacher, tenant, marks_obtained="70")
    body = teacher.get("/api/v1/exams/marks/sheet/", {"exam_subject": str(tenant.exam_subject.id)}).json()
    assert body["entered"] == 1 and body["rows"][0]["mark"]["marks_obtained"] == "70.00"


def test_schedule_conflicts_detected(principal, tenant):
    room = ExamRoom.objects.create(organization=tenant.org, name="Hall 1", capacity=40)
    inv = Teacher.objects.create(organization=tenant.org, full_name="Inv", employee_id="EMP-I")
    ExamSubject.objects.filter(pk=tenant.exam_subject.pk).update(
        exam_date="2026-11-10", start_time="10:00", end_time="12:00", room=room, invigilator=inv,
    )
    sci = Subject.objects.create(organization=tenant.org, school=tenant.school, name="Science", code="SCI")
    res = principal.post("/api/v1/exams/exam-subjects/", {
        "exam": str(tenant.exam.id), "class_level": str(tenant.other_grade.id), "subject": str(sci.id),
        "exam_date": "2026-11-10", "start_time": "11:00", "end_time": "13:00", "room": str(room.id),
    }, format="json")
    assert res.status_code == 400 and "room Hall 1" in str(res.json())
    ok = principal.post("/api/v1/exams/exam-subjects/", {
        "exam": str(tenant.exam.id), "class_level": str(tenant.other_grade.id), "subject": str(sci.id),
        "exam_date": "2026-11-10", "start_time": "12:00", "end_time": "13:00", "room": str(room.id),
    }, format="json")
    assert ok.status_code == 201  # back-to-back is fine


def test_report_card_and_admit_cards(principal, tenant, scale):
    mark(principal, tenant, marks_obtained="65")
    card = principal.get(f"/api/v1/exams/exams/{tenant.exam.id}/report-card/", {"student": str(tenant.student.id)}).json()
    assert card["result"]["grade"] == "B" and card["result"]["result"] == "pass" and card["class_size"] == 1
    admit = principal.get(f"/api/v1/exams/exams/{tenant.exam.id}/admit-cards/", {"class_level": str(tenant.grade.id)}).json()
    assert admit["cards"][0]["name"] == "Asha Rai" and admit["exam"]["code"] == ""


def test_exam_with_marks_cannot_be_deleted(principal, tenant):
    mark(principal, tenant, marks_obtained="65")
    assert principal.delete(f"/api/v1/exams/exams/{tenant.exam.id}/").status_code == 400


def test_new_exam_gets_code(principal, tenant):
    res = principal.post("/api/v1/exams/exams/", {"name": "T3", "academic_year": str(tenant.year.id)}, format="json")
    assert res.json()["code"].startswith("EXM-")


def test_portal_results_include_grades(api, principal, tenant, scale):
    mark(principal, tenant, marks_obtained="90")
    base = f"/api/v1/exams/exams/{tenant.exam.id}"
    principal.post(f"{base}/lock/")
    principal.post(f"{base}/publish/")
    results = api(tenant.users["Student"]).get("/api/v1/me/results/").json()
    assert results[0]["grade"] == "A" and results[0]["rank"] == 1 and results[0]["result"] == "pass"
