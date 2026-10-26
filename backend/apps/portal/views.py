"""Self-service portals (student-dashboard.md, parent portal).

Every endpoint resolves the subject from the JWT — the student's own record, or
a child linked to the requesting guardian — never from an unchecked URL id.
"""
from django.db.models import Count, Q
from django.http import Http404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.attendance.models import Attendance
from apps.attendance.serializers import AttendanceSerializer
from apps.audit.services import record_audit
from apps.core.pagination import DefaultPagination
from apps.fees.models import Invoice
from apps.fees.serializers import InvoiceSerializer
from apps.students import services
from apps.teachers import services as teacher_services
from apps.teachers.models import StaffAttendance
from apps.teachers.serializers import StaffAttendanceSerializer, TeacherSerializer
from apps.teachers.services import staff_attendance_summary

from .permissions import (
    HasGuardianProfile,
    HasStudentProfile,
    HasTeacherProfile,
    get_child,
    get_guardian,
    get_student,
)
from .serializers import ChildSerializer, StudentSelfSerializer, StudentSelfUpdateSerializer

STUDENT_PERMS = [IsAuthenticated, HasStudentProfile]
GUARDIAN_PERMS = [IsAuthenticated, HasGuardianProfile]
TEACHER_PERMS = [IsAuthenticated, HasTeacherProfile]


def _invoices(student, request):
    invoices = Invoice.objects.filter(student=student).prefetch_related("items")
    return {
        "summary": services.fees_summary(student),
        "invoices": InvoiceSerializer(invoices, many=True, context={"request": request}).data,
    }


def _dashboard(student):
    results = services.exam_results(student)
    return {
        "profile": StudentSelfSerializer(student).data,
        "attendance": services.attendance_summary(student),
        "fees": services.fees_summary(student),
        "published_exams": len(results),
        "latest_result": results[0] if results else None,
    }


# --- student portal ---------------------------------------------------------

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
        if getattr(self, "swagger_fake_view", False):
            return Attendance.objects.none()
        return Attendance.objects.filter(student=get_student(self.request.user))


class MyAttendanceSummaryView(APIView):
    permission_classes = STUDENT_PERMS

    def get(self, request):
        return Response(services.attendance_summary(get_student(request.user)))


class MyResultsView(APIView):
    permission_classes = STUDENT_PERMS

    def get(self, request):
        return Response(services.exam_results(get_student(request.user)))


class MyFeesView(APIView):
    permission_classes = STUDENT_PERMS

    def get(self, request):
        return Response(_invoices(get_student(request.user), request))


class MyDashboardView(APIView):
    permission_classes = STUDENT_PERMS

    def get(self, request):
        return Response(_dashboard(get_student(request.user)))


# --- parent portal ----------------------------------------------------------

class MyChildrenView(APIView):
    permission_classes = GUARDIAN_PERMS

    @extend_schema(operation_id="v1_me_children_list")
    def get(self, request):
        guardian = get_guardian(request.user)
        links = guardian.student_links.select_related(
            "student", "student__class_level", "student__section", "student__academic_year"
        ).filter(student__is_active=True)
        return Response([
            {
                **ChildSerializer(link.student).data,
                "relation": link.relation,
                **services.child_summary(link.student),
            }
            for link in links
        ])


class MyChildDashboardView(APIView):
    permission_classes = GUARDIAN_PERMS

    def get(self, request, student_id):
        return Response(_dashboard(get_child(request.user, student_id)))


