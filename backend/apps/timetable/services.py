"""Timetable conflict detection and grid building."""
from django.utils import timezone

from .models import Day, RoutineEntry

DAY_ORDER = [d.value for d in Day]


def clashes(*, organization_id, academic_year, day, period, section, teacher, room, exclude_id=None):
    """Active entries that collide with the proposed one.

    Overlap is by clock time, so a morning-shift period and a day-shift period
    that overlap still clash for the same teacher or room.
    """
    overlapping = RoutineEntry.objects.filter(
        organization_id=organization_id, academic_year=academic_year, day=day,
        status=RoutineEntry.Status.ACTIVE,
        period__start_time__lt=period.end_time, period__end_time__gt=period.start_time,
    ).exclude(pk=exclude_id).select_related("section", "section__class_level", "subject", "teacher", "room", "period")
    out = []
    for other in overlapping:
        reasons = []
        if other.section_id == section.pk:
            reasons.append(f"section {other.section} already has {other.subject.name}")
        if teacher is not None and other.teacher_id == teacher.pk:
            reasons.append(f"{teacher.full_name} is teaching {other.section}")
        if room is not None and other.room_id == room.pk:
            reasons.append(f"room {room.name} is used by {other.section}")
        if reasons:
            out.append({
                "entry": str(other.id), "section": str(other.section),
                "subject": other.subject.name, "start_time": str(other.period.start_time),
                "end_time": str(other.period.end_time), "reason": "; ".join(reasons),
            })
    return out


def entry_row(e):
    return {
        "id": str(e.id), "day": e.day, "period": str(e.period_id), "period_no": e.period.period_no,
        "label": e.period.label, "start_time": e.period.start_time, "end_time": e.period.end_time,
        "is_break": e.period.is_break,
        "subject": e.subject.name, "subject_id": str(e.subject_id),
        "teacher": e.teacher.full_name if e.teacher_id else None,
        "teacher_id": str(e.teacher_id) if e.teacher_id else None,
        "room": e.room.name if e.room_id else None,
        "section": str(e.section), "section_id": str(e.section_id),
        "status": e.status, "notes": e.notes,
    }


def weekly(entries):
    """{day: [rows sorted by start]} for the given entries, days in week order."""
    grid = {}
    for e in sorted(entries, key=lambda e: (DAY_ORDER.index(e.day), e.period.start_time)):
        grid.setdefault(e.day, []).append(entry_row(e))
    return {d: grid[d] for d in DAY_ORDER if d in grid}


def today_schedule(entries, now=None):
    """Today's rows with completed / ongoing / upcoming status."""
    now = now or timezone.localtime()
    today = now.strftime("%A").lower()
    current = now.time()
    rows = []
    for e in sorted((e for e in entries if e.day == today), key=lambda e: e.period.start_time):
        row = entry_row(e)
        if current >= e.period.end_time:
            row["state"] = "completed"
        elif current >= e.period.start_time:
            row["state"] = "ongoing"
        else:
            row["state"] = "upcoming"
        rows.append(row)
    return {"day": today, "date": str(now.date()), "periods": rows}


def active_entries(**filters):
    from apps.academics.models import AcademicYear

    qs = RoutineEntry.objects.filter(status=RoutineEntry.Status.ACTIVE, **filters).select_related(
        "period", "subject", "teacher", "room", "section", "section__class_level",
    )
    return qs.filter(academic_year__in=AcademicYear.objects.filter(is_current=True))

