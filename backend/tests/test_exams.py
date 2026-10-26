"""Exam workflow: marks validation, lock and publish rules."""
import pytest

from apps.exams.models import Mark
from apps.students.models import Student

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
    assert principal.post(f"{base}/publish/").status_code == 200
    assert principal.post(f"{base}/unlock/").status_code == 400


def test_exam_dates_must_be_ordered(principal, tenant):
    res = principal.post("/api/v1/exams/exams/", {
        "name": "T2", "academic_year": str(tenant.year.id),
        "start_date": "2026-12-10", "end_date": "2026-12-01",
    }, format="json")
    assert res.status_code == 400
