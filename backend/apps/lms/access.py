"""Download rules for files attached to LMS objects (see apps.files.access)."""
from apps.files.access import register

from . import services
from .models import Assignment, Material, Submission


def _children(user):
    try:
        guardian = user.guardian_profile
    except Exception:
        return []
    return [link.student for link in guardian.student_links.select_related("student")]


def _students_of(user):
    try:
        return [user.student_profile]
    except Exception:
        return _children(user)


@register
def lms_files(user, stored):
    # Staff who teach the class (or manage all LMS content).
    staff_scope = None if services.manages_all(user) else services.teaching_q(user)

    def staff_can(qs):
        return qs.exists() if staff_scope is None else qs.filter(staff_scope).exists()

    assignments = Assignment.objects.filter(attachments=stored)
    materials = Material.objects.filter(file=stored)
    submissions = Submission.objects.filter(attachments=stored)

    if staff_can(assignments) or staff_can(materials):
        return True
    if submissions.filter(
        assignment__in=Assignment.objects.all() if staff_scope is None
        else Assignment.objects.filter(staff_scope)
    ).exists():
        return True
    for student in _students_of(user):
        visible = services.for_student_q(student)
        if assignments.filter(visible, status__in=("published", "closed")).exists():
            return True
        if materials.filter(visible, is_shared=True).exists():
            return True
        if submissions.filter(student=student).exists():
            return True
    return False
