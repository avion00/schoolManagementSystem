from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from apps.accounts.models import User
from apps.audit.services import record_audit
from apps.communications.models import Notification
from apps.communications.services import guardian_users_of, notify
from apps.core.viewsets import TenantModelViewSet
from apps.rbac.services import user_has_permission
from apps.teachers.services import get_teacher

from . import services
from .models import Assignment, LessonPlan, Material, Submission
from .serializers import (
    AssignmentSerializer,
    GradeSerializer,
    LessonPlanSerializer,
    MaterialSerializer,
    SubmissionSerializer,
)

_MANAGE = {
    "list": "lms.manage", "retrieve": "lms.manage", "create": "lms.manage", "update": "lms.manage",
    "partial_update": "lms.manage", "destroy": "lms.manage",
}


class _TeachingScoped(TenantModelViewSet):
    """Teachers see and change only rows for classes/subjects they teach."""

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if getattr(self, "swagger_fake_view", False) or services.manages_all(user):
            return qs
        return qs.filter(services.teaching_q(user))

    def _check_can_teach(self, data, instance=None):
        def val(k):
            return data[k] if k in data else getattr(instance, k, None)

        if not services.can_teach(self.request.user, val("class_level"), val("section"), val("subject")):
            raise PermissionDenied("You don't teach this subject to this class.")

    def perform_create(self, serializer):
        self._check_can_teach(serializer.validated_data)
        super().perform_create(serializer, teacher=get_teacher(self.request.user))

    def perform_update(self, serializer):
        self._check_can_teach(serializer.validated_data, serializer.instance)
        super().perform_update(serializer)


