"""Teacher scoping: which classes / students a teacher is responsible for.

Used to enforce `*.class`-scoped permissions (school.md §5.3): a user holding
`student.view.class` but not `student.view.all` only sees students in the
sections they're assigned to for the current academic year.
"""
from django.db.models import Count, Q

from .models import StaffAttendance, TeacherAssignment


def get_teacher(user):
    if not (user and user.is_authenticated):
        return None
    try:
        teacher = user.teacher_profile
    except Exception:
        return None
    return teacher if teacher.is_active else None


def current_assignments(teacher):
    """Assignments in the current academic year (all years if none is current)."""
    qs = TeacherAssignment.objects.filter(teacher=teacher).select_related(
        "academic_year", "class_level", "section", "subject"
    )
    current = qs.filter(academic_year__is_current=True)
    return current if current.exists() else qs


def student_scope_q(user, prefix=""):
    """Q selecting students the user teaches. Matches nothing for non-teachers.

    `prefix` lets callers filter related models, e.g. "student__".
    """
    teacher = get_teacher(user)
    if teacher is None:
        return Q(pk__in=[])
    q = Q(pk__in=[]) if not prefix else Q(**{f"{prefix}pk__in": []})
    for a in current_assignments(teacher):
        cond = {f"{prefix}class_level_id": a.class_level_id}
        if a.section_id:
            cond[f"{prefix}section_id"] = a.section_id
        q |= Q(**cond)
    return q


# --- teacher portal aggregates ----------------------------------------------

PRESENT_LIKE = ("present", "late", "half_day")


def staff_attendance_summary(qs):
    """{present, absent, late, half_day, leave, holiday, total, percentage} for a queryset."""
    counts = dict(qs.values_list("status").annotate(n=Count("id")))
    working = sum(n for status, n in counts.items() if status != "holiday")
    present = sum(counts.get(s, 0) for s in PRESENT_LIKE)
    summary = {s: counts.get(s, 0) for s in StaffAttendance.Status.values}
    summary.update({
        "total": working,
        "percentage": round(present / working * 100, 1) if working else None,
    })
    return summary


def assignment_students(assignment):
    from apps.students.models import Student

    qs = Student.objects.filter(
        organization_id=assignment.organization_id,
        academic_year_id=assignment.academic_year_id,
        class_level_id=assignment.class_level_id,
        status=Student.Status.ACTIVE,
    )
    if assignment.section_id:
        qs = qs.filter(section_id=assignment.section_id)
    return qs


def _attendance_rate(student_ids, since):
    from apps.attendance.models import Attendance

    rows = Attendance.objects.filter(student_id__in=student_ids, date__gte=since)
    total = rows.count()
    present = rows.filter(status__in=PRESENT_LIKE).count()
    return round(present / total * 100, 1) if total else None


def marks_progress(assignment, student_ids):
    """Entry progress for each unlocked exam paper this assignment covers."""
    from apps.exams.models import ExamSubject, Mark

    if not assignment.subject_id:
        return []
    papers = ExamSubject.objects.filter(
        exam__academic_year_id=assignment.academic_year_id, exam__is_locked=False,
        class_level_id=assignment.class_level_id, subject_id=assignment.subject_id,
    ).select_related("exam", "subject")
    out = []
    for paper in papers:
        graded = Mark.objects.filter(exam_subject=paper, student_id__in=student_ids).count()
        total = len(student_ids)
        out.append({
            "exam_subject": str(paper.id), "exam": paper.exam.name, "subject": paper.subject.name,
            "graded": graded, "total": total,
            "status": "complete" if total and graded >= total else ("in_progress" if graded else "not_started"),
        })
    return out


def class_card(assignment, today):
    """One of the teacher's classes, with roster size and work outstanding."""
    from datetime import timedelta

    from apps.attendance.models import Attendance

    student_ids = list(assignment_students(assignment).values_list("id", flat=True))
    marked_today = Attendance.objects.filter(student_id__in=student_ids, date=today).count()
    papers = marks_progress(assignment, student_ids)
    return {
        "assignment": str(assignment.id),
        "class_level": str(assignment.class_level_id),
        "class_level_name": assignment.class_level.name,
        "section": str(assignment.section_id) if assignment.section_id else None,
        "section_name": assignment.section.name if assignment.section_id else None,
        "subject": str(assignment.subject_id) if assignment.subject_id else None,
        "subject_name": assignment.subject.name if assignment.subject_id else None,
        "is_class_teacher": assignment.is_class_teacher,
        "students": len(student_ids),
        "attendance_rate_30d": _attendance_rate(student_ids, today - timedelta(days=29)),
        "attendance_marked_today": marked_today,
        "attendance_complete_today": bool(student_ids) and marked_today >= len(student_ids),
        "pending_marks": sum(1 for p in papers if p["status"] != "complete"),
        "marks_progress": papers,
    }
