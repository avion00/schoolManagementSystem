"""Uploads (validation + access) and the LMS (assignments, submissions,
materials, lesson plans)."""
import datetime

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone

from apps.accounts.models import User
from apps.communications.models import Notification
from apps.guardians.models import Guardian, StudentGuardian
from apps.lms.models import Assignment, Submission
from apps.students.models import Student

pytestmark = pytest.mark.django_db
PDF = b"%PDF-1.4\n%fake but well-formed enough\n"


@pytest.fixture(autouse=True)
def media(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path


def upload(client, name="notes.pdf", content=PDF):
    return client.post("/api/v1/files/", {"file": SimpleUploadedFile(name, content)}, format="multipart")


@pytest.fixture
def teacher(api, tenant):
    return api(tenant.users["Teacher"])


@pytest.fixture
def student(api, tenant):
    return api(tenant.users["Student"])


def make_assignment(client, tenant, **extra):
    payload = {
        "academic_year": str(tenant.year.id), "class_level": str(tenant.grade.id),
        "section": str(tenant.section.id), "subject": str(tenant.subject.id),
        "title": "Fractions worksheet", "due_at": (timezone.now() + datetime.timedelta(days=2)).isoformat(),
        "max_marks": "20", **extra,
    }
    payload = {k: v for k, v in payload.items() if v is not None}
    res = client.post("/api/v1/lms/assignments/", payload, format="json")
    assert res.status_code == 201, res.json()
    return res.json()


# --- uploads ----------------------------------------------------------------

def test_upload_validates_type_content_and_size(teacher, settings):
    assert upload(teacher).status_code == 201
    assert upload(teacher, "evil.exe", b"MZ\x90\x00").status_code == 400
    assert upload(teacher, "fake.pdf", b"MZ\x90\x00not a pdf").status_code == 400
    settings.FILE_UPLOAD_MAX_MB = 0
    assert upload(teacher).status_code == 400


def test_uploader_can_download_others_cannot(teacher, api, tenant, other_tenant):
    f = upload(teacher).json()
    res = teacher.get(f["download_url"])
    assert res.status_code == 200 and res["X-Content-Type-Options"] == "nosniff"
    assert b"".join(res.streaming_content) == PDF
    assert api(tenant.users["Accountant"]).get(f["download_url"]).status_code == 404
    assert api(other_tenant.users["Teacher"]).get(f["download_url"]).status_code == 404


def test_cannot_attach_someone_elses_upload(teacher, api, tenant):
    theirs = upload(api(tenant.users["Principal"])).json()
    res = teacher.post("/api/v1/lms/assignments/", {
        "academic_year": str(tenant.year.id), "class_level": str(tenant.grade.id), "subject": str(tenant.subject.id),
        "title": "x", "due_at": timezone.now().isoformat(), "attachment_ids": [theirs["id"]],
    }, format="json")
    assert res.status_code == 400


# --- assignments ------------------------------------------------------------

def test_teacher_scope(teacher, tenant):
    other = make_assignment(teacher, tenant)
    assert other["teacher_name"] == tenant.teacher.full_name
    res = teacher.post("/api/v1/lms/assignments/", {
        "academic_year": str(tenant.year.id), "class_level": str(tenant.other_grade.id),
        "subject": str(tenant.subject.id), "title": "x", "due_at": timezone.now().isoformat(),
    }, format="json")
    assert res.status_code == 403


def test_full_homework_flow(teacher, student, tenant, api):
    guardian_user = User.objects.create_user(email="g@x.test", password="x", organization=tenant.org)
    g = Guardian.objects.create(organization=tenant.org, full_name="G", user=guardian_user)
    StudentGuardian.objects.create(organization=tenant.org, student=tenant.student, guardian=g, relation="father")

    f = upload(teacher).json()
    a = make_assignment(teacher, tenant, attachment_ids=[f["id"]])
    assert student.get("/api/v1/me/assignments/").json() == []  # drafts are hidden
    teacher.post(f"/api/v1/lms/assignments/{a['id']}/publish/")
    assert Notification.objects.filter(user__in=[tenant.users["Student"], guardian_user]).count() == 2

    mine = student.get("/api/v1/me/assignments/").json()
    assert mine[0]["my_status"] == "todo"
    assert student.get(f["download_url"]).status_code == 200  # attachment readable by the class
    assert api(guardian_user).get(f["download_url"]).status_code == 200

    answer = upload(student, "answer.txt", b"x = 3/4").json()
    sub = student.post(f"/api/v1/me/assignments/{a['id']}/submit/", {
        "text_answer": "See file", "attachment_ids": [answer["id"]]}, format="json")
    assert sub.status_code == 201 and sub.json()["is_late"] is False
    assert teacher.get(answer["download_url"]).status_code == 200  # teacher can read the work
    assert api(tenant.users["Accountant"]).get(answer["download_url"]).status_code == 404

    roster = teacher.get(f"/api/v1/lms/assignments/{a['id']}/submissions/").json()
    assert roster["submitted"] == 1 and roster["rows"][0]["status"] == "submitted"
    sid = roster["rows"][0]["submission"]["id"]
    assert teacher.post(f"/api/v1/lms/assignments/{a['id']}/submissions/{sid}/grade/", {"marks": "25"}, format="json").status_code == 400
    graded = teacher.post(f"/api/v1/lms/assignments/{a['id']}/submissions/{sid}/grade/",
                          {"marks": "18", "feedback": "Nice"}, format="json").json()
    assert graded["status"] == "graded" and graded["marks"] == "18.00"
    assert student.get("/api/v1/me/assignments/").json()[0]["my_status"] == "graded"
    assert student.post(f"/api/v1/me/assignments/{a['id']}/submit/", {"text_answer": "again"}, format="json").status_code == 400
    child = api(guardian_user).get(f"/api/v1/me/children/{tenant.student.id}/assignments/").json()
    assert child[0]["my_status"] == "graded"


def test_late_and_missing(teacher, student, tenant):
    past = (timezone.now() - datetime.timedelta(hours=1)).isoformat()
    strict = make_assignment(teacher, tenant, due_at=past, title="strict")
    lenient = make_assignment(teacher, tenant, due_at=past, allow_late=True, title="lenient")
    for a in (strict, lenient):
        teacher.post(f"/api/v1/lms/assignments/{a['id']}/publish/")
    statuses = {r["title"]: r["my_status"] for r in student.get("/api/v1/me/assignments/").json()}
    assert statuses == {"strict": "missing", "lenient": "late"}
    assert student.post(f"/api/v1/me/assignments/{strict['id']}/submit/", {"text_answer": "x"}, format="json").status_code == 400
    late = student.post(f"/api/v1/me/assignments/{lenient['id']}/submit/", {"text_answer": "x"}, format="json")
    assert late.json()["is_late"] is True


def test_other_sections_dont_see_work(teacher, tenant, api):
    a = make_assignment(teacher, tenant)
    teacher.post(f"/api/v1/lms/assignments/{a['id']}/publish/")
    other_user = User.objects.create_user(email="o@x.test", password="x", organization=tenant.org)
    Student.objects.create(organization=tenant.org, first_name="O", last_name="S", admission_number="ADM-O",
                           academic_year=tenant.year, class_level=tenant.other_grade, user=other_user)
    assert api(other_user).get("/api/v1/me/assignments/").json() == []
    assert api(other_user).post(f"/api/v1/me/assignments/{a['id']}/submit/", {"text_answer": "x"}, format="json").status_code == 404


def test_published_assignment_scope_frozen_and_delete_rules(teacher, student, tenant):
    a = make_assignment(teacher, tenant)
    teacher.post(f"/api/v1/lms/assignments/{a['id']}/publish/")
    assert teacher.patch(f"/api/v1/lms/assignments/{a['id']}/", {"max_marks": "50"}, format="json").status_code == 400
    student.post(f"/api/v1/me/assignments/{a['id']}/submit/", {"text_answer": "x"}, format="json")
    assert teacher.delete(f"/api/v1/lms/assignments/{a['id']}/").status_code == 400


# --- materials & lesson plans -----------------------------------------------

def test_section_teacher_cannot_post_class_wide(teacher, tenant):
    res = teacher.post("/api/v1/lms/materials/", {
        "class_level": str(tenant.grade.id), "subject": str(tenant.subject.id), "title": "All of Grade 8",
        "type": "link", "url": "https://example.com"}, format="json")
    assert res.status_code == 403


def test_materials(teacher, student, tenant):
    f = upload(teacher).json()
    res = teacher.post("/api/v1/lms/materials/", {
        "class_level": str(tenant.grade.id), "section": str(tenant.section.id),
        "subject": str(tenant.subject.id), "title": "Chapter 1",
        "type": "pdf", "file_id": f["id"]}, format="json")
    assert res.status_code == 201
    assert teacher.post("/api/v1/lms/materials/", {
        "class_level": str(tenant.grade.id), "section": str(tenant.section.id),
        "subject": str(tenant.subject.id), "title": "Link",
        "type": "link"}, format="json").status_code == 400
    assert [m["title"] for m in student.get("/api/v1/me/materials/").json()] == ["Chapter 1"]
    assert student.get(f["download_url"]).status_code == 200


def test_lesson_plan_review(teacher, api, tenant):
    plan = teacher.post("/api/v1/lms/lesson-plans/", {
        "class_level": str(tenant.grade.id), "section": str(tenant.section.id),
        "subject": str(tenant.subject.id), "week_start": "2026-11-02",
        "topic": "Fractions", "objectives": ["add fractions"]}, format="json").json()
    teacher.post(f"/api/v1/lms/lesson-plans/{plan['id']}/submit/")
    assert teacher.patch(f"/api/v1/lms/lesson-plans/{plan['id']}/", {"topic": "x"}, format="json").status_code == 400
    assert teacher.post(f"/api/v1/lms/lesson-plans/{plan['id']}/review/", {"decision": "approve"}, format="json").status_code == 403
    principal = api(tenant.users["Principal"])
    res = principal.post(f"/api/v1/lms/lesson-plans/{plan['id']}/review/", {"decision": "changes", "note": "Add practice"}, format="json")
    assert res.json()["status"] == "changes_requested"
    assert Notification.objects.filter(user=tenant.users["Teacher"], category="approvals").exists()


def test_orphan_upload_purge(teacher):
    from django.core.management import call_command

    from apps.files.models import StoredFile

    f = upload(teacher).json()
    StoredFile.objects.filter(pk=f["id"]).update(created_at=timezone.now() - datetime.timedelta(days=2))
    call_command("purge_orphan_files", stdout=open("/dev/null", "w"))
    assert not StoredFile.objects.filter(pk=f["id"]).exists()


def test_attached_upload_survives_purge(teacher, tenant):
    from django.core.management import call_command

    from apps.files.models import StoredFile

    f = upload(teacher).json()
    make_assignment(teacher, tenant, attachment_ids=[f["id"]])
    StoredFile.objects.filter(pk=f["id"]).update(created_at=timezone.now() - datetime.timedelta(days=2))
    call_command("purge_orphan_files", stdout=open("/dev/null", "w"))
    assert StoredFile.objects.filter(pk=f["id"]).exists()
    assert Assignment.objects.count() == 1 and Submission.objects.count() == 0


def test_assignment_defaults_to_current_academic_year(teacher, tenant):
    tenant.year.is_current = True
    tenant.year.save()
    a = make_assignment(teacher, tenant, academic_year=None)
    assert a["academic_year"] == str(tenant.year.id)
