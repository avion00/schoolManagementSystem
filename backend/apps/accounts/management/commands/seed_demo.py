"""Seed a demo tenant so the platform is usable immediately.

Idempotent: safe to run multiple times.

Creates:
  - Permission catalog (representative subset of school.md §5.1)
  - Organization "Greenwood Group" + School "Greenwood High"
  - Roles: Principal, Teacher, Accountant (with permissions)
  - Users: principal@demo.school / teacher@demo.school / accountant@demo.school
           student@demo.school / parent@demo.school
  - A platform admin: admin@platform.test
All demo passwords: Passw0rd!2024
"""
import datetime

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.academics.models import AcademicYear, ClassLevel, Section, Subject
from apps.accounts.models import Organization, School, User
from apps.guardians.models import Guardian, StudentGuardian
from apps.rbac.catalog import PERMISSIONS, ROLE_PERMISSIONS
from apps.rbac.models import Permission, Role, RolePermission, UserRole
from apps.students.models import Student
from apps.teachers.models import Teacher, TeacherAssignment

DEMO_PASSWORD = "Passw0rd!2024"

class Command(BaseCommand):
    help = "Seed a demo organization, roles, permissions, and users."

    @transaction.atomic
    def handle(self, *args, **options):
        perms = {}
        for code, name, module in PERMISSIONS:
            perm, _ = Permission.objects.get_or_create(
                code=code, defaults={"name": name, "module": module}
            )
            perms[code] = perm
        self.stdout.write(self.style.SUCCESS(f"Permissions ready: {len(perms)}"))

        org, _ = Organization.objects.get_or_create(
            slug="greenwood", defaults={"name": "Greenwood Group", "region": "global"}
        )
        school, _ = School.objects.get_or_create(
            organization=org, code="GH",
            defaults={"name": "Greenwood High", "email": "info@greenwood.test"},
        )
        self.stdout.write(self.style.SUCCESS(f"Tenant ready: {org} / {school}"))

        roles = {}
        for role_name, codes in ROLE_PERMISSIONS.items():
            role, _ = Role.objects.get_or_create(organization=org, name=role_name)
            for code in codes:
                RolePermission.objects.get_or_create(role=role, permission=perms[code])
            roles[role_name] = role
        self.stdout.write(self.style.SUCCESS(f"Roles ready: {list(roles)}"))

        demo_users = [
            ("principal@demo.school", "Demo Principal", "Principal", None),
            ("teacher@demo.school", "Demo Teacher", "Teacher", school),
            ("accountant@demo.school", "Demo Accountant", "Accountant", school),
        ]
        for email, full_name, role_name, scope in demo_users:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={"full_name": full_name, "organization": org, "is_staff": False},
            )
            if created:
                user.set_password(DEMO_PASSWORD)
                user.organization = org
                user.save()
            UserRole.objects.get_or_create(
                user=user, role=roles[role_name], school=scope
            )
        self.stdout.write(self.style.SUCCESS("Demo users ready."))

        admin, created = User.objects.get_or_create(
            email="admin@platform.test",
            defaults={
                "full_name": "Platform Admin",
                "is_platform_admin": True,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            admin.set_password(DEMO_PASSWORD)
            admin.save()
        self.stdout.write(self.style.SUCCESS("Platform admin ready: admin@platform.test"))

        # --- Sample academic structure ---
        year, _ = AcademicYear.objects.get_or_create(
            organization=org, school=school, name="2025-2026",
            defaults={
                "start_date": datetime.date(2025, 4, 1),
                "end_date": datetime.date(2026, 3, 31),
                "is_current": True,
            },
        )
        class_levels = {}
        for cl_name, order in [("Grade 8", 8), ("Grade 9", 9), ("Grade 10", 10)]:
            cl, _ = ClassLevel.objects.get_or_create(
                organization=org, school=school, name=cl_name, defaults={"order": order}
            )
            class_levels[cl_name] = cl
        sections = {}
        for cl_name in ("Grade 8", "Grade 9"):
            for sec_name in ("A", "B"):
                sec, _ = Section.objects.get_or_create(
                    organization=org, class_level=class_levels[cl_name], name=sec_name
                )
                sections[(cl_name, sec_name)] = sec
        subjects = {}
        for s_name, s_code in [("Mathematics", "MATH"), ("Science", "SCI"), ("English", "ENG")]:
            subj, _ = Subject.objects.get_or_create(
                organization=org, school=school, code=s_code, defaults={"name": s_name}
            )
            subjects[s_code] = subj
        self.stdout.write(self.style.SUCCESS("Academic structure ready."))

        # --- Guardians + students ---
        g1, _ = Guardian.objects.get_or_create(
            organization=org, full_name="Robert Smith",
            defaults={"relation": "father", "phone": "+1-202-555-0101"},
        )
        g2, _ = Guardian.objects.get_or_create(
            organization=org, full_name="Maria Garcia",
            defaults={"relation": "mother", "phone": "+1-202-555-0102"},
        )
        sample_students = [
            ("ADM-0001", "01", "Liam", "Smith", "male", "Grade 8", "A", g1),
            ("ADM-0002", "02", "Olivia", "Garcia", "female", "Grade 8", "A", g2),
            ("ADM-0003", "01", "Noah", "Smith", "male", "Grade 9", "A", g1),
        ]
        for adm, roll, first, last, gender, cl_name, sec_name, guardian in sample_students:
            student, _ = Student.objects.get_or_create(
                organization=org, admission_number=adm,
                defaults={
                    "first_name": first, "last_name": last, "gender": gender,
                    "roll_number": roll, "academic_year": year,
                    "class_level": class_levels[cl_name],
                    "section": sections[(cl_name, sec_name)],
                    "school": school,
                },
            )
            StudentGuardian.objects.get_or_create(
                organization=org, student=student, guardian=guardian,
                defaults={"relation": guardian.relation, "is_primary": True, "school": school},
            )
        self.stdout.write(self.style.SUCCESS("Guardians + students ready."))

        # --- Parent portal login (Robert Smith -> Liam & Noah) ---
        pu, created = User.objects.get_or_create(
            email="parent@demo.school",
            defaults={"full_name": g1.full_name, "organization": org},
        )
        if created:
            pu.set_password(DEMO_PASSWORD)
            pu.save()
        if not g1.user_id:
            g1.user = pu
            g1.email = pu.email
            g1.save(update_fields=["user", "email", "updated_at"])
        UserRole.objects.get_or_create(user=pu, role=roles["Parent"], school=None)
        self.stdout.write(self.style.SUCCESS(
            "Parent login ready: parent@demo.school (Robert Smith: Liam, Noah)"
        ))

        # --- Teacher (linked to teacher login) + assignment ---
        teacher_user = User.objects.filter(email="teacher@demo.school").first()
        teacher, _ = Teacher.objects.get_or_create(
            organization=org, employee_id="EMP-001",
            defaults={
                "full_name": "Demo Teacher", "designation": "Senior Teacher",
                "department": "Science", "user": teacher_user, "school": school,
                "joining_date": datetime.date(2022, 6, 1),
            },
        )
        TeacherAssignment.objects.get_or_create(
            organization=org, teacher=teacher, academic_year=year,
            class_level=class_levels["Grade 8"], section=sections[("Grade 8", "A")],
            subject=subjects["SCI"], defaults={"is_class_teacher": True},
        )
        self.stdout.write(self.style.SUCCESS("Teacher + assignment ready."))

        # --- Student portal login (linked to a Student record) ---
        liam = Student.objects.filter(organization=org, admission_number="ADM-0001").first()
        if liam:
            su, created = User.objects.get_or_create(
                email="student@demo.school",
                defaults={"full_name": liam.full_name, "organization": org},
            )
            if created:
                su.set_password(DEMO_PASSWORD)
                su.save()
            if not liam.user_id:
                liam.user = su
                liam.save(update_fields=["user", "updated_at"])
            UserRole.objects.get_or_create(user=su, role=roles["Student"], school=None)
            self.stdout.write(self.style.SUCCESS(
                "Student login ready: student@demo.school (linked to Liam Smith)"
            ))

        self.stdout.write(self.style.WARNING(f"\nAll demo passwords: {DEMO_PASSWORD}"))