class AssignmentViewSet(_TeachingScoped):
    queryset = Assignment.objects.select_related(
        "class_level", "section", "subject", "teacher"
    ).prefetch_related("attachments").annotate(
        submissions_count=Count("submissions", filter=Q(submissions__is_active=True), distinct=True),
        graded_count=Count("submissions", filter=Q(submissions__is_active=True,
                                                   submissions__status="graded"), distinct=True),
    )
    serializer_class = AssignmentSerializer
    audit_label = "assignment"
    permission_required = {**_MANAGE, "publish": "lms.manage", "close": "lms.manage",
                           "submissions": "lms.manage", "grade": "lms.manage"}
    filterset_fields = {"class_level": ["exact"], "section": ["exact"], "subject": ["exact"],
                        "status": ["exact"], "kind": ["exact"], "due_at": ["gte", "lte"]}
    search_fields = ["title"]

    def perform_destroy(self, instance):
        if instance.submissions.exists():
            raise ValidationError("Students have submitted work; close the assignment instead.")
        super().perform_destroy(instance)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        a = self.get_object()
        if a.status != Assignment.Status.DRAFT:
            raise ValidationError("Only drafts can be published.")
        a.status, a.published_at, a.updated_by = Assignment.Status.PUBLISHED, timezone.now(), request.user
        a.save(update_fields=["status", "published_at", "updated_by", "updated_at"])
        students = services.assignment_roster(a)
        recipients = list(User.objects.filter(student_profile__in=students, is_active=True)) + list(
            guardian_users_of(students))
        notify(recipients, title=f"New {a.get_kind_display().lower()}: {a.title}",
               body=f"{a.subject.name} · due {timezone.localtime(a.due_at):%d %b %H:%M}",
               category=Notification.Category.SYSTEM, type=Notification.Type.REMINDER,
               related=a, action_url=f"/student/assignments/{a.pk}")
        record_audit(action="assignment.publish", actor=request.user, instance=a, request=request,
                     organization=request.user.organization)
        return Response(AssignmentSerializer(self.get_queryset().get(pk=a.pk), context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        a = self.get_object()
        a.status, a.updated_by = Assignment.Status.CLOSED, request.user
        a.save(update_fields=["status", "updated_by", "updated_at"])
        return Response({"status": a.status})

    @action(detail=True, methods=["get"])
    def submissions(self, request, pk=None):
        """Every student in the class with their submission (or none yet)."""
        a = self.get_object()
        roster = services.assignment_roster(a)
        subs = {s.student_id: s for s in a.submissions.select_related("graded_by").prefetch_related("attachments")}
        return Response({
            "total": roster.count(), "submitted": len(subs),
            "rows": [
                {"student": str(st.id), "name": st.full_name, "roll_number": st.roll_number,
                 "status": services.student_status(a, subs.get(st.id)),
                 "submission": SubmissionSerializer(subs[st.id]).data if st.id in subs else None}
                for st in roster.order_by("roll_number", "first_name")
            ],
        })

    @extend_schema(parameters=[OpenApiParameter("submission_id", OpenApiTypes.UUID, OpenApiParameter.PATH)])
    @action(detail=True, methods=["post"], url_path=r"submissions/(?P<submission_id>[0-9a-f-]{36})/grade")
    def grade(self, request, pk=None, submission_id=None):
        a = self.get_object()
        sub = a.submissions.filter(pk=submission_id).first()
        if sub is None:
            raise ValidationError({"submission": "Not found."})
        data = GradeSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        v = data.validated_data
        marks = v.get("marks")
        if marks is not None and (marks < 0 or (a.max_marks is not None and marks > a.max_marks)):
            raise ValidationError({"marks": f"Marks must be between 0 and {a.max_marks}."})
        sub.marks, sub.feedback = marks, v.get("feedback", sub.feedback)
        sub.status = Submission.Status.RETURNED if v["return_for_changes"] else Submission.Status.GRADED
        sub.graded_by, sub.graded_at, sub.updated_by = request.user, timezone.now(), request.user
        sub.save()
        if sub.student.user_id:
            notify([sub.student.user], title=f"{'Returned' if v['return_for_changes'] else 'Graded'}: {a.title}",
                   body=sub.feedback[:280], category=Notification.Category.SYSTEM,
                   type=Notification.Type.INFO, related=a, action_url=f"/student/assignments/{a.pk}")
        return Response(SubmissionSerializer(sub).data)


class MaterialViewSet(_TeachingScoped):
    queryset = Material.objects.select_related("class_level", "section", "subject", "teacher", "file")
    serializer_class = MaterialSerializer
    audit_label = "material"
    permission_required = _MANAGE
    filterset_fields = ["class_level", "section", "subject", "type", "is_shared"]
    search_fields = ["title", "description"]


class LessonPlanViewSet(_TeachingScoped):
    queryset = LessonPlan.objects.select_related("teacher", "class_level", "subject", "reviewed_by")
    serializer_class = LessonPlanSerializer
    audit_label = "lesson_plan"
    permission_required = {**_MANAGE, "list": ("lms.manage", "lms.review"),
                           "retrieve": ("lms.manage", "lms.review"),
                           "submit": "lms.manage", "review": "lms.review"}
    filterset_fields = ["teacher", "class_level", "subject", "status", "week_start"]

    def get_queryset(self):
        if user_has_permission(self.request.user, "lms.review") or self.request.user.is_superuser:
            return TenantModelViewSet.get_queryset(self)
        return super().get_queryset()

    def perform_create(self, serializer):
        teacher = get_teacher(self.request.user)
        if teacher is None:
            raise PermissionDenied("Only teachers write lesson plans.")
        super().perform_create(serializer)

    def perform_destroy(self, instance):
        if instance.status != LessonPlan.Status.DRAFT:
            raise ValidationError("Only drafts can be deleted.")
        super().perform_destroy(instance)

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        plan = self.get_object()
        if plan.status not in (LessonPlan.Status.DRAFT, LessonPlan.Status.CHANGES_REQUESTED):
            raise ValidationError("Already submitted.")
        plan.status = LessonPlan.Status.SUBMITTED
        plan.save(update_fields=["status", "updated_at"])
        return Response(LessonPlanSerializer(plan).data)

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def review(self, request, pk=None):
        """{decision: approve|changes, note}"""
        plan = self.get_object()
        if plan.status != LessonPlan.Status.SUBMITTED:
            raise ValidationError("Only submitted plans can be reviewed.")
        decision = request.data.get("decision")
        if decision not in ("approve", "changes"):
            raise ValidationError({"decision": "Use 'approve' or 'changes'."})
        plan.status = LessonPlan.Status.APPROVED if decision == "approve" else LessonPlan.Status.CHANGES_REQUESTED
        plan.review_note = str(request.data.get("note", ""))[:2000]
        plan.reviewed_by, plan.reviewed_at = request.user, timezone.now()
        plan.save()
        if plan.teacher.user_id:
            notify([plan.teacher.user], title=f"Lesson plan {plan.get_status_display().lower()}: {plan.topic}",
                   body=plan.review_note, category=Notification.Category.APPROVALS,
                   type=Notification.Type.APPROVAL, related=plan)
        return Response(LessonPlanSerializer(plan).data)
