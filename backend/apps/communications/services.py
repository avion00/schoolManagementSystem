"""Notice audiences and in-app notification fan-out.

Audience resolution works in both directions and must stay symmetric:
`audience_users(notice)` (who a notice reaches) and `visible_notices(user)`
(which notices a user sees). Tests assert they agree.
"""
from django.db.models import Q
from django.utils import timezone

from apps.accounts.models import User

from .models import Notice, Notification

A = Notice.Audience
STUDENT_AUDIENCES = (A.ALL, A.STUDENTS, A.STUDENTS_PARENTS)
PARENT_AUDIENCES = (A.ALL, A.PARENTS, A.STUDENTS_PARENTS)
TEACHER_AUDIENCES = (A.ALL, A.TEACHERS, A.STAFF)
STAFF_AUDIENCES = (A.ALL, A.STAFF)


def _profile(user, attr):
    try:
        return getattr(user, attr)
    except Exception:
        return None


def live_q(now=None):
    """Published (or scheduled and due) and not expired."""
    now = now or timezone.now()
    return (
        Q(status__in=(Notice.Status.PUBLISHED, Notice.Status.SCHEDULED), publish_at__lte=now)
        & (Q(expires_on__isnull=True) | Q(expires_on__gte=timezone.localdate()))
    )


def _untargeted():
    return Q(target_class_levels__isnull=True, target_sections__isnull=True)


def _targets(class_ids, section_ids):
    return _untargeted() | Q(target_class_levels__in=class_ids) | Q(target_sections__in=section_ids)


def visible_notices(user):
    """Notices `user` may read (any role mix: e.g. a teacher who is also a parent)."""
    qs = Notice.objects.filter(organization_id=user.organization_id).filter(live_q())
    student = _profile(user, "student_profile")
    guardian = _profile(user, "guardian_profile")
    teacher = _profile(user, "teacher_profile")
    rules = Q(pk__in=[])
    if student and student.is_active and student.status == "active":
        rules |= Q(audience__in=STUDENT_AUDIENCES) & _targets([student.class_level_id], [student.section_id])
    if guardian and guardian.is_active and guardian.status == guardian.Status.ACTIVE:
        kids = [link.student for link in guardian.student_links.select_related("student")
                if link.student.is_active]
        rules |= Q(audience__in=PARENT_AUDIENCES) & _targets(
            [k.class_level_id for k in kids], [k.section_id for k in kids if k.section_id]
        )
    if teacher and teacher.is_active:
        assignments = list(teacher.assignments.all())
        rules |= Q(audience__in=TEACHER_AUDIENCES) & _targets(
            [a.class_level_id for a in assignments], [a.section_id for a in assignments if a.section_id]
        )
    if not (student or guardian or teacher):
        rules |= Q(audience__in=STAFF_AUDIENCES)
    return qs.filter(rules).distinct()


def audience_users(notice):
    """Active users in the notice's organization who can see it."""
    return resolve_audience(
        notice.organization_id, notice.audience,
        list(notice.target_class_levels.values_list("pk", flat=True)),
        list(notice.target_sections.values_list("pk", flat=True)),
    )


def resolve_audience(organization_id, audience, class_ids=(), section_ids=()):
    """Active users of an audience group, optionally narrowed to classes/sections.
    Shared by notices and message broadcasts."""
    targeted = bool(class_ids or section_ids)

    def scoped(prefix_class, prefix_section):
        if not targeted:
            return Q()
        return Q(**{f"{prefix_class}__in": class_ids}) | Q(**{f"{prefix_section}__in": section_ids})

    q = Q(pk__in=[])
    if audience in STUDENT_AUDIENCES:
        q |= Q(student_profile__is_active=True, student_profile__status="active") & scoped(
            "student_profile__class_level", "student_profile__section"
        )
    if audience in PARENT_AUDIENCES:
        q |= Q(
            guardian_profile__is_active=True, guardian_profile__status="active",
            guardian_profile__student_links__is_active=True,
            guardian_profile__student_links__student__is_active=True,
        ) & scoped(
            "guardian_profile__student_links__student__class_level",
            "guardian_profile__student_links__student__section",
        )
    if audience in TEACHER_AUDIENCES:
        q |= Q(teacher_profile__is_active=True) & scoped(
            "teacher_profile__assignments__class_level", "teacher_profile__assignments__section"
        )
    if audience in STAFF_AUDIENCES:
        q |= Q(student_profile__isnull=True, guardian_profile__isnull=True, teacher_profile__isnull=True)
    return User.objects.filter(q, organization_id=organization_id, is_active=True).distinct()


