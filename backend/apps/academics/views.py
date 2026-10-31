import datetime
import uuid

from django.db.models import Count, IntegerField, OuterRef, Q, Subquery, Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from apps.core.viewsets import TenantModelViewSet

from .models import AcademicYear, ClassLevel, ClassSubject, Section, Subject, SyllabusUnit
from .serializers import (
    AcademicYearSerializer,
    ClassLevelSerializer,
    ClassSubjectSerializer,
    SectionSerializer,
    SubjectSerializer,
    SyllabusUnitSerializer,
)

_VIEW = {
    "list": "academics.view",
    "retrieve": "academics.view",
    "overview": "academics.view",
    "create": "academics.manage",
    "update": "academics.manage",
    "partial_update": "academics.manage",
    "destroy": "academics.manage",
}
PRESENT_LIKE = ("present", "late", "half_day")


def _subquery_count(qs, outer_field):
    """Correlated COUNT(*) — avoids the row multiplication of multiple joins."""
    sub = (
        qs.filter(**{outer_field: OuterRef("pk")}).order_by()
        .values(outer_field).annotate(c=Count("pk")).values("c")
    )
    return Coalesce(Subquery(sub, output_field=IntegerField()), 0)


def _guard_in_use(checks):
    for qs, message in checks:
        if qs.exists():
            raise ValidationError(message)


def _year_for(request):
    """?academic_year=<id> if given, else the organization's current year."""
    org_id = request.user.organization_id
    year_id = request.query_params.get("academic_year")
    qs = AcademicYear.objects.filter(organization_id=org_id)
    if year_id:
        try:
            return qs.filter(pk=uuid.UUID(year_id)).first()
        except ValueError:
            raise ValidationError({"academic_year": "Must be a valid id."})
    return qs.filter(is_current=True).first()


def _active_students():
    from apps.students.models import Student

    return Student.objects.filter(status=Student.Status.ACTIVE)


def _section_queryset():
    from apps.teachers.models import TeacherAssignment

    students = _active_students()
    class_teacher = TeacherAssignment.objects.filter(
        section=OuterRef("pk"), is_class_teacher=True, academic_year__is_current=True,
    ).values("teacher__full_name")[:1]
    return Section.objects.select_related("class_level").annotate(
        students_count=_subquery_count(students, "section"),
        male_count=_subquery_count(students.filter(gender="male"), "section"),
        female_count=_subquery_count(students.filter(gender="female"), "section"),
        class_teacher_name=Subquery(class_teacher),
    )


class AcademicYearViewSet(TenantModelViewSet):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer
    permission_required = _VIEW
    audit_label = "academic_year"
    filterset_fields = ["school", "is_current"]
    search_fields = ["name"]

    def perform_destroy(self, instance):
        _guard_in_use([
            (instance.students.all(), "Students are enrolled in this academic year."),
            (instance.exams.all(), "Exams exist for this academic year."),
            (instance.fee_structures.all(), "Fee structures exist for this academic year."),
        ])
        super().perform_destroy(instance)


class ClassLevelViewSet(TenantModelViewSet):
    serializer_class = ClassLevelSerializer
    permission_required = _VIEW
    audit_label = "class_level"
    filterset_fields = ["school", "status", "medium", "shift"]
    search_fields = ["name", "code"]
    ordering_fields = ["order", "name"]

    def get_queryset(self):
        capacity = (
            Section.objects.filter(class_level=OuterRef("pk")).order_by()
            .values("class_level").annotate(t=Sum("capacity")).values("t")
        )
        self.queryset = ClassLevel.objects.annotate(
            sections_count=_subquery_count(Section.objects.all(), "class_level"),
            students_count=_subquery_count(_active_students(), "class_level"),
            total_capacity=Subquery(capacity, output_field=IntegerField()),
        )
        return super().get_queryset()

    def perform_destroy(self, instance):
        _guard_in_use([
            (instance.students.all(), "This class has students."),
            (instance.sections.all(), "Delete this class's sections first."),
        ])
        super().perform_destroy(instance)

    @action(detail=True, methods=["get"])
    def overview(self, request, pk=None):
        """Class details page: sections, curriculum with teachers, attendance."""
        from apps.attendance.models import Attendance
        from apps.teachers.models import TeacherAssignment

        class_level = self.get_object()
        year = _year_for(request)
        sections = _section_queryset().filter(class_level=class_level)

        curriculum = ClassSubject.objects.filter(class_level=class_level, academic_year=year).select_related("subject")
        teachers = {}
        for a in TeacherAssignment.objects.filter(
            class_level=class_level, academic_year=year, subject__isnull=False
        ).select_related("teacher", "section"):
            teachers.setdefault(a.subject_id, []).append({
                "teacher": str(a.teacher_id), "name": a.teacher.full_name,
                "section_name": a.section.name if a.section_id else None,
            })

        since = timezone.localdate() - datetime.timedelta(days=29)
        att = Attendance.objects.filter(student__class_level=class_level, date__gte=since)
        total = att.count()
        present = att.filter(status__in=PRESENT_LIKE).count()

        students = _active_students().filter(class_level=class_level)
        return Response({
            "class_level": ClassLevelSerializer(self.get_queryset().get(pk=class_level.pk)).data,
            "academic_year": AcademicYearSerializer(year).data if year else None,
            "sections": SectionSerializer(sections, many=True).data,
            "subjects": [
                {**ClassSubjectSerializer(cs).data, "teachers": teachers.get(cs.subject_id, [])}
                for cs in curriculum
            ],
            "totals": {
                "students": students.count(),
                "male": students.filter(gender="male").count(),
                "female": students.filter(gender="female").count(),
                "capacity": sum(s.capacity or 0 for s in sections) or None,
                "attendance_rate_30d": round(present / total * 100, 1) if total else None,
            },
        })


