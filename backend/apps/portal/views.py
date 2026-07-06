"""Student self-service portal endpoints (student-dashboard.md).

Every endpoint resolves the Student from the JWT (request.user.student_profile) and
returns ONLY that student's data — never via a URL id (IDOR-safe).
"""
from django.db.models import Sum
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.attendance.models import Attendance
from apps.attendance.serializers import AttendanceSerializer
from apps.audit.services import record_audit
from apps.core.pagination import DefaultPagination
from apps.exams.models import Mark
from apps.fees.models import Invoice
from apps.fees.serializers import InvoiceSerializer

from .permissions import HasStudentProfile, get_student
from .serializers import StudentSelfSerializer, StudentSelfUpdateSerializer

STUDENT_PERMS = [IsAuthenticated, HasStudentProfile]


def _attendance_summary(student):
    qs = Attendance.objects.filter(student=student, is_active=True)
    total = qs.count()
    by_status = {}
    for row in qs.values("status"):
        by_status[row["status"]] = by_status.get(row["status"], 0) + 1
    present_like = sum(by_status.get(s, 0) for s in ("present", "late", "half_day"))
    pct = round(present_like / total * 100, 1) if total else None
    return {"total": total, "by_status": by_status, "present_pct": pct}


def _fees_summary(student):
    rows = Invoice.objects.filter(student=student, is_active=True).exclude(
        status=Invoice.Status.CANCELLED
    ).aggregate(billed=Sum("total_amount"), paid=Sum("paid_amount"))
    billed = float(rows["billed"] or 0)
    paid = float(rows["paid"] or 0)
    return {"billed": billed, "paid": paid, "outstanding": billed - paid}


def _published_results(student):
    marks = (
        Mark.objects.filter(
            student=student, is_active=True, exam_subject__exam__is_published=True,
        )
        .select_related("exam_subject", "exam_subject__exam", "exam_subject__subject")
        .order_by("-exam_subject__exam__start_date")
    )
    exams: dict = {}
    for m in marks:
        ex = m.exam_subject.exam
        d = exams.setdefault(str(ex.id), {
            "exam_id": str(ex.id), "exam": ex.name, "subjects": [],
            "obtained": 0.0, "full": 0.0,
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


class MyProfileView(APIView):
    permission_classes = STUDENT_PERMS

    def get(self, request):
        return Response(StudentSelfSerializer(get_student(request.user)).data)

    def patch(self, request):
        student = get_student(request.user)
        serializer = StudentSelfUpdateSerializer(student, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        record_audit(
            action="student.update.own", actor=request.user, instance=student,
            request=request, organization=student.organization,
        )
        return Response(StudentSelfSerializer(student).data)


class MyAttendanceView(generics.ListAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = STUDENT_PERMS
    pagination_class = DefaultPagination
    filterset_fields = ["status", "date"]

    def get_queryset(self):
        return Attendance.objects.filter(
            student=get_student(self.request.user), is_active=True
        )


class MyAttendanceSummaryView(APIView):
    permission_classes = STUDENT_PERMS

    def get(self, request):
        return Response(_attendance_summary(get_student(request.user)))


class MyResultsView(APIView):
    permission_classes = STUDENT_PERMS

    def get(self, request):
        return Response(_published_results(get_student(request.user)))


class MyFeesView(APIView):
    permission_classes = STUDENT_PERMS

    def get(self, request):
        student = get_student(request.user)
        invoices = (
            Invoice.objects.filter(student=student, is_active=True)
            .select_related("student").prefetch_related("items")
        )
        data = InvoiceSerializer(invoices, many=True, context={"request": request}).data
        return Response({"summary": _fees_summary(student), "invoices": data})


class MyDashboardView(APIView):
    permission_classes = STUDENT_PERMS

    def get(self, request):
        student = get_student(request.user)
        results = _published_results(student)
        return Response({
            "profile": StudentSelfSerializer(student).data,
            "attendance": _attendance_summary(student),
            "fees": _fees_summary(student),
            "published_exams": len(results),
            "latest_result": results[0] if results else None,
        })