def _email_channel_on(organization_id):
    from apps.orgsettings.services import get_setting

    return bool(organization_id) and bool(get_setting(organization_id, "notifications", "channels", "email"))


def notify(users, *, title, body="", category=Notification.Category.SYSTEM,
           type=Notification.Type.INFO, priority="normal", related=None, action_url="", email=None):
    """Create one in-app notification per user. Returns how many were created.

    `email=None` follows the school's email channel setting; True/False forces it.
    Emails are queued here and sent by the `send_notification_emails` job.
    """
    users = list(users)
    if email is None:
        email = bool(users) and _email_channel_on(users[0].organization_id)
    related_type = related.__class__.__name__ if related is not None else ""
    related_id = str(related.pk) if related is not None else ""
    rows = [
        Notification(
            organization_id=u.organization_id, user=u, title=title[:200], body=body,
            category=category, type=type, priority=priority,
            related_type=related_type, related_id=related_id, action_url=action_url,
            email_status="pending" if email and u.email else "",
        )
        for u in users
    ]
    Notification.objects.bulk_create(rows, batch_size=500)
    return len(rows)


def notify_notice(notice):
    """Fan a published notice out as notifications (once)."""
    if not (notice.send_notification or notice.send_email) or notice.notified_at:
        return 0
    count = notify(
        audience_users(notice), title=notice.title, body=notice.summary or notice.body[:280],
        category=Notification.Category.NOTICES,
        type=Notification.Type.WARNING if notice.priority == "urgent" else Notification.Type.INFO,
        priority=notice.priority, related=notice, action_url=f"/notices/{notice.pk}",
        email=True if notice.send_email else None,
    )
    Notice.objects.filter(pk=notice.pk).update(notified_at=timezone.now())
    return count


def guardian_users_of(students):
    """Active portal users of the active guardians of these students."""
    return User.objects.filter(
        is_active=True,
        guardian_profile__is_active=True, guardian_profile__status="active",
        guardian_profile__student_links__is_active=True,
        guardian_profile__student_links__student__in=students,
    ).distinct()


# --- domain event hooks (called explicitly from the views that cause them) ---

def _event_enabled(organization_id, event):
    from apps.orgsettings.services import get_setting

    return get_setting(organization_id, "notifications", "events", event)


def notify_absences(students, date):
    """Tell each absent student's guardians (one notification per guardian per child)."""
    sent = 0
    if students and not _event_enabled(students[0].organization_id, "attendance_alert"):
        return 0
    for student in students:
        sent += notify(
            guardian_users_of([student]),
            title=f"{student.full_name} was marked absent",
            body=f"{student.full_name} was absent on {date}. Contact the school if this is unexpected.",
            category=Notification.Category.ATTENDANCE, type=Notification.Type.WARNING,
            priority="high", related=student, action_url=f"/children/{student.pk}/attendance",
        )
    return sent


def notify_results_published(exam):
    from apps.students.models import Student

    if not _event_enabled(exam.organization_id, "result_published"):
        return 0
    students = Student.objects.filter(
        organization_id=exam.organization_id, status="active",
        marks__exam_subject__exam=exam, marks__is_active=True,
    ).distinct()
    student_users = User.objects.filter(is_active=True, student_profile__in=students)
    recipients = list(student_users) + list(guardian_users_of(students))
    return notify(
        recipients, title=f"Results published: {exam.name}",
        body="Results are now available in the portal.",
        category=Notification.Category.EXAMS, type=Notification.Type.SUCCESS,
        related=exam, action_url="/results",
    )


def notify_discount_decided(discount):
    if discount.created_by is None:
        return 0
    return notify(
        [discount.created_by],
        title=f"Discount {discount.status}: {discount.invoice.number}",
        body=f"{discount.amount} on {discount.invoice.number} was {discount.status}. {discount.decision_note}".strip(),
        category=Notification.Category.APPROVALS,
        type=Notification.Type.SUCCESS if discount.status == "approved" else Notification.Type.ERROR,
        related=discount, action_url="/billing/invoices",
    )