class SectionViewSet(TenantModelViewSet):
    serializer_class = SectionSerializer
    permission_required = _VIEW
    audit_label = "section"
    filterset_fields = ["class_level"]
    search_fields = ["name", "code", "room"]

    def get_queryset(self):
        self.queryset = _section_queryset()
        return super().get_queryset()

    def perform_destroy(self, instance):
        _guard_in_use([(instance.students.all(), "This section has students.")])
        super().perform_destroy(instance)


class SubjectViewSet(TenantModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_required = _VIEW
    audit_label = "subject"
    filterset_fields = ["school", "type", "category", "status", "department"]
    search_fields = ["name", "code", "department"]

    def perform_destroy(self, instance):
        _guard_in_use([
            (instance.exam_subjects.all(), "This subject is used in exams."),
            (instance.teacher_assignments.all(), "Teachers are assigned to this subject."),
        ])
        super().perform_destroy(instance)

    @action(detail=True, methods=["get"])
    def overview(self, request, pk=None):
        """Subject details page: class mapping, teachers, syllabus, performance."""
        from apps.exams.models import Mark
        from apps.teachers.models import TeacherAssignment

        subject = self.get_object()
        year = _year_for(request)
        students = _active_students().filter(academic_year=year)

        classes = []
        for cs in ClassSubject.objects.filter(subject=subject, academic_year=year).select_related("class_level"):
            classes.append({
                **ClassSubjectSerializer(cs).data,
                "students": students.filter(class_level=cs.class_level).count(),
            })

        teachers = {}
        for a in TeacherAssignment.objects.filter(subject=subject, academic_year=year).select_related(
            "teacher", "class_level", "section"
        ):
            t = teachers.setdefault(a.teacher_id, {
                "teacher": str(a.teacher_id), "name": a.teacher.full_name,
                "employee_id": a.teacher.employee_id, "department": a.teacher.department,
                "email": a.teacher.email, "phone": a.teacher.phone, "classes": [],
            })
            label = a.class_level.name + (f" - {a.section.name}" if a.section_id else "")
            t["classes"].append(label)

        units = SyllabusUnit.objects.filter(subject=subject).select_related("class_level")
        done = sum(1 for u in units if u.status == SyllabusUnit.Status.COMPLETED)

        marks = Mark.objects.filter(
            exam_subject__subject=subject, exam_subject__exam__is_published=True,
            is_absent=False, marks_obtained__isnull=False,
        ).select_related("exam_subject")
        pcts, passed = [], 0
        for m in marks:
            pcts.append(float(m.marks_obtained / m.exam_subject.full_marks * 100))
            passed += m.marks_obtained >= m.exam_subject.pass_marks
        return Response({
            "subject": SubjectSerializer(subject).data,
            "academic_year": AcademicYearSerializer(year).data if year else None,
            "classes": classes,
            "teachers": list(teachers.values()),
            "syllabus": {
                "units": SyllabusUnitSerializer(units, many=True).data,
                "completion_pct": round(done / len(units) * 100, 1) if units else None,
            },
            "performance": {
                "results": len(pcts),
                "average_pct": round(sum(pcts) / len(pcts), 1) if pcts else None,
                "pass_rate_pct": round(passed / len(pcts) * 100, 1) if pcts else None,
                "highest_pct": round(max(pcts), 1) if pcts else None,
                "lowest_pct": round(min(pcts), 1) if pcts else None,
            },
        })


class ClassSubjectViewSet(TenantModelViewSet):
    queryset = ClassSubject.objects.select_related("class_level", "subject", "academic_year")
    serializer_class = ClassSubjectSerializer
    permission_required = _VIEW
    audit_label = "class_subject"
    filterset_fields = ["academic_year", "class_level", "subject", "is_optional"]


class SyllabusUnitViewSet(TenantModelViewSet):
    queryset = SyllabusUnit.objects.select_related("subject", "class_level")
    serializer_class = SyllabusUnitSerializer
    audit_label = "syllabus_unit"
    filterset_fields = ["subject", "class_level", "status"]
    search_fields = ["title"]
    # Teachers report syllabus progress, so updates need only academics.view
    # plus being a teacher of the subject (checked in perform_update).
    permission_required = {**_VIEW, "update": "academics.view", "partial_update": "academics.view"}

    def perform_update(self, serializer):
        from apps.rbac.services import user_has_permission
        from apps.teachers.models import TeacherAssignment
        from apps.teachers.services import get_teacher

        user = self.request.user
        if not (user.is_superuser or user.is_platform_admin or user_has_permission(user, "academics.manage")):
            unit = serializer.instance
            teacher = get_teacher(user)
            teaches = teacher and TeacherAssignment.objects.filter(
                Q(class_level=unit.class_level) if unit.class_level_id else Q(),
                teacher=teacher, subject=unit.subject,
            ).exists()
            if not teaches or set(serializer.validated_data) - {"status"}:
                raise ValidationError("Teachers may only update the status of units they teach.")
        super().perform_update(serializer)
