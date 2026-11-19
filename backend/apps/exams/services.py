"""Exam domain logic: result computation, completeness, schedule conflicts and
who may enter which marks."""
from decimal import Decimal

from django.db.models import Q

from apps.rbac.services import user_has_permission

from .models import ExamSubject, Mark

HUNDRED = Decimal("100")


def _pct(obtained, full):
    return (obtained / full * HUNDRED).quantize(Decimal("0.01")) if full else None


def _band(scale, pct):
    return scale.band_for(pct) if scale is not None and pct is not None else None


def compute_results(exam, class_level, *, section=None, student_ids=None):
    """Per-student results for one class in one exam, ranked.

    Each paper is pass/fail on its own pass marks; a student passes overall only
    if they pass every paper. Students with missing marks are `incomplete` and
    unranked. Ranks are standard competition ranks ("1, 2, 2, 4") by percentage,
    across the class and within each section.
    """
    from apps.students.models import Student

    scale = exam.grade_scale
    if scale is not None:
        scale = type(scale).objects.prefetch_related("bands").get(pk=scale.pk)
    papers = list(
        ExamSubject.objects.filter(exam=exam, class_level=class_level).select_related("subject")
        .order_by("subject__name")
    )
    marks = {}
    for m in Mark.objects.filter(exam_subject__in=papers):
        marks[(m.student_id, m.exam_subject_id)] = m

    roster = Student.objects.filter(
        Q(class_level=class_level, status=Student.Status.ACTIVE)
        | Q(pk__in={sid for sid, _ in marks}),
        organization_id=exam.organization_id,
    ).select_related("section", "class_level")
    if section is not None:
        roster = roster.filter(section=section)
    if student_ids is not None:
        roster = roster.filter(pk__in=student_ids)

    rows = []
    for student in roster:
        subjects, obtained_total, full_total, gps = [], Decimal(0), Decimal(0), []
        any_fail = any_missing = False
        absent_count = 0
        for paper in papers:
            mark = marks.get((student.id, paper.id))
            full_total += paper.full_marks
            entry = {
                "exam_subject": str(paper.id), "subject": paper.subject.name,
                "full_marks": float(paper.full_marks), "pass_marks": float(paper.pass_marks),
                "marks_obtained": None, "is_absent": False, "percentage": None,
                "grade": None, "grade_point": None, "result": "missing",
                "theory_marks": None, "practical_marks": None, "internal_marks": None,
                "remarks": "",
            }
            if mark is None:
                any_missing = True
            elif mark.is_absent:
                absent_count += 1
                any_fail = True
                entry.update(is_absent=True, result="absent", remarks=mark.remarks)
            else:
                pct = _pct(mark.marks_obtained, paper.full_marks)
                band = _band(scale, pct)
                passed = mark.marks_obtained >= paper.pass_marks
                any_fail |= not passed
                obtained_total += mark.marks_obtained
                if band is not None:
                    gps.append(band.gpa)
                entry.update(
                    marks_obtained=float(mark.marks_obtained), percentage=float(pct),
                    grade=band.grade if band else None,
                    grade_point=float(band.gpa) if band else None,
                    result="pass" if passed else "fail", remarks=mark.remarks,
                    **{f"{c}_marks": float(getattr(mark, f"{c}_marks"))
                       for c in ("theory", "practical", "internal")
                       if getattr(mark, f"{c}_marks") is not None},
                )
            subjects.append(entry)

        pct = _pct(obtained_total, full_total)
        band = _band(scale, pct)
        if papers and absent_count == len(papers):
            result = "absent"
        elif any_missing or not papers:
            result = "incomplete"
        else:
            result = "fail" if any_fail else "pass"
        rows.append({
            "student": str(student.id), "name": student.full_name,
            "admission_number": student.admission_number,
            "registration_number": student.registration_number,
            "roll_number": student.roll_number,
            "section": str(student.section_id) if student.section_id else None,
            "section_name": student.section.name if student.section_id else None,
            "subjects": subjects,
            "total_obtained": float(obtained_total), "total_full": float(full_total),
            "percentage": float(pct) if pct is not None else None,
            "grade": band.grade if band else None,
            "gpa": float(round(sum(gps) / len(gps), 2)) if gps and len(gps) == len(papers) else None,
            "result": result, "rank": None, "section_rank": None,
        })

    _rank(rows, "rank", key=lambda r: None)
    _rank(rows, "section_rank", key=lambda r: r["section"])
    rows.sort(key=lambda r: (r["rank"] is None, r["rank"] or 0, r["name"]))
    return {
        "exam": str(exam.id), "class_level": str(class_level.id), "class_level_name": class_level.name,
        "papers": [{"exam_subject": str(p.id), "subject": p.subject.name,
                    "full_marks": float(p.full_marks)} for p in papers],
        "rows": rows,
    }


