import csv

from django.db import transaction
from django.db.models import Prefetch
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from apps.accounts.services import provision_login
from apps.audit.services import record_audit
from apps.core.sequences import next_document_number
from apps.core.viewsets import TenantModelViewSet
from apps.guardians.models import StudentGuardian
from apps.rbac.services import user_permission_codes

from . import services
from .models import Student, StudentHistory
from .serializers import (
    PromoteSerializer,
    StatusChangeSerializer,
    StudentHistorySerializer,
    StudentListSerializer,
    StudentSerializer,
)

EXPORT_COLUMNS = [
    ("Admission No", "admission_number"), ("Registration No", "registration_number"),
    ("First Name", "first_name"), ("Middle Name", "middle_name"), ("Last Name", "last_name"),
    ("Gender", "gender"), ("Date of Birth", "date_of_birth"),
    ("Class", "class_level.name"), ("Section", "section.name"), ("Roll", "roll_number"),
    ("Academic Year", "academic_year.name"), ("Status", "status"),
    ("Phone", "phone"), ("Email", "email"), ("Address", "address"),
    ("Primary Guardian", "primary_guardian.full_name"),
    ("Guardian Phone", "primary_guardian.phone"),
]


def _resolve(obj, path):
    for part in path.split("."):
        obj = getattr(obj, part, None) if obj is not None else None
    return "" if obj is None else str(obj)


def _csv_safe(value):
    # Neutralise spreadsheet formula injection (=, +, -, @ at the start of a cell).
    return "'" + value if value[:1] in ("=", "+", "-", "@") else value


