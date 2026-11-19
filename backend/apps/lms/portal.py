"""Student / parent views of coursework (/me/assignments/, /me/materials/, ...)."""
from django.db import transaction
from django.http import Http404
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.portal.permissions import HasGuardianProfile, HasStudentProfile, get_child, get_student

from . import services
from .models import Assignment, Submission
from .serializers import AssignmentSerializer, MaterialSerializer, SubmissionSerializer, SubmitSerializer


def _rows(student, request):
    subs = {s.assignment_id: s for s in Submission.objects.filter(student=student).prefetch_related("attachments")}
    rows = []
    wanted = request.query_params.get("status")
    for a in services.student_assignments(student):
        status = services.student_status(a, subs.get(a.pk))
        if wanted and status != wanted:
            continue
        rows.append({
            **AssignmentSerializer(a, context={"request": request}).data,
            "my_status": status,
            "my_submission": SubmissionSerializer(subs[a.pk]).data if a.pk in subs else None,
        })
    return rows


class MyAssignmentsView(APIView):
    """?status=todo|late|submitted|graded|returned|missing"""

    permission_classes = [IsAuthenticated, HasStudentProfile]

    def get(self, request):
        return Response(_rows(get_student(request.user), request))


class MySubmitView(APIView):
    permission_classes = [IsAuthenticated, HasStudentProfile]
    serializer_class = SubmitSerializer

    @transaction.atomic
    def post(self, request, assignment_id):
        student = get_student(request.user)
        a = services.student_assignments(student).filter(pk=assignment_id).first()
        if a is None:
            raise Http404
        now = timezone.now()
        if a.status == Assignment.Status.CLOSED:
            raise ValidationError("This assignment is closed.")
        late = now > a.due_at
        if late and not a.allow_late:
            raise ValidationError("The due date has passed.")
        data = SubmitSerializer(data=request.data, context={"request": request})
        data.is_valid(raise_exception=True)
        sub = Submission.objects.filter(assignment=a, student=student).first()
        if sub and sub.status == Submission.Status.GRADED:
            raise ValidationError("This work has already been graded.")
        if sub is None:
            sub = Submission(organization_id=a.organization_id, assignment=a, student=student,
                             created_by=request.user)
        sub.text_answer = data.validated_data.get("text_answer", "")
        sub.submitted_at, sub.is_late, sub.status = now, late, Submission.Status.SUBMITTED
        sub.updated_by = request.user
        sub.save()
        sub.attachments.set(data.validated_data.get("attachment_ids", []))
        return Response(SubmissionSerializer(sub).data, status=201)


class MyMaterialsView(APIView):
    permission_classes = [IsAuthenticated, HasStudentProfile]

    def get(self, request):
        qs = services.student_materials(get_student(request.user))
        subject = request.query_params.get("subject")
        if subject:
            qs = qs.filter(subject_id=subject)
        return Response(MaterialSerializer(qs, many=True, context={"request": request}).data)


class MyChildAssignmentsView(APIView):
    permission_classes = [IsAuthenticated, HasGuardianProfile]

    def get(self, request, student_id):
        return Response(_rows(get_child(request.user, student_id), request))
