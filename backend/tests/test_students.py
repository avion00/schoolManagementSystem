"""Students: numbering, guardians on the record, lifecycle history, export."""
import csv
import io

import pytest

from apps.audit.models import AuditLog
from apps.guardians.models import Guardian, StudentGuardian
from apps.students.models import Student, StudentHistory

pytestmark = pytest.mark.django_db


@pytest.fixture
def principal(api, tenant):
    return api(tenant.users["Principal"])


def new_student(client, tenant, **extra):
    return client.post("/api/v1/students/", {
        "first_name": "Ravi", "last_name": "Kc", "admission_number": "ADM-50",
        "academic_year": str(tenant.year.id), "class_level": str(tenant.grade.id),
        **extra,
    }, format="json")


def test_create_assigns_registration_number(principal, tenant):
    res = new_student(principal, tenant)
    assert res.status_code == 201, res.json()
    assert res.json()["registration_number"].startswith("REG-")
    assert res.json()["status"] == "active"


def test_explicit_registration_number_kept_and_unique(principal, tenant):
    assert new_student(principal, tenant, registration_number="R-1").json()["registration_number"] == "R-1"
    dup = new_student(principal, tenant, admission_number="ADM-51", registration_number="R-1")
    assert dup.status_code == 400


def test_status_is_not_writable_directly(principal, tenant):
    res = principal.patch(f"/api/v1/students/{tenant.student.id}/", {"status": "left"}, format="json")
    assert res.status_code == 200
    tenant.student.refresh_from_db()
    assert tenant.student.status == "active"


def test_change_status_records_history(principal, tenant):
    url = f"/api/v1/students/{tenant.student.id}/change-status/"
    res = principal.post(url, {"status": "transferred", "reason": "Moved city"}, format="json")
    assert res.status_code == 200 and res.json()["status"] == "transferred"
    h = StudentHistory.objects.get(student=tenant.student)
    assert (h.from_status, h.to_status, h.reason) == ("active", "transferred", "Moved city")
    assert principal.post(url, {"status": "transferred"}, format="json").status_code == 400


def test_teacher_cannot_change_status(api, tenant):
    res = api(tenant.users["Teacher"]).post(
        f"/api/v1/students/{tenant.student.id}/change-status/", {"status": "left"}, format="json"
    )
    assert res.status_code == 403


def test_promote_moves_class_and_clears_roll(principal, tenant):
    Student.objects.filter(pk=tenant.student.pk).update(roll_number="7")
    res = principal.post("/api/v1/students/promote/", {
        "students": [str(tenant.student.id)], "to_academic_year": str(tenant.year.id),
        "to_class_level": str(tenant.other_grade.id),
    }, format="json")
    assert res.status_code == 200 and res.json() == {"promoted": 1}
    tenant.student.refresh_from_db()
    assert tenant.student.class_level == tenant.other_grade
    assert tenant.student.section is None and tenant.student.roll_number == ""
    h = StudentHistory.objects.get(student=tenant.student, kind="promotion")
    assert h.from_class_level == tenant.grade and h.from_section == tenant.section


def test_promote_validates_section_and_tenant(principal, tenant, other_tenant):
    bad_section = principal.post("/api/v1/students/promote/", {
        "students": [str(tenant.student.id)], "to_academic_year": str(tenant.year.id),
        "to_class_level": str(tenant.other_grade.id), "to_section": str(tenant.section.id),
    }, format="json")
    assert bad_section.status_code == 400
    foreign = principal.post("/api/v1/students/promote/", {
        "students": [str(other_tenant.student.id)], "to_academic_year": str(tenant.year.id),
        "to_class_level": str(tenant.other_grade.id),
    }, format="json")
    assert foreign.status_code == 400


def test_guardians_appear_on_student(principal, tenant):
    g = Guardian.objects.create(organization=tenant.org, full_name="Hari Rai", relation="father")
    StudentGuardian.objects.create(
        organization=tenant.org, student=tenant.student, guardian=g, relation="father", is_primary=True
    )
    body = principal.get(f"/api/v1/students/{tenant.student.id}/").json()
    assert body["primary_guardian_name"] == "Hari Rai"
    assert body["guardians"][0]["relation"] == "father"