class StudentViewSet(TenantModelViewSet):
    queryset = Student.objects.select_related(
        "academic_year", "class_level", "section", "user"
    ).prefetch_related(
        Prefetch(
            "guardian_links",
            queryset=StudentGuardian.objects.filter(guardian__is_active=True).select_related("guardian"),
        )
    )
    serializer_class = StudentSerializer
    audit_label = "student"
    permission_required = {
        "list": "student.view.all",
        "retrieve": "student.view.all",
        "overview": "student.view.all",
        "history": "student.view.all",
        "create": "student.create",
        "update": "student.update",
        "partial_update": "student.update",
        "destroy": "student.delete",
        "change_status": "student.promote",
        "promote": "student.promote",
        "export": "student.export",
        "create_login": "user.manage",
    }
    filterset_fields = ["status", "class_level", "section", "academic_year", "gender"]
    search_fields = [
        "first_name", "middle_name", "last_name", "admission_number",
        "registration_number", "roll_number", "phone", "email",
    ]
    ordering_fields = ["first_name", "last_name", "admission_number", "roll_number", "created_at"]

    def get_serializer_class(self):
        return StudentListSerializer if self.action == "list" else StudentSerializer

    @transaction.atomic
    def perform_create(self, serializer):
        extra = {}
        if not serializer.validated_data.get("registration_number"):
            extra["registration_number"] = next_document_number(self._require_org(), "REG")
        super().perform_create(serializer, **extra)

    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        if instance.user_id:
            # A removed student must not keep portal access.
            instance.user.is_active = False
            instance.user.save(update_fields=["is_active"])

    # --- read views -------------------------------------------------------

    @action(detail=True, methods=["get"])
    def overview(self, request, pk=None):
        """Everything the student details page needs in one call. Finance and
        unpublished results are included only for users allowed to see them."""
        student = self.get_object()
        perms = user_permission_codes(request.user)
        history = student.history.select_related(
            "created_by", "from_class_level", "to_class_level", "from_section",
            "to_section", "from_academic_year", "to_academic_year",
        )[:20]
        return Response({
            "student": StudentSerializer(student, context={"request": request}).data,
            "attendance": services.attendance_summary(student),
            "fees": services.fees_summary(student) if "fee.view" in perms else None,
            "results": services.exam_results(student, published_only="exam.view" not in perms),
            "history": StudentHistorySerializer(history, many=True).data,
        })

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        student = self.get_object()
        qs = student.history.select_related(
            "created_by", "from_class_level", "to_class_level", "from_section",
            "to_section", "from_academic_year", "to_academic_year",
        )
        page = self.paginate_queryset(qs)
        return self.get_paginated_response(StudentHistorySerializer(page, many=True).data)

    @action(detail=False, methods=["get"])
    def export(self, request):
        """CSV of the current (filtered/searched) student list."""
        qs = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type="text/csv")
        stamp = timezone.localdate().isoformat()
        response["Content-Disposition"] = f'attachment; filename="students-{stamp}.csv"'
        writer = csv.writer(response)
        writer.writerow([label for label, _ in EXPORT_COLUMNS])
        count = 0
        for student in qs.iterator(chunk_size=500):  # prefetches run per chunk
            writer.writerow([_csv_safe(_resolve(student, path)) for _, path in EXPORT_COLUMNS])
            count += 1
        record_audit(
            action="student.export", actor=request.user, request=request,
            organization=request.user.organization, changes={"rows": count},
        )
        return response

    # --- lifecycle --------------------------------------------------------

    @action(detail=True, methods=["post"], url_path="change-status")
    @transaction.atomic
    def change_status(self, request, pk=None):
        student = self.get_object()
        serializer = StatusChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if data["status"] == student.status:
            raise ValidationError({"status": "Student already has this status."})
        StudentHistory.objects.create(
            organization_id=student.organization_id, school_id=student.school_id,
            student=student, kind=StudentHistory.Kind.STATUS_CHANGE,
            effective_date=data.get("effective_date") or timezone.localdate(),
            reason=data["reason"], from_status=student.status, to_status=data["status"],
            created_by=request.user, updated_by=request.user,
        )
        old = student.status
        student.status = data["status"]
        student.updated_by = request.user
        student.save(update_fields=["status", "updated_by", "updated_at"])
        record_audit(
            action="student.status_change", actor=request.user, instance=student,
            request=request, organization=request.user.organization,
            changes={"status": [old, student.status], "reason": data["reason"]},
        )
        return Response(StudentSerializer(student, context={"request": request}).data)

    @action(detail=False, methods=["post"])
    @transaction.atomic
    def promote(self, request):
        """Move a batch of students to a new academic year / class / section.

        Roll numbers are cleared because they're unique per class-section-year
        and must be reassigned in the new class.
        """
        serializer = PromoteSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        effective = data.get("effective_date") or timezone.localdate()
        history = []
        for student in data["students"]:
            history.append(StudentHistory(
                organization_id=student.organization_id, school_id=student.school_id,
                student=student, kind=StudentHistory.Kind.PROMOTION,
                effective_date=effective, reason=data["reason"],
                from_academic_year_id=student.academic_year_id,
                to_academic_year=data["to_academic_year"],
                from_class_level_id=student.class_level_id, to_class_level=data["to_class_level"],
                from_section_id=student.section_id, to_section=data["to_section"],
                created_by=request.user, updated_by=request.user,
            ))
            student.academic_year = data["to_academic_year"]
            student.class_level = data["to_class_level"]
            student.section = data["to_section"]
            student.roll_number = ""
            student.updated_by = request.user
        Student.objects.bulk_update(
            data["students"],
            ["academic_year", "class_level", "section", "roll_number", "updated_by", "updated_at"],
        )
        StudentHistory.objects.bulk_create(history)
        record_audit(
            action="student.promote", actor=request.user, request=request,
            organization=request.user.organization,
            changes={
                "count": len(history),
                "to_academic_year": str(data["to_academic_year"].id),
                "to_class_level": str(data["to_class_level"].id),
            },
        )
        return Response({"promoted": len(history)})

    @action(detail=True, methods=["post"], url_path="create-login")
    @transaction.atomic
    def create_login(self, request, pk=None):
        """Provision a portal login for this student and assign the Student role."""
        student = self.get_object()
        if student.user_id:
            raise ValidationError("Student already has a login.")
        user, password = provision_login(
            email=request.data.get("email") or student.email,
            full_name=student.full_name, organization_id=student.organization_id,
            role_name="Student", password=request.data.get("password"),
        )
        student.user = user
        student.updated_by = request.user
        student.save(update_fields=["user", "updated_by", "updated_at"])
        record_audit(
            action="student.create_login", actor=request.user, instance=student,
            request=request, organization=request.user.organization,
        )
        return Response({
            "user_id": str(user.id), "email": user.email, "temporary_password": password,
        })
