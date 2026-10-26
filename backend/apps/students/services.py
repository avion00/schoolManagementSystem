"""Per-student aggregates shared by the staff overview, the student portal and the
parent portal, so all three report identical numbers."""
from django.db.models import Count, Sum

from apps.attendance.models import Attendance
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
    """The student's result in each exam (newest first), computed by the same
    engine as staff results, so grades, GPA and ranks always agree."""
    from apps.exams.models import Exam, ExamSubject
    from apps.exams.services import compute_results

    exams = Exam.objects.filter(
        exam_subjects__marks__student=student, exam_subjects__marks__is_active=True
    ).distinct().select_related("grade_scale")
    if published_only:
        exams = exams.filter(is_published=True)
    results = []
    for exam in exams.order_by("-start_date", "-created_at"):
        paper = ExamSubject.objects.filter(exam=exam, marks__student=student).select_related("class_level").first()
        data = compute_results(exam, paper.class_level)
        row = next((r for r in data["rows"] if r["student"] == str(student.id)), None)
        if row is None:
            continue
        results.append({
            "exam_id": str(exam.id), "exam": exam.name, "is_published": exam.is_published,
            "subjects": row["subjects"], "obtained": row["total_obtained"], "full": row["total_full"],
            "percentage": row["percentage"], "grade": row["grade"], "gpa": row["gpa"],
            "result": row["result"], "rank": row["rank"], "section_rank": row["section_rank"],
        })
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
