"""Attendance rules (school.md §7.8) shared by single, bulk and register writes."""


from django.conf import settings
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.rbac.services import user_has_permission

from .models import Holiday

PRESENT_LIKE = ("present", "late", "half_day")


def can_manage_all(user):
    return bool(
        user.is_superuser or user.is_platform_admin
        or user_has_permission(user, "attendance.manage.all")
    )


def holiday_on(organization_id, date):
    return Holiday.objects.filter(
        organization_id=organization_id, start_date__lte=date, end_date__gte=date
    ).first()


def check_date(user, organization_id, date):
    """Raise unless attendance may be written for `date` by `user`."""
    today = timezone.localdate()
    if date > today:
        raise ValidationError({"date": "Attendance cannot be recorded for a future date."})
    holiday = holiday_on(organization_id, date)
    if holiday:
        raise ValidationError({"date": f"{date} is a holiday ({holiday.name})."})
    window = settings.ATTENDANCE_EDIT_WINDOW_DAYS
    if not can_manage_all(user) and (today - date).days > window:
        raise ValidationError(
            {"date": f"Attendance older than {window} days is locked. Ask an administrator."}
        )


def check_students(user, students):
    """Raise unless every student is active and (for teachers) one they teach."""
    from apps.students.models import Student
    from apps.teachers.services import student_scope_q

    inactive = [s.admission_number for s in students if s.status != Student.Status.ACTIVE]
    if inactive:
        raise ValidationError({"records": f"Not active students: {', '.join(inactive)}"})
    if can_manage_all(user):
        return
    allowed = set(
        Student.objects.filter(student_scope_q(user), pk__in=[s.pk for s in students])
        .values_list("pk", flat=True)
    )
    outside = [s.admission_number for s in students if s.pk not in allowed]
    if outside:
        raise ValidationError(
            {"records": f"You can only mark attendance for your own classes: {', '.join(outside)}"}
        )


def rate(qs):
    total = qs.count()
    present = qs.filter(status__in=PRESENT_LIKE).count()
    return round(present / total * 100, 1) if total else None
