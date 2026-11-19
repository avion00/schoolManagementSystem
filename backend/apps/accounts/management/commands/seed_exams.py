"""Exam set-up for the demo school: a grade scale, exam rooms, exam codes and a
timetable for every paper (date, time, room, invigilators).

Run after `seed_rich`. Idempotent: only fills what is missing.

    python manage.py seed_exams
"""
from datetime import date, time, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.accounts.models import Organization
from apps.core.sequences import next_document_number
from apps.exams.models import Exam, ExamRoom, ExamSubject, GradeBand, GradeScale
from apps.teachers.models import Teacher

BANDS = [  # grade, min, max, gpa, pass, comment, colour
    ("A+", 90, 100, "4.00", True, "Outstanding", "emerald"),
    ("A", 80, 89.99, "3.60", True, "Excellent", "green"),
    ("B+", 70, 79.99, "3.20", True, "Very good", "teal"),
    ("B", 60, 69.99, "2.80", True, "Good", "blue"),
    ("C+", 50, 59.99, "2.40", True, "Satisfactory", "cyan"),
    ("C", 40, 49.99, "2.00", True, "Acceptable", "amber"),
    ("NG", 0, 39.99, "0.00", False, "Not graded", "rose"),
]
ROOMS = [  # name, capacity, building, floor, facilities
    ("Hall A", 80, "Main Block", "Ground", "CCTV, fans"),
    ("Room 101", 35, "Main Block", "1st", "Whiteboard"),
    ("Room 102", 35, "Main Block", "1st", "Whiteboard"),
    ("Science Lab", 30, "Science Block", "Ground", "Lab benches"),
]


class Command(BaseCommand):
    help = "Grade scale, exam rooms and a paper timetable for the demo school."

    @transaction.atomic
    def handle(self, *args, **options):
        org = Organization.objects.filter(slug="greenwood").first()
        if not org:
            self.stderr.write("Run `python manage.py seed_demo` first.")
            return

        scale, _ = GradeScale.objects.get_or_create(organization=org, name="Standard GPA")
        for grade, low, high, gpa, passed, comment, color in BANDS:
            GradeBand.objects.get_or_create(
                organization=org, scale=scale, grade=grade,
                defaults={"min_percent": low, "max_percent": high, "gpa": gpa, "is_pass": passed,
                          "comment": comment, "color": color},
            )
        rooms = []
        for name, cap, building, floor, facilities in ROOMS:
            room, _ = ExamRoom.objects.get_or_create(
                organization=org, name=name,
                defaults={"capacity": cap, "building": building, "floor": floor, "facilities": facilities},
            )
            rooms.append(room)
        teachers = list(Teacher.objects.filter(organization=org).order_by("full_name"))

        start = date.today() - timedelta(days=40)
        for n, exam in enumerate(Exam.objects.filter(organization=org).order_by("created_at")):
            changed = []
            if not exam.code:
                exam.code = next_document_number(org.id, "EXM")
                changed.append("code")
            if exam.grade_scale_id is None:
                exam.grade_scale = scale
                changed.append("grade_scale")
            if exam.is_published and not exam.is_locked:
                exam.is_locked = True  # publishing requires a lock
                changed.append("is_locked")
            first = start + timedelta(days=30 * n)
            if not exam.start_date:
                exam.start_date, exam.end_date = first, first + timedelta(days=14)
                changed += ["start_date", "end_date"]
            if exam.is_published and exam.status != Exam.Status.COMPLETED:
                exam.status = Exam.Status.COMPLETED
                changed.append("status")
            if changed:
                exam.save(update_fields=changed)

            # One subject per day; the classes sit it together, each in its own room.
            papers = ExamSubject.objects.filter(exam=exam).select_related("subject")
            by_subject = {}
            for paper in papers.order_by("subject__name", "class_level__order"):
                by_subject.setdefault(paper.subject_id, []).append(paper)
            for day, group in enumerate(by_subject.values()):
                for slot, paper in enumerate(group):
                    if paper.exam_date:
                        continue
                    paper.exam_date = exam.start_date + timedelta(days=day)
                    paper.start_time, paper.end_time, paper.reporting_time = time(10), time(13), time(9, 45)
                    paper.room = rooms[slot % len(rooms)]
                    if teachers:
                        paper.invigilator = teachers[(day + slot) % len(teachers)]
                        if len(teachers) > 1:
                            paper.assistant_invigilator = teachers[(day + slot + 1) % len(teachers)]
                    paper.save()
        self.stdout.write(self.style.SUCCESS(
            f"Grade scale '{scale.name}' ({scale.bands.count()} bands), {len(rooms)} rooms, "
            f"{ExamSubject.objects.filter(organization=org, exam_date__isnull=False).count()} papers timetabled."
        ))