class MyChildAttendanceView(generics.ListAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = GUARDIAN_PERMS
    pagination_class = DefaultPagination
    filterset_fields = ["status", "date"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Attendance.objects.none()
        return Attendance.objects.filter(
            student=get_child(self.request.user, self.kwargs["student_id"])
        )


class MyChildAttendanceSummaryView(APIView):
    permission_classes = GUARDIAN_PERMS

    def get(self, request, student_id):
        return Response(services.attendance_summary(get_child(request.user, student_id)))


class MyChildResultsView(APIView):
    permission_classes = GUARDIAN_PERMS

    def get(self, request, student_id):
        return Response(services.exam_results(get_child(request.user, student_id)))


class MyChildFeesView(APIView):
    permission_classes = GUARDIAN_PERMS

    def get(self, request, student_id):
        return Response(_invoices(get_child(request.user, student_id), request))


# --- teacher portal ---------------------------------------------------------

def _my_assignment(user, assignment_id):
    teacher = teacher_services.get_teacher(user)
    assignment = teacher_services.current_assignments(teacher).filter(pk=assignment_id).first()
    if assignment is None:
        raise Http404
    return assignment


class MyTeacherProfileView(APIView):
    permission_classes = TEACHER_PERMS

    def get(self, request):
        return Response(TeacherSerializer(teacher_services.get_teacher(request.user)).data)


class MyClassesView(APIView):
    permission_classes = TEACHER_PERMS

    def get(self, request):
        teacher = teacher_services.get_teacher(request.user)
        today = timezone.localdate()
        return Response([
            teacher_services.class_card(a, today)
            for a in teacher_services.current_assignments(teacher)
        ])


class MyClassStudentsView(APIView):
    """Roster for one of my classes, with each student's attendance %."""

    permission_classes = TEACHER_PERMS

    def get(self, request, assignment_id):
        assignment = _my_assignment(request.user, assignment_id)
        present = Count("attendances", filter=Q(
            attendances__is_active=True, attendances__status__in=teacher_services.PRESENT_LIKE
        ))
        total = Count("attendances", filter=Q(attendances__is_active=True))
        students = (
            teacher_services.assignment_students(assignment)
            .select_related("section")
            .prefetch_related("guardian_links__guardian")
            .annotate(present=present, total=total)
            .order_by("roll_number", "first_name")
        )
        rows = []
        for s in students:
            guardian = s.primary_guardian
            rows.append({
                "id": str(s.id), "name": s.full_name, "admission_number": s.admission_number,
                "registration_number": s.registration_number, "roll_number": s.roll_number,
                "section_name": s.section.name if s.section_id else None, "gender": s.gender,
                "status": s.status,
                "attendance_pct": round(s.present / s.total * 100, 1) if s.total else None,
                "guardian_name": guardian.full_name if guardian else None,
                "guardian_phone": guardian.phone if guardian else None,
                "guardian_email": guardian.email if guardian else None,
            })
        return Response(rows)


class MyTeacherDashboardView(APIView):
    permission_classes = TEACHER_PERMS

    def get(self, request):
        teacher = teacher_services.get_teacher(request.user)
        today = timezone.localdate()
        classes = [
            teacher_services.class_card(a, today)
            for a in teacher_services.current_assignments(teacher)
        ]
        # Registers are taken per section by its class teacher.
        pending_attendance = [
            {k: c[k] for k in ("assignment", "class_level_name", "section_name", "students")}
            | {"date": str(today)}
            for c in classes
            if c["is_class_teacher"] and c["students"] and not c["attendance_complete_today"]
        ]
        marks_pending = [
            {"assignment": c["assignment"], "class_level_name": c["class_level_name"],
             "section_name": c["section_name"], **paper}
            for c in classes for paper in c["marks_progress"] if paper["status"] != "complete"
        ]
        mine = StaffAttendance.objects.filter(teacher=teacher)
        return Response({
            "profile": TeacherSerializer(teacher).data,
            "classes": classes,
            "pending_attendance": pending_attendance,
            "marks_pending": marks_pending,
            "my_attendance_this_month": staff_attendance_summary(
                mine.filter(date__year=today.year, date__month=today.month)
            ),
            "totals": {
                "classes": len(classes),
                "students": sum(c["students"] for c in classes),
                "pending_attendance": len(pending_attendance),
                "pending_marks": len(marks_pending),
            },
        })


class MyStaffAttendanceView(generics.ListAPIView):
    serializer_class = StaffAttendanceSerializer
    permission_classes = TEACHER_PERMS
    pagination_class = DefaultPagination
    filterset_fields = ["status", "date"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return StaffAttendance.objects.none()
        return StaffAttendance.objects.filter(teacher=teacher_services.get_teacher(self.request.user))


class MyStaffAttendanceSummaryView(APIView):
    permission_classes = TEACHER_PERMS

    def get(self, request):
        teacher = teacher_services.get_teacher(request.user)
        return Response(staff_attendance_summary(StaffAttendance.objects.filter(teacher=teacher)))
