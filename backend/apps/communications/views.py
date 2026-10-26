from django.db import transaction
from django.db.models import OuterRef, Subquery
from django.utils import timezone
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.audit.services import record_audit
from apps.core.pagination import DefaultPagination
from apps.core.sequences import next_document_number
from apps.core.viewsets import TenantModelViewSet

from . import services
from .models import Notice, NoticeReceipt, Notification
from .serializers import MyNoticeSerializer, NoticeSerializer, NotificationSerializer

_MANAGE = {
    "list": "notice.manage",
    "retrieve": "notice.manage",
    "recipients": "notice.manage",
    "create": "notice.manage",
    "update": "notice.manage",
    "partial_update": "notice.manage",
    "destroy": "notice.manage",
    "publish": "notice.publish",
    "archive": "notice.publish",
}


class NoticeViewSet(TenantModelViewSet):
    """Staff-side notice management. Readers use /me/notices/."""

    queryset = Notice.objects.select_related("published_by", "created_by").prefetch_related(
        "target_class_levels", "target_sections"
    )
    serializer_class = NoticeSerializer
    audit_label = "notice"
    permission_required = _MANAGE
    filterset_fields = ["status", "category", "priority", "audience", "pinned"]
    search_fields = ["title", "summary", "code"]
    ordering_fields = ["publish_at", "created_at", "priority"]

    @transaction.atomic
    def perform_create(self, serializer):
        super().perform_create(serializer, code=next_document_number(self._require_org(), "NTC"))

    def perform_destroy(self, instance):
        if instance.status != Notice.Status.DRAFT:
            raise ValidationError("Only drafts can be deleted; archive published notices.")
        super().perform_destroy(instance)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        """Publish now, or schedule if publish_at is in the future."""
        notice = self.get_object()
        if notice.status in (Notice.Status.PUBLISHED, Notice.Status.ARCHIVED):
            raise ValidationError(f"Notice is already {notice.status}.")
        now = timezone.now()
        scheduled = notice.publish_at is not None and notice.publish_at > now
        notice.status = Notice.Status.SCHEDULED if scheduled else Notice.Status.PUBLISHED
        notice.publish_at = notice.publish_at or now
        notice.published_by = request.user
        notice.updated_by = request.user
        notice.save(update_fields=["status", "publish_at", "published_by", "updated_by", "updated_at"])
        sent = 0 if scheduled else services.notify_notice(notice)
        record_audit(action=f"notice.{notice.status}", actor=request.user, instance=notice,
                     request=request, organization=request.user.organization,
                     changes={"notified": sent})
        return Response({**NoticeSerializer(notice).data, "notified": sent})

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        notice = self.get_object()
        notice.status = Notice.Status.ARCHIVED
        notice.updated_by = request.user
        notice.save(update_fields=["status", "updated_by", "updated_at"])
        record_audit(action="notice.archive", actor=request.user, instance=notice,
                     request=request, organization=request.user.organization)
        return Response(NoticeSerializer(notice).data)

    @action(detail=True, methods=["get"])
    def recipients(self, request, pk=None):
        """Audience with read / acknowledged state, plus totals."""
        notice = self.get_object()
        receipts = NoticeReceipt.objects.filter(notice=notice, user=OuterRef("pk"))
        users = services.audience_users(notice).annotate(
            read_at=Subquery(receipts.values("read_at")[:1]),
            acknowledged_at=Subquery(receipts.values("acknowledged_at")[:1]),
        ).order_by("full_name", "email")
        total = users.count()
        read = NoticeReceipt.objects.filter(notice=notice, user__in=users).count()
        acked = NoticeReceipt.objects.filter(notice=notice, user__in=users, acknowledged_at__isnull=False).count()
        paginator = DefaultPagination()
        page = paginator.paginate_queryset(users, request, view=self)
        response = paginator.get_paginated_response([
            {"user": str(u.id), "name": u.full_name or u.email, "email": u.email,
             "read_at": u.read_at, "acknowledged_at": u.acknowledged_at}
            for u in page
        ])
        response.data["stats"] = {"total": total, "read": read, "unread": total - read, "acknowledged": acked}
        return response


class MyNoticeViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Notices the current user may read, with their own read/ack state."""

    serializer_class = MyNoticeSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["category", "priority", "pinned"]
    search_fields = ["title", "summary"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Notice.objects.none()
        user = self.request.user
        mine = NoticeReceipt.objects.filter(notice=OuterRef("pk"), user=user)
        qs = services.visible_notices(user).select_related("published_by").annotate(
            read_at=Subquery(mine.values("read_at")[:1]),
            acknowledged_at=Subquery(mine.values("acknowledged_at")[:1]),
        )
        unread = self.request.query_params.get("unread")
        if unread in ("1", "true"):
            qs = qs.filter(read_at__isnull=True)
        return qs.order_by("-pinned", "-publish_at")

    def retrieve(self, request, *args, **kwargs):
        notice = self.get_object()
        NoticeReceipt.objects.get_or_create(notice=notice, user=request.user)  # opening = reading
        return Response(self.get_serializer(self.get_queryset().get(pk=notice.pk)).data)

    @action(detail=True, methods=["post"])
    def acknowledge(self, request, pk=None):
        notice = self.get_object()
        receipt, _ = NoticeReceipt.objects.get_or_create(notice=notice, user=request.user)
        if receipt.acknowledged_at is None:
            receipt.acknowledged_at = timezone.now()
            receipt.save(update_fields=["acknowledged_at", "updated_at"])
        return Response({"acknowledged_at": receipt.acknowledged_at})


class NotificationViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """The current user's notifications. ?status=unread|read|archived (default: not archived)."""

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["category", "type", "priority"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Notification.objects.none()
        qs = Notification.objects.filter(user=self.request.user)
        status = self.request.query_params.get("status")
        if status == "archived":
            return qs.filter(archived_at__isnull=False)
        qs = qs.filter(archived_at__isnull=True)
        if status == "unread":
            qs = qs.filter(read_at__isnull=True)
        elif status == "read":
            qs = qs.filter(read_at__isnull=False)
        return qs

    def _mine(self, pk):
        n = Notification.objects.filter(user=self.request.user, pk=pk).first()
        if n is None:
            from django.http import Http404
            raise Http404
        return n

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        n = Notification.objects.filter(user=request.user, read_at__isnull=True, archived_at__isnull=True).count()
        return Response({"unread": n})

    @action(detail=True, methods=["post"])
    def read(self, request, pk=None):
        n = self._mine(pk)
        if n.read_at is None:
            n.read_at = timezone.now()
            n.save(update_fields=["read_at", "updated_at"])
        return Response(NotificationSerializer(n).data)

    @action(detail=False, methods=["post"], url_path="read-all")
    def read_all(self, request):
        n = Notification.objects.filter(user=request.user, read_at__isnull=True).update(read_at=timezone.now())
        return Response({"marked": n})

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        n = self._mine(pk)
        n.archived_at = n.archived_at or timezone.now()
        n.read_at = n.read_at or n.archived_at
        n.save(update_fields=["archived_at", "read_at", "updated_at"])
        return Response(NotificationSerializer(n).data)
