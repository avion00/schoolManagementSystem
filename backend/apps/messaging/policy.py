"""Who may message whom.

Roles are derived from real profiles, not self-declared. The role matrix
mirrors the frontend's MESSAGE_PERMISSIONS, with one safety tightening:
students and parents may contact a teacher directly only if that teacher
teaches them / their child. Anything else allowed by the matrix is
"request" (the recipient must approve); anything else is denied.
"""
from apps.rbac.services import user_has_permission, user_role_names

SUPER_ADMIN, ADMIN, PRINCIPAL, TEACHER, PARENT, STUDENT, STAFF = (
    "super_admin", "admin", "principal", "teacher", "parent", "student", "staff",
)
ADMINS = {SUPER_ADMIN, ADMIN, PRINCIPAL}

CAN_MESSAGE = {
    SUPER_ADMIN: "all",
    ADMIN: {TEACHER, PARENT, STUDENT, STAFF, PRINCIPAL, ADMIN, SUPER_ADMIN},
    PRINCIPAL: {TEACHER, PARENT, STUDENT, STAFF, ADMIN, SUPER_ADMIN},
    TEACHER: {STUDENT, PARENT, TEACHER, STAFF, ADMIN, PRINCIPAL, SUPER_ADMIN},
    PARENT: {TEACHER, ADMIN, PRINCIPAL},
    STUDENT: {TEACHER, ADMIN, PRINCIPAL},
    STAFF: {STAFF, ADMIN, PRINCIPAL, SUPER_ADMIN},
}
CAN_CREATE_GROUPS = {SUPER_ADMIN, ADMIN, PRINCIPAL, TEACHER}

ALLOWED, REQUEST, DENIED = "allowed", "request", "denied"


def _profile(user, attr):
    try:
        return getattr(user, attr)
    except Exception:
        return None


def chat_role(user):
    if user.is_superuser or getattr(user, "is_platform_admin", False):
        return SUPER_ADMIN
    roles = set(user_role_names(user))
    if "Principal" in roles:
        return PRINCIPAL
    if "Admin" in roles:
        return ADMIN
    if _profile(user, "teacher_profile"):
        return TEACHER
    if _profile(user, "student_profile"):
        return STUDENT
    if _profile(user, "guardian_profile"):
        return PARENT
    return STAFF


def _teaches(teacher_user, students):
    from apps.teachers.models import TeacherAssignment

    teacher = _profile(teacher_user, "teacher_profile")
    if teacher is None:
        return False
    for s in students:
        q = TeacherAssignment.objects.filter(teacher=teacher, class_level_id=s.class_level_id)
        if q.filter(section_id=s.section_id).exists() or q.filter(section__isnull=True).exists():
            return True
    return False


def _students_of(user):
    student = _profile(user, "student_profile")
    if student:
        return [student]
    guardian = _profile(user, "guardian_profile")
    if guardian:
        return [link.student for link in guardian.student_links.select_related("student")]
    return []


def contact_rule(sender, recipient):
    """ALLOWED, REQUEST or DENIED for a new direct conversation."""
    if sender.pk == recipient.pk or not recipient.is_active:
        return DENIED
    if sender.organization_id != recipient.organization_id and chat_role(sender) != SUPER_ADMIN:
        return DENIED
    s_role, r_role = chat_role(sender), chat_role(recipient)
    allowed = CAN_MESSAGE[s_role]
    if allowed != "all" and r_role not in allowed:
        return DENIED
    if s_role in (STUDENT, PARENT) and r_role == TEACHER:
        return ALLOWED if _teaches(recipient, _students_of(sender)) else REQUEST
    return ALLOWED


def can_create_groups(user):
    return chat_role(user) in CAN_CREATE_GROUPS


def can(user, permission):
    return bool(user.is_superuser or getattr(user, "is_platform_admin", False)
                or user_has_permission(user, permission))
