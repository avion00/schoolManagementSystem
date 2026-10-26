from django.http import Http404
from rest_framework.permissions import BasePermission


def get_student(user):
    """Return the Student record linked to this user, or None."""
    if not (user and user.is_authenticated):
        return None
    try:
        return user.student_profile
    except Exception:
        return None


def get_guardian(user):
    """Return the active Guardian record linked to this user, or None."""
    if not (user and user.is_authenticated):
        return None
    try:
        guardian = user.guardian_profile
    except Exception:
        return None
    if not guardian.is_active or guardian.status != guardian.Status.ACTIVE:
        return None
    return guardian


def get_child(user, student_id):
    """The guardian's linked, active child with this id — else 404.

    Ownership is checked through the link table, never trusted from the URL,
    so a parent can't read another family's child by guessing ids (IDOR).
    """
    from apps.guardians.models import StudentGuardian

    guardian = get_guardian(user)
    link = (
        StudentGuardian.objects.filter(guardian=guardian, student_id=student_id)
        .select_related("student", "student__class_level", "student__section", "student__academic_year")
        .first()
        if guardian else None
    )
    if link is None or not link.student.is_active:
        raise Http404
    return link.student


class HasStudentProfile(BasePermission):
    message = "This area is only available to student accounts."

    def has_permission(self, request, view):
        return get_student(request.user) is not None


class HasGuardianProfile(BasePermission):
    message = "This area is only available to parent / guardian accounts."

    def has_permission(self, request, view):
        return get_guardian(request.user) is not None