def test_overview_hides_fees_without_permission(api, tenant):
    teacher = api(tenant.users["Teacher"]).get(f"/api/v1/students/{tenant.student.id}/overview/").json()
    assert teacher["fees"] is None and teacher["attendance"]["total"] == 0
    principal = api(tenant.users["Principal"]).get(f"/api/v1/students/{tenant.student.id}/overview/").json()
    assert principal["fees"]["outstanding"] == 1000.0


def test_export_csv_is_filtered_safe_and_audited(principal, tenant):
    Student.objects.filter(pk=tenant.student.pk).update(first_name="=HYPERLINK(evil)")
    res = principal.get("/api/v1/students/export/", {"class_level": str(tenant.grade.id)})
    assert res.status_code == 200 and res["Content-Type"] == "text/csv"
    rows = list(csv.reader(io.StringIO(res.content.decode())))
    assert rows[0][0] == "Admission No" and len(rows) == 2
    assert rows[1][2] == "'=HYPERLINK(evil)"
    assert AuditLog.objects.filter(action="student.export").exists()


def test_export_requires_permission(api, tenant):
    assert api(tenant.users["Teacher"]).get("/api/v1/students/export/").status_code == 403


def test_create_login_and_delete_revokes_it(principal, tenant):
    s = Student.objects.create(
        organization=tenant.org, first_name="N", last_name="L", admission_number="ADM-77",
        academic_year=tenant.year, class_level=tenant.grade,
    )
    res = principal.post(f"/api/v1/students/{s.id}/create-login/", {"email": "N@Kids.test"}, format="json")
    assert res.status_code == 200
    s.refresh_from_db()
    assert s.user.email == "n@kids.test" and s.user.must_change_password
    assert s.user.user_roles.get().role.name == "Student"
    principal.delete(f"/api/v1/students/{s.id}/")
    s.user.refresh_from_db()
    assert s.user.is_active is False


def test_documents_upload_verify_and_access(api, tenant, settings, tmp_path):
    from django.core.files.uploadedfile import SimpleUploadedFile

    settings.MEDIA_ROOT = tmp_path
    principal = api(tenant.users["Principal"])
    f = principal.post("/api/v1/files/", {"file": SimpleUploadedFile("bc.pdf", b"%PDF-1.4 x")}, format="multipart").json()
    url = f"/api/v1/students/{tenant.student.id}/documents/"
    doc = principal.post(url, {"kind": "birth_certificate", "file_id": f["id"]}, format="json")
    assert doc.status_code == 201 and doc.json()["kind_label"] == "Birth Certificate"
    verified = principal.post(f"{url}{doc.json()['id']}/").json()
    assert verified["verified_at"] and verified["verified_by_name"]
    assert api(tenant.users["Student"]).get(f["download_url"]).status_code == 200  # own document
    assert api(tenant.users["Accountant"]).get(f["download_url"]).status_code == 404
    assert principal.delete(f"{url}{doc.json()['id']}/").status_code == 204
    assert principal.get(url).json() == []


def test_photo_must_be_image(api, tenant, settings, tmp_path):
    from django.core.files.uploadedfile import SimpleUploadedFile

    settings.MEDIA_ROOT = tmp_path
    principal = api(tenant.users["Principal"])
    pdf = principal.post("/api/v1/files/", {"file": SimpleUploadedFile("x.pdf", b"%PDF-1.4 x")}, format="multipart").json()
    res = principal.patch(f"/api/v1/students/{tenant.student.id}/", {"photo_id": pdf["id"]}, format="json")
    assert res.status_code == 400
    png = principal.post("/api/v1/files/", {"file": SimpleUploadedFile("p.png", b"\x89PNG\r\n\x1a\nxx")}, format="multipart").json()
    body = principal.patch(f"/api/v1/students/{tenant.student.id}/", {"photo_id": png["id"]}, format="json").json()
    assert body["photo"]["kind"] == "image"
    assert api(tenant.users["Student"]).get(png["download_url"]).status_code == 200
