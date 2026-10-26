"""Per-student aggregates shared by the staff overview, the student portal and the
parent portal, so all three report identical numbers."""
from django.db.models import Count, Sum

from apps.attendance.models import Attendance
from apps.exams.models import Mark
from apps.fees.models import Invoice

PRESENT_LIKE = ("present", "late", "half_day")


def attendance_summary(student):
    rows = (
        Attendance.objects.filter(student=student)
        .values("status").annotate(n=Count("id"))
    )
    by_status = {r["status"]: r["n"] for r in rows}
    total = sum(by_status.values())
    present_like = sum(by_status.get(s, 0) for s in PRESENT_LIKE)
    pct = round(present_like / total * 100, 1) if total else None
    return {"total": total, "by_status": by_status, "present_pct": pct}


def fees_summary(student):
    rows = Invoice.objects.filter(student=student).exclude(
        status=Invoice.Status.CANCELLED
    ).aggregate(billed=Sum("total_amount"), paid=Sum("paid_amount"))
    billed = float(rows["billed"] or 0)
    paid = float(rows["paid"] or 0)
    return {"billed": billed, "paid": paid, "outstanding": billed - paid}


def exam_results(student, *, published_only=True):
    """Marks grouped per exam, newest first, with totals and percentage."""
    marks = (
        Mark.objects.filter(student=student)
        .select_related("exam_subject", "exam_subject__exam", "exam_subject__subject")
        .order_by("-exam_subject__exam__start_date", "exam_subject__subject__name")
    )
    if published_only:
        marks = marks.filter(exam_subject__exam__is_published=True)

    exams: dict = {}
    for m in marks:
        ex = m.exam_subject.exam
        d = exams.setdefault(str(ex.id), {
            "exam_id": str(ex.id), "exam": ex.name, "is_published": ex.is_published,
            "subjects": [], "obtained": 0.0, "full": 0.0,
        })
        obtained = float(m.marks_obtained) if m.marks_obtained is not None else None
        full = float(m.exam_subject.full_marks)
        d["subjects"].append({
            "subject": m.exam_subject.subject.name,
            "marks_obtained": obtained,
            "full_marks": full,
            "pass_marks": float(m.exam_subject.pass_marks),
            "is_absent": m.is_absent,
        })
        if obtained is not None and not m.is_absent:
            d["obtained"] += obtained
        d["full"] += full
    results = []
    for d in exams.values():
        d["percentage"] = round(d["obtained"] / d["full"] * 100, 2) if d["full"] else None
        results.append(d)
    return results


def child_summary(student):
    """Compact card used in a guardian's list of children."""
    results = exam_results(student)
    return {
        "attendance_pct": attendance_summary(student)["present_pct"],
        "outstanding_fees": fees_summary(student)["outstanding"],
        "latest_result_pct": results[0]["percentage"] if results else None,
        "published_exams": len(results),
    }
