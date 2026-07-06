import secrets

from rest_framework.decorators import action
from rest_framework.response import Response

from apps.audit.services import record_audit
from apps.core.viewsets import TenantModelViewSet

from .models import Student
from .serializers import StudentSerializer


class StudentViewSet(TenantModelViewSet):
    queryset = Student.objects.select_related(
        "academic_year", "class_level", "section", "primary_guardian", "user"
    ).all()
    serializer_class = StudentSerializer
    audit_label = "student"
    permission_required = {
        "list": "student.view.all",
        "retrieve": "student.view.all",
        "create": "student.create",
        "update": "student.update",
        "partial_update": "student.update",
        "destroy": "student.delete",
        "create_login": "user.manage",
    }
    filterset_fields = ["status", "class_level", "section", "academic_year", "gender"]
    search_fields = ["first_name", "middle_name", "last_name", "admission_number", "roll_number"]
    ordering_fields = ["first_name", "last_name", "admission_number", "created_at"]

    @action(detail=True, methods=["post"], url_path="create-login")
    def create_login(self, request, pk=None):
        """Provision a portal login for this student and assign the Student role."""
        from apps.accounts.models import User
        from apps.rbac.models import Role, UserRole

        student = self.get_object()
        if student.user_id:
            return Response({"detail": "Student already has a login."}, status=400)
        email = (request.data.get("email") or student.email or "").strip()
        if not email:
            return Response({"detail": "An email is required."}, status=400)
        if User.objects.filter(email=email).exists():
            return Response({"detail": "A user with this email already exists."}, status=400)

        temp = request.data.get("password") or secrets.token_urlsafe(9)
        user = User.objects.create(
            email=email, full_name=student.full_name,
            organization_id=student.organization_id, must_change_password=True,
        )
        user.set_password(temp)
        user.save()
        student.user = user
        student.updated_by = request.user
        student.save(update_fields=["user", "updated_by", "updated_at"])

        role = Role.objects.filter(
            organization_id=student.organization_id, name="Student"
        ).first()
        if role:
            UserRole.objects.get_or_create(user=user, role=role, school=None)

        record_audit(
            action="student.create_login", actor=request.user, instance=student,
            request=request, organization=request.user.organization,
        )
        return Response({
            "user_id": str(user.id), "email": email, "temporary_password": temp,
        })
