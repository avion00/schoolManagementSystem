"""Shared fixtures.

`make_tenant` builds a complete, independent organization (roles from the demo
seed catalog, one user per role, academic structure, a student and an invoice) so
tests can assert both behaviour and cross-tenant isolation.
"""
import datetime
from dataclasses import dataclass, field
from decimal import Decimal

import pytest
from django.core.cache import cache
from django.utils import timezone
from rest_framework.test import APIClient

from apps.academics.models import AcademicYear, ClassLevel, Section, Subject
from apps.accounts.models import Organization, School, User
from apps.exams.models import Exam, ExamSubject
from apps.fees.models import Invoice, InvoiceItem
from apps.rbac.catalog import PERMISSIONS, ROLE_PERMISSIONS
from apps.rbac.models import Permission, Role, RolePermission, UserRole
from apps.students.models import Student
from apps.teachers.models import Teacher, TeacherAssignment

PASSWORD = "Passw0rd!2024"


@dataclass
class Tenant:
    org: Organization
    school: School
    roles: dict
    users: dict
    year: AcademicYear
    grade: ClassLevel
    section: Section
    other_grade: ClassLevel
    subject: Subject
    student: Student
    invoice: Invoice
    exam: Exam
    exam_subject: ExamSubject
    teacher: Teacher
    extra: dict = field(default_factory=dict)


@pytest.fixture(autouse=True)
def _clear_cache():
    # Throttle counters live in the cache; keep tests independent.
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def permissions(db):
    return {
        code: Permission.objects.get_or_create(
            code=code, defaults={"name": name, "module": module}
        )[0]
        for code, name, module in PERMISSIONS
    }


@pytest.fixture
def make_tenant(db, permissions):
    def _make(slug="alpha"):
        org = Organization.objects.create(name=slug.title(), slug=slug)
        school = School.objects.create(organization=org, name=f"{slug} High", code="HS")

        roles, users = {}, {}
        for role_name, codes in ROLE_PERMISSIONS.items():
            role = Role.objects.create(organization=org, name=role_name)
            RolePermission.objects.bulk_create(
                [RolePermission(role=role, permission=permissions[c]) for c in codes]
            )
            roles[role_name] = role
            user = User.objects.create_user(
                email=f"{role_name.lower()}@{slug}.test", password=PASSWORD,
                organization=org, full_name=f"{slug} {role_name}",
            )
            UserRole.objects.create(user=user, role=role)
            users[role_name] = user

        year = AcademicYear.objects.create(
            organization=org, school=school, name="2026-2027",
            start_date=datetime.date(2026, 4, 1), end_date=datetime.date(2027, 3, 31),
            is_current=True,
        )
        grade = ClassLevel.objects.create(organization=org, school=school, name="Grade 8", order=8)
        other_grade = ClassLevel.objects.create(organization=org, school=school, name="Grade 9", order=9)
        section = Section.objects.create(organization=org, class_level=grade, name="A")
        subject = Subject.objects.create(organization=org, school=school, name="Maths", code="MATH")

        student = Student.objects.create(
            organization=org, first_name="Asha", last_name="Rai",
            admission_number="ADM-1", academic_year=year, class_level=grade, section=section,
            user=users["Student"],
        )
        invoice = Invoice.objects.create(
            organization=org, student=student, number="INV-1",
            issue_date=timezone.localdate(), total_amount=Decimal("1000.00"),
        )
        InvoiceItem.objects.create(
            organization=org, invoice=invoice, description="Tuition", amount=Decimal("1000.00"),
        )
        exam = Exam.objects.create(organization=org, name="Term 1", academic_year=year)
        exam_subject = ExamSubject.objects.create(
            organization=org, exam=exam, class_level=grade, subject=subject,
            full_marks=100, pass_marks=40,
        )
        # The Teacher user is class teacher of grade/section and teaches the subject.
        teacher = Teacher.objects.create(
            organization=org, full_name=f"{slug} Teacher", employee_id="EMP-1",
            user=users["Teacher"],
        )
        TeacherAssignment.objects.create(
            organization=org, teacher=teacher, academic_year=year, class_level=grade,
            section=section, subject=subject, is_class_teacher=True,
        )
        return Tenant(
            teacher=teacher,
            org=org, school=school, roles=roles, users=users, year=year, grade=grade,
            section=section, other_grade=other_grade, subject=subject, student=student,
            invoice=invoice, exam=exam, exam_subject=exam_subject,
        )

    return _make


@pytest.fixture
def tenant(make_tenant):
    return make_tenant("alpha")


@pytest.fixture
def other_tenant(make_tenant):
    return make_tenant("beta")


@pytest.fixture
def api():
    """Returns an APIClient authenticated as the given user (or anonymous)."""

    def _client(user=None):
        client = APIClient()
        if user is not None:
            client.force_authenticate(user)
        return client

    return _client
