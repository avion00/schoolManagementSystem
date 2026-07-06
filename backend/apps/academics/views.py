from apps.core.viewsets import TenantModelViewSet

from .models import AcademicYear, ClassLevel, Section, Subject
from .serializers import (
    AcademicYearSerializer,
    ClassLevelSerializer,
    SectionSerializer,
    SubjectSerializer,
)

_VIEW = {
    "list": "academics.view",
    "retrieve": "academics.view",
    "create": "academics.manage",
    "update": "academics.manage",
    "partial_update": "academics.manage",
    "destroy": "academics.manage",
}


class AcademicYearViewSet(TenantModelViewSet):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer
    permission_required = _VIEW
    audit_label = "academic_year"
    filterset_fields = ["school", "is_current"]
    search_fields = ["name"]


class ClassLevelViewSet(TenantModelViewSet):
    queryset = ClassLevel.objects.all()
    serializer_class = ClassLevelSerializer
    permission_required = _VIEW
    audit_label = "class_level"
    filterset_fields = ["school"]
    search_fields = ["name"]


class SectionViewSet(TenantModelViewSet):
    queryset = Section.objects.select_related("class_level").all()
    serializer_class = SectionSerializer
    permission_required = _VIEW
    audit_label = "section"
    filterset_fields = ["class_level"]
    search_fields = ["name"]


class SubjectViewSet(TenantModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_required = _VIEW
    audit_label = "subject"
    filterset_fields = ["school"]
    search_fields = ["name", "code"]
