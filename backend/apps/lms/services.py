"""LMS rules: who may teach what, which work a student sees, and status."""
from django.db.models import Q
from django.utils import timezone

from apps.rbac.services import user_has_permission

from .models import Assignment, Material, Submission


def manages_all(user):
    return bool(user.is_superuser or getattr(user, "is_platform_admin", False)
                or user_has_permission(user, "lms.manage.all"))


def can_teach(user, class_level, section, subject):
    """May this user publish work for (class, section, subject)? Teachers need a
    matching assignment this year; a class-wide one covers every section."""
    from apps.teachers.services import current_assignments, get_teacher

    if manages_all(user):
        return True
    teacher = get_teacher(user)
    if teacher is None:
        return False
    for a in current_assignments(teacher):
        if a.class_level_id != class_level.pk or a.subject_id != subject.pk:
            continue
        if a.section_id is None or (section is not None and a.section_id == section.pk):
            return True
    return False


def teaching_q(user, prefix=""):
    """Q over Assignment/Material/LessonPlan rows in the user's classes."""
    from apps.teachers.services import current_assignments, get_teacher

    teacher = get_teacher(user)
    q = Q(pk__in=[])
    if teacher is None:
        return q
    for a in current_assignments(teacher):
        if not a.subject_id:
            continue
        cond = Q(**{f"{prefix}class_level_id": a.class_level_id, f"{prefix}subject_id": a.subject_id})
        if a.section_id:
            cond &= Q(**{f"{prefix}section_id": a.section_id}) | Q(**{f"{prefix}section__isnull": True})
        q |= cond
    return q


def for_student_q(student):
    """Class-wide or own-section rows for this student's current class."""
    return Q(class_level_id=student.class_level_id) & (
        Q(section__isnull=True) | Q(section_id=student.section_id)
    )


def student_assignments(student):
    return Assignment.objects.filter(
        for_student_q(student), status__in=(Assignment.Status.PUBLISHED, Assignment.Status.CLOSED),
        academic_year_id=student.academic_year_id,
    ).select_related("subject", "teacher", "class_level", "section").prefetch_related("attachments")


def student_materials(student):
    return Material.objects.filter(for_student_q(student), is_shared=True).select_related(
        "subject", "teacher", "file"
    )


def student_status(assignment, submission, now=None):
    """To do / Submitted / Graded / Missing, from the student's point of view."""
    now = now or timezone.now()
    if submission is not None:
        return "graded" if submission.status == Submission.Status.GRADED else (
            "returned" if submission.status == Submission.Status.RETURNED else "submitted")
    if assignment.due_at < now and not assignment.allow_late:
        return "missing"
    if assignment.status == Assignment.Status.CLOSED:
        return "missing"
    return "late" if assignment.due_at < now else "todo"


def assignment_roster(assignment):
    """Active students the assignment is set for."""
    from apps.students.models import Student

    qs = Student.objects.filter(
        organization_id=assignment.organization_id, class_level_id=assignment.class_level_id,
        academic_year_id=assignment.academic_year_id, status=Student.Status.ACTIVE,
    )
    if assignment.section_id:
        qs = qs.filter(section_id=assignment.section_id)
    return qs
