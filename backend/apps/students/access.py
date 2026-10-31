"""Student photos: staff who can see the student, the student, their guardians."""
from apps.files.access import register
from apps.rbac.services import user_has_permission


@register
def student_documents(user, stored):
    docs = stored.student_documents.all()
    return docs.exists() and (
        user_has_permission(user, "student.view.all") or docs.filter(student__user=user).exists()
        or docs.filter(student__guardian_links__guardian__user=user).exists()
    )


@register
def student_photo(user, stored):
    from apps.teachers.services import student_scope_q

    students = stored.student_photos.all()
    if not students.exists():
        return False
    if user_has_permission(user, "student.view.all"):
        return True
    if students.filter(user=user).exists() or students.filter(
        guardian_links__guardian__user=user, guardian_links__is_active=True
    ).exists():
        return True
    return user_has_permission(user, "student.view.class") and students.filter(student_scope_q(user)).exists()
