"""Self-service portals (student-dashboard.md, parent portal).

Every endpoint resolves the subject from the JWT — the student's own record, or
a child linked to the requesting guardian — never from an unchecked URL id.
"""
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

from .permissions import HasGuardianProfile, HasStudentProfile, get_child, get_guardian, get_student
from .serializers import ChildSerializer, StudentSelfSerializer, StudentSelfUpdateSerializer

STUDENT_PERMS = [IsAuthenticated, HasStudentProfile]
GUARDIAN_PERMS = [IsAuthenticated, HasGuardianProfile]


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
