from apps.core.viewsets import TenantModelViewSet

from .models import Teacher, TeacherAssignment
from .serializers import TeacherAssignmentSerializer, TeacherSerializer


class TeacherViewSet(TenantModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    audit_label = "teacher"
    permission_required = {
        "list": "teacher.view",
        "retrieve": "teacher.view",
        "create": "teacher.manage",
        "update": "teacher.manage",
        "partial_update": "teacher.manage",
        "destroy": "teacher.manage",
    }
    filterset_fields = ["status", "department"]
    search_fields = ["full_name", "employee_id", "email"]


class TeacherAssignmentViewSet(TenantModelViewSet):
    queryset = TeacherAssignment.objects.select_related(
        "teacher", "academic_year", "class_level", "section", "subject"
    ).all()
    serializer_class = TeacherAssignmentSerializer
    audit_label = "teacher_assignment"
    permission_required = {
        "list": "teacher.view",
        "retrieve": "teacher.view",
        "create": "teacher.manage",
        "update": "teacher.manage",
        "partial_update": "teacher.manage",
        "destroy": "teacher.manage",
    }
    filterset_fields = ["teacher", "academic_year", "class_level", "section", "subject", "is_class_teacher"]
