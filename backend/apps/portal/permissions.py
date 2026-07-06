from rest_framework.permissions import BasePermission


def get_student(user):
    """Return the Student record linked to this user, or None."""
    if not (user and user.is_authenticated):
        return None
    try:
        return user.student_profile
    except Exception:
        return None


class HasStudentProfile(BasePermission):
    message = "This area is only available to student accounts."

    def has_permission(self, request, view):
        return get_student(request.user) is not None
