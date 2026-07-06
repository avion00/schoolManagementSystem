"""Generate a rich, realistic dataset so the dashboards look full (not empty).

Run AFTER `seed_demo` (which creates the org, school, classes, roles):

    python manage.py seed_rich               # ~60 students + 30 days of data
    python manage.py seed_rich --students 120

Idempotent-ish: re-running adds/affirms data without duplicating (keyed on
admission/receipt/invoice numbers and the attendance unique constraint).
"""
import random
from datetime import datetime, time, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.academics.models import AcademicYear, ClassLevel, Section, Subject
from apps.accounts.models import Organization, School
from apps.attendance.models import Attendance
from apps.exams.models import Exam, ExamSubject, Mark
from apps.fees.models import FeeCategory, Invoice, Payment
from apps.guardians.models import Guardian
from apps.students.models import Student
from apps.teachers.models import Teacher

FIRST = [
    "Aarav", "Olivia", "Liam", "Emma", "Noah", "Ava", "Ethan", "Sophia", "Mason",
    "Isabella", "Lucas", "Mia", "Arjun", "Aria", "Diego", "Maya", "Omar", "Zara",
    "Leo", "Nina", "Ravi", "Sara", "Kai", "Lena", "Sam", "Tara", "Ian", "Eva",
    "Jay", "Lily", "Ben", "Chloe", "Adam", "Grace", "Eli", "Ruby", "Max", "Iris",
]
LAST = [
    "Smith", "Garcia", "Khan", "Patel", "Lee", "Brown", "Singh", "Nguyen", "Lopez",
    "Kim", "Ali", "Das", "Roy", "Shah", "Cruz", "Mehta", "Park", "Chen", "Gupta", "Reed",
]
GENDERS = ["male", "female", "other"]


class Command(BaseCommand):
    help = "Generate a realistic dataset (students, attendance, payments, marks)."

    def add_arguments(self, parser):
        parser.add_argument("--students", type=int, default=60)

    @transaction.atomic
    def handle(self, *args, **options):
        random.seed(42)
        n = options["students"]

        org = Organization.objects.filter(slug="greenwood").first()
        if not org:
            self.stderr.write("Run `python manage.py seed_demo` first.")
            return
        school = School.objects.filter(organization=org, code="GH").first()
        year = AcademicYear.objects.filter(organization=org).first()
        class_levels = list(ClassLevel.objects.filter(organization=org))
        sections = list(Section.objects.filter(organization=org))
        subjects = list(Subject.objects.filter(organization=org))
        today = timezone.localdate()

        # --- Guardians (a small pool) ---
        guardians = []
        for i in range(12):
            g, _ = Guardian.objects.get_or_create(
                organization=org, full_name=f"{random.choice(LAST)} Family {i}",
                defaults={"relation": "guardian", "phone": f"+1-202-555-{1000 + i}"},
            )
            guardians.append(g)

        # --- Students ---
        roll_counter: dict = {}
        students = []
        for i in range(n):
            cl = random.choice(class_levels)
            sec_pool = [s for s in sections if s.class_level_id == cl.id]
            sec = random.choice(sec_pool) if sec_pool else None
            key = (cl.id, sec.id if sec else None)
            roll_counter[key] = roll_counter.get(key, 0) + 1
            adm = f"ADM-2{i:03d}"
            st, _ = Student.objects.get_or_create(
                organization=org, admission_number=adm,
                defaults={
                    "first_name": random.choice(FIRST),
                    "last_name": random.choice(LAST),
                    "gender": random.choice(GENDERS),
                    "roll_number": str(roll_counter[key]),
                    "academic_year": year, "class_level": cl, "section": sec,
                    "primary_guardian": random.choice(guardians), "school": school,
                    "status": "active",
                },
            )
            students.append(st)
        self.stdout.write(self.style.SUCCESS(f"Students: {len(students)}"))

        # --- Teachers ---
        for i in range(8):
            Teacher.objects.get_or_create(
                organization=org, employee_id=f"EMP-2{i:02d}",
                defaults={
                    "full_name": f"{random.choice(FIRST)} {random.choice(LAST)}",
                    "designation": random.choice(["Teacher", "Senior Teacher", "HOD"]),
                    "department": random.choice(["Science", "Maths", "English", "Arts"]),
                    "school": school, "status": "active",
                    "joining_date": today - timedelta(days=random.randint(200, 1500)),
                },
            )

        # --- Attendance for the last 30 days (skip weekends) ---
        statuses = ["present"] * 8 + ["late", "absent", "half_day"]
        att_objs = []
        for st in students:
            for d in range(30):
                day = today - timedelta(days=d)
                if day.weekday() >= 5:
                    continue
                att_objs.append(Attendance(
                    organization=org, school=school, student=st, date=day,
                    status=random.choice(statuses),
                ))
        Attendance.objects.bulk_create(att_objs, ignore_conflicts=True, batch_size=500)
        self.stdout.write(self.style.SUCCESS(f"Attendance rows: ~{len(att_objs)}"))

        # --- Fees: an invoice per student + payments spread across last 30 days ---
        cat, _ = FeeCategory.objects.get_or_create(
            organization=org, code="TUITION", defaults={"name": "Tuition"}
        )
        paid_count = 0
        for i, st in enumerate(students):
            inv, _ = Invoice.objects.get_or_create(
                organization=org, number=f"INV-2{i:03d}",
                defaults={
                    "student": st, "issue_date": today.replace(day=1),
                    "due_date": today, "total_amount": Decimal("1000"), "school": school,
                },
            )
            if random.random() < 0.8:  # 80% have paid something on a random day
                day = today - timedelta(days=random.randint(0, 29))
                paid_at = timezone.make_aware(datetime.combine(day, time(10, 30)))
                amount = Decimal(random.choice([1000, 1000, 750, 500, 250]))
                _, created = Payment.objects.get_or_create(
                    organization=org, receipt_number=f"RC-2{i:03d}",
                    defaults={
                        "invoice": inv, "amount": amount,
                        "method": random.choice(["cash", "online", "bank"]),
                        "paid_at": paid_at,
                    },
                )
                if created:
                    inv.recalculate()
                    paid_count += 1
        self.stdout.write(self.style.SUCCESS(f"Payments spread across 30 days: {paid_count}"))

        # --- A published exam with marks for everyone (fills student results) ---
        if subjects and class_levels:
            exam, _ = Exam.objects.get_or_create(
                organization=org, name="Mid Term", academic_year=year,
                defaults={"term": "Term 1", "is_published": True},
            )
            if not exam.is_published:
                exam.is_published = True
                exam.save(update_fields=["is_published"])
            es_map = {}
            for cl in class_levels:
                for subj in subjects:
                    es, _ = ExamSubject.objects.get_or_create(
                        organization=org, exam=exam, class_level=cl, subject=subj,
                        defaults={"full_marks": Decimal("100"), "pass_marks": Decimal("40")},
                    )
                    es_map[(cl.id, subj.id)] = es
            mark_objs = []
            for st in students:
                for subj in subjects:
                    es = es_map.get((st.class_level_id, subj.id))
                    if es:
                        mark_objs.append(Mark(
                            organization=org, exam_subject=es, student=st,
                            marks_obtained=Decimal(random.randint(35, 98)),
                        ))
            Mark.objects.bulk_create(mark_objs, ignore_conflicts=True, batch_size=500)
            self.stdout.write(self.style.SUCCESS(f"Marks: ~{len(mark_objs)}"))

        self.stdout.write(self.style.WARNING("\nDone. Refresh the dashboard — charts & tables are now full."))