def _rank(rows, field, key):
    groups = {}
    for r in rows:
        if r["result"] in ("pass", "fail"):
            groups.setdefault(key(r), []).append(r)
    for group in groups.values():
        group.sort(key=lambda r: r["percentage"], reverse=True)
        for i, r in enumerate(group):
            prev = group[i - 1] if i else None
            r[field] = prev[field] if prev and prev["percentage"] == r["percentage"] else i + 1


def completeness(exam):
    """Papers still missing marks for some students currently in the class."""
    from apps.students.models import Student

    gaps = []
    for paper in ExamSubject.objects.filter(exam=exam).select_related("class_level", "subject"):
        roster = Student.objects.filter(
            class_level=paper.class_level, status=Student.Status.ACTIVE,
            academic_year_id=exam.academic_year_id,
        )
        total = roster.count()
        entered = Mark.objects.filter(exam_subject=paper, student__in=roster).count()
        if entered < total:
            gaps.append({
                "exam_subject": str(paper.id), "class_level_name": paper.class_level.name,
                "subject": paper.subject.name, "entered": entered, "total": total,
            })
    return gaps


def schedule_conflicts(paper_data, *, exclude_id=None, organization_id):
    """Other papers clashing in time with this one: same room, same invigilator
    (either role), or the same class sitting two papers at once."""
    date, start, end = paper_data.get("exam_date"), paper_data.get("start_time"), paper_data.get("end_time")
    if not (date and start and end):
        return []
    overlapping = ExamSubject.objects.filter(
        organization_id=organization_id, exam_date=date,
        start_time__lt=end, end_time__gt=start, exam__status__in=["draft", "scheduled"],
    ).exclude(pk=exclude_id).select_related("exam", "subject", "class_level", "room")
    staff = {t.pk for t in (paper_data.get("invigilator"), paper_data.get("assistant_invigilator")) if t}
    room = paper_data.get("room")
    clashes = []
    for other in overlapping:
        reasons = []
        if room is not None and other.room_id == room.pk:
            reasons.append(f"room {room.name}")
        if staff & {other.invigilator_id, other.assistant_invigilator_id} - {None}:
            reasons.append("invigilator")
        if other.class_level_id == paper_data["class_level"].pk:
            reasons.append(f"class {other.class_level.name}")
        if reasons:
            clashes.append({
                "exam_subject": str(other.id), "exam": other.exam.name, "subject": other.subject.name,
                "start_time": str(other.start_time), "end_time": str(other.end_time),
                "reason": ", ".join(reasons),
            })
    return clashes


def can_enter_marks(user, paper):
    """Return a Q over students whose marks `user` may enter for `paper`, or
    None for "all of them"."""
    from apps.teachers.models import TeacherAssignment
    from apps.teachers.services import get_teacher

    if user.is_superuser or user.is_platform_admin or user_has_permission(user, "exam.marks.enter.all"):
        return None
    teacher = get_teacher(user)
    assignments = TeacherAssignment.objects.filter(
        teacher=teacher, subject=paper.subject, class_level=paper.class_level,
        academic_year_id=paper.exam.academic_year_id,
    ) if teacher else TeacherAssignment.objects.none()
    q = Q(pk__in=[])
    for a in assignments:
        q |= Q(section_id=a.section_id) if a.section_id else Q(class_level_id=a.class_level_id)
    return q
