"""Academic structure: classes, sections, subjects, curriculum, syllabus."""
from decimal import Decimal

import pytest

from apps.academics.models import ClassSubject, Section, Subject, SyllabusUnit
from apps.exams.models import Mark
from apps.students.models import Student

pytestmark = pytest.mark.django_db


@pytest.fixture
def principal(api, tenant):
    return api(tenant.users["Principal"])


def test_class_list_counts(principal, tenant):
    Section.objects.create(organization=tenant.org, class_level=tenant.grade, name="B", capacity=30)
    Section.objects.filter(pk=tenant.section.pk).update(capacity=40)
    row = next(c for c in principal.get("/api/v1/academics/class-levels/").json()["results"]
               if c["id"] == str(tenant.grade.id))
    assert (row["sections_count"], row["students_count"], row["total_capacity"]) == (2, 1, 70)


def test_section_stats_and_class_teacher(principal, tenant):
    Student.objects.filter(pk=tenant.student.pk).update(gender="female")
    row = principal.get(f"/api/v1/academics/sections/{tenant.section.id}/").json()
    assert row["students_count"] == 1 and row["female_count"] == 1
    assert row["class_teacher_name"] == tenant.teacher.full_name


def test_section_capacity_blocks_enrolment(principal, tenant):
    Section.objects.filter(pk=tenant.section.pk).update(capacity=1)
    res = principal.post("/api/v1/students/", {
        "first_name": "X", "last_name": "Y", "admission_number": "ADM-CAP",
        "academic_year": str(tenant.year.id), "class_level": str(tenant.grade.id),
        "section": str(tenant.section.id),
    }, format="json")
    assert res.status_code == 400 and "section" in res.json()
    # editing a student already in the section is fine
    assert principal.patch(f"/api/v1/students/{tenant.student.id}/", {"phone": "1"}, format="json").status_code == 200


def test_capacity_cannot_drop_below_enrolment(principal, tenant):
    res = principal.patch(f"/api/v1/academics/sections/{tenant.section.id}/", {"capacity": 0}, format="json")
    assert res.status_code == 400


def test_in_use_records_cannot_be_deleted(principal, tenant):
    assert principal.delete(f"/api/v1/academics/sections/{tenant.section.id}/").status_code == 400
    assert principal.delete(f"/api/v1/academics/class-levels/{tenant.grade.id}/").status_code == 400
    assert principal.delete(f"/api/v1/academics/subjects/{tenant.subject.id}/").status_code == 400
    assert principal.delete(f"/api/v1/academics/academic-years/{tenant.year.id}/").status_code == 400
    empty = Section.objects.create(organization=tenant.org, class_level=tenant.other_grade, name="Z")
    assert principal.delete(f"/api/v1/academics/sections/{empty.id}/").status_code == 204


def test_academic_year_dates(principal, tenant):
    res = principal.post("/api/v1/academics/academic-years/", {
        "school": str(tenant.school.id), "name": "Bad", "start_date": "2027-01-01", "end_date": "2026-01-01",
    }, format="json")
    assert res.status_code == 400


def test_subject_mark_breakdown_must_sum(principal, tenant):
    base = {"school": str(tenant.school.id), "name": "Physics", "code": "PHY", "full_marks": "100"}
    bad = principal.post("/api/v1/academics/subjects/", {**base, "theory_marks": "75", "practical_marks": "20"}, format="json")
    assert bad.status_code == 400
    ok = principal.post("/api/v1/academics/subjects/", {**base, "theory_marks": "75", "practical_marks": "25"}, format="json")
    assert ok.status_code == 201


def test_class_subject_unique_and_defaults_exam_marks(principal, tenant):
    payload = {
        "academic_year": str(tenant.year.id), "class_level": str(tenant.other_grade.id),
        "subject": str(tenant.subject.id), "weekly_periods": 6, "full_marks": "75", "pass_marks": "30",
    }
    res = principal.post("/api/v1/academics/class-subjects/", payload, format="json")
    assert res.status_code == 201 and res.json()["effective_full_marks"] == "75.00"
    assert principal.post("/api/v1/academics/class-subjects/", payload, format="json").status_code == 400

    paper = principal.post("/api/v1/exams/exam-subjects/", {
        "exam": str(tenant.exam.id), "class_level": str(tenant.other_grade.id),
        "subject": str(tenant.subject.id),
    }, format="json").json()
    assert (paper["full_marks"], paper["pass_marks"]) == ("75.00", "30.00")


def test_class_overview(principal, tenant):
    ClassSubject.objects.create(
        organization=tenant.org, academic_year=tenant.year, class_level=tenant.grade,
        subject=tenant.subject, weekly_periods=5,
    )
    body = principal.get(f"/api/v1/academics/class-levels/{tenant.grade.id}/overview/").json()
    assert body["totals"]["students"] == 1
    assert body["subjects"][0]["teachers"][0]["name"] == tenant.teacher.full_name
    assert body["sections"][0]["name"] == "A"


def test_subject_overview_performance_and_syllabus(principal, tenant):
    SyllabusUnit.objects.create(organization=tenant.org, subject=tenant.subject, unit_no=1, title="Algebra", status="completed")
    SyllabusUnit.objects.create(organization=tenant.org, subject=tenant.subject, unit_no=2, title="Geometry")
    Mark.objects.create(organization=tenant.org, exam_subject=tenant.exam_subject, student=tenant.student, marks_obtained=Decimal("30"))
    tenant.exam.is_locked = tenant.exam.is_published = True
    tenant.exam.save()
    body = principal.get(f"/api/v1/academics/subjects/{tenant.subject.id}/overview/").json()
    assert body["syllabus"]["completion_pct"] == 50.0
    assert body["performance"] == {
        "results": 1, "average_pct": 30.0, "pass_rate_pct": 0.0, "highest_pct": 30.0, "lowest_pct": 30.0,
    }
    assert body["teachers"][0]["classes"] == ["Grade 8 - A"]


def test_teacher_can_update_syllabus_status_only_for_own_subject(api, tenant):
    unit = SyllabusUnit.objects.create(organization=tenant.org, subject=tenant.subject, unit_no=1, title="Algebra")
    other = Subject.objects.create(organization=tenant.org, school=tenant.school, name="Art", code="ART")
    foreign = SyllabusUnit.objects.create(organization=tenant.org, subject=other, unit_no=1, title="Colour")
    teacher = api(tenant.users["Teacher"])
    url = "/api/v1/academics/syllabus-units/"
    assert teacher.patch(f"{url}{unit.id}/", {"status": "in_progress"}, format="json").status_code == 200
    assert teacher.patch(f"{url}{unit.id}/", {"title": "Hacked"}, format="json").status_code == 400
    assert teacher.patch(f"{url}{foreign.id}/", {"status": "completed"}, format="json").status_code == 400
    assert teacher.post(url, {"subject": str(other.id), "unit_no": 2, "title": "x"}, format="json").status_code == 403
