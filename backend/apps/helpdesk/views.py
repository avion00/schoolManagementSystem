import datetime

from django.db import transaction
from django.db.models import Avg, Count, DurationField, ExpressionWrapper, F
from django.http import Http404
from django.utils import timezone
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.models import User
from apps.communications.models import Notification
from apps.communications.services import notify
from apps.core.sequences import next_document_number
from apps.messaging.serializers import ChatUserSerializer
from apps.rbac.services import user_has_permission

from .models import Ticket, TicketEvent, TicketMessage
from .serializers import (
    ReplySerializer,
    TicketCreateSerializer,
    TicketEventSerializer,
    TicketMessageSerializer,
    TicketSerializer,
)

S = Ticket.Status
OPEN_STATUSES = (S.NEW, S.OPEN, S.IN_PROGRESS, S.WAITING_USER, S.WAITING_DEPARTMENT, S.ESCALATED)
REOPEN_DAYS = 7


def is_agent(user):
    return bool(user.is_superuser or user_has_permission(user, "helpdesk.manage"))


def log(ticket, actor, action, detail=""):
    TicketEvent.objects.create(ticket=ticket, actor=actor, action=action, detail=detail[:255])


class TicketViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin,
                    viewsets.GenericViewSet):
    """Agents (helpdesk.manage) see every ticket; everyone else sees their own."""

    permission_classes = [IsAuthenticated]
    serializer_class = TicketSerializer
    filterset_fields = ["status", "priority", "category", "department", "assignee", "source"]
    search_fields = ["code", "subject", "description", "requester__full_name", "requester__email"]
    ordering_fields = ["created_at", "due_at", "priority"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Ticket.objects.none()
        user = self.request.user
        qs = Ticket.objects.filter(organization_id=user.organization_id).select_related(
            "requester", "assignee", "related_student").prefetch_related("attachments")
        if not is_agent(user):
            qs = qs.filter(requester=user)
        if self.request.query_params.get("open") in ("1", "true"):
            qs = qs.filter(status__in=OPEN_STATUSES)
        if self.request.query_params.get("mine") in ("1", "true"):
            qs = qs.filter(assignee=user)
        return qs

    def get_serializer_class(self):
        return TicketCreateSerializer if self.action == "create" else TicketSerializer

    def _agent(self):
        if not is_agent(self.request.user):
            raise PermissionDenied("Only help desk staff can do this.")

    @transaction.atomic
    def perform_create(self, serializer):
        user = self.request.user
        if user.organization_id is None:
            raise ValidationError("Your account isn't attached to a school.")
        student = None
        student_id = serializer.validated_data.pop("related_student", None)
        if student_id:
            from apps.students.models import Student

            student = Student.objects.filter(pk=student_id, organization_id=user.organization_id).first()
            if student is None:
                raise ValidationError({"related_student": "Student not found."})
        source = serializer.validated_data.get("source", Ticket.Source.WEB)
        if not is_agent(user):
            source = Ticket.Source.WEB  # only agents log phone/walk-in tickets
        requester = user
        if is_agent(user) and self.request.data.get("requester"):
            # Staff logging a phone/walk-in request on someone's behalf.
            requester = User.objects.filter(pk=self.request.data["requester"], organization_id=user.organization_id,
                                            is_active=True).first()
            if requester is None:
                raise ValidationError({"requester": "User not found."})
        ticket = Ticket(organization_id=user.organization_id, requester=requester, related_student=student)
        ticket.priority = serializer.validated_data.get("priority", Ticket.Priority.NORMAL)
        ticket.set_sla()
        ticket = serializer.save(
            organization_id=user.organization_id, requester=requester, related_student=student, source=source,
            due_at=ticket.due_at, code=next_document_number(user.organization_id, "TKT"),
            created_by=user, updated_by=user,
        )
        log(ticket, user, "created", ticket.get_priority_display())

    def retrieve(self, request, *args, **kwargs):
        ticket = self.get_object()
        messages = ticket.messages.select_related("author").prefetch_related("attachments")
        if not is_agent(request.user):
            messages = messages.filter(is_internal=False)
        return Response({
            **TicketSerializer(ticket, context={"request": request}).data,
            "messages": TicketMessageSerializer(messages, many=True).data,
            "events": TicketEventSerializer(ticket.events.select_related("actor"), many=True).data,
        })

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def reply(self, request, pk=None):
        ticket = self.get_object()
        agent = is_agent(request.user)
        data = ReplySerializer(data=request.data, context={"request": request})
        data.is_valid(raise_exception=True)
        v = data.validated_data
        if v["is_internal"] and not agent:
            raise PermissionDenied("Only staff can add internal notes.")
        if ticket.status == S.CLOSED:
            raise ValidationError("This ticket is closed.")
        msg = TicketMessage.objects.create(ticket=ticket, author=request.user, body=v["body"],
                                           is_internal=v["is_internal"])
        msg.attachments.set(v.get("attachment_ids", []))
        fields = ["updated_at"]
        if agent and not v["is_internal"]:
            if ticket.first_response_at is None:
                ticket.first_response_at = msg.created_at
                fields.append("first_response_at")
            ticket.status = v.get("status") or (S.IN_PROGRESS if ticket.status == S.NEW else ticket.status)
            fields.append("status")
            notify([ticket.requester], title=f"Reply on {ticket.code}", body=v["body"][:280],
                   category=Notification.Category.SYSTEM, related=ticket, action_url=f"/help/tickets/{ticket.pk}")
        elif not agent:
            if ticket.status in (S.WAITING_USER, S.RESOLVED):
                ticket.status = S.OPEN
                fields.append("status")
            if ticket.assignee_id:
                notify([ticket.assignee], title=f"New reply on {ticket.code}", body=v["body"][:280],
                       category=Notification.Category.SYSTEM, related=ticket)
        ticket.save(update_fields=fields)
        log(ticket, request.user, "internal_note" if v["is_internal"] else "replied")
        return Response(TicketMessageSerializer(msg).data, status=201)

    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        self._agent()
        ticket = self.get_object()
        assignee = User.objects.filter(pk=request.data.get("user"), organization_id=ticket.organization_id,
                                       is_active=True).first()
        if assignee is None or not is_agent(assignee):
            raise ValidationError({"user": "Assign to an active help desk member."})
        ticket.assignee = assignee
        if ticket.status == S.NEW:
            ticket.status = S.OPEN
        ticket.save(update_fields=["assignee", "status", "updated_at"])
        log(ticket, request.user, "assigned", assignee.full_name or assignee.email)
        notify([assignee], title=f"Ticket assigned: {ticket.code}", body=ticket.subject,
               category=Notification.Category.SYSTEM, related=ticket)
        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=["post"], url_path="set-status")
    def set_status(self, request, pk=None):
        """Agents move a ticket: {status, note?} (resolve/close have their own actions)."""
        self._agent()
        ticket = self.get_object()
        status = request.data.get("status")
        allowed = {S.OPEN, S.IN_PROGRESS, S.WAITING_USER, S.WAITING_DEPARTMENT, S.ESCALATED}
        if status not in allowed:
            raise ValidationError({"status": f"Use one of {sorted(allowed)}; resolve/close have their own actions."})
        if ticket.status == S.CLOSED:
            raise ValidationError("This ticket is closed.")
        if "priority" in request.data and request.data["priority"] in Ticket.Priority.values:
            ticket.priority = request.data["priority"]
            if ticket.first_response_at is None:
                ticket.set_sla(ticket.created_at)  # SLA follows the new priority
        ticket.status = status
        ticket.save(update_fields=["status", "priority", "due_at", "updated_at"])
        log(ticket, request.user, f"status:{status}", str(request.data.get("note", "")))
        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        self._agent()
        ticket = self.get_object()
        if ticket.status in (S.RESOLVED, S.CLOSED):
            raise ValidationError("Already resolved.")
        ticket.status, ticket.resolved_at = S.RESOLVED, timezone.now()
        ticket.resolution_note = str(request.data.get("note", ""))[:2000]
        ticket.first_response_at = ticket.first_response_at or ticket.resolved_at
        ticket.save()
        log(ticket, request.user, "resolved", ticket.resolution_note)
        notify([ticket.requester], title=f"Resolved: {ticket.code}", body=ticket.resolution_note[:280],
               category=Notification.Category.SYSTEM, type=Notification.Type.SUCCESS, related=ticket)
        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        ticket = self.get_object()
        if not (is_agent(request.user) or ticket.requester_id == request.user.pk):
            raise PermissionDenied()
        ticket.status, ticket.closed_at = S.CLOSED, timezone.now()
        ticket.save(update_fields=["status", "closed_at", "updated_at"])
        log(ticket, request.user, "closed")
        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=["post"])
    def reopen(self, request, pk=None):
        ticket = self.get_object()
        if ticket.status not in (S.RESOLVED, S.CLOSED):
            raise ValidationError("Only resolved or closed tickets can be reopened.")
        ended = ticket.resolved_at or ticket.closed_at
        if not is_agent(request.user) and ended and timezone.now() - ended > datetime.timedelta(days=REOPEN_DAYS):
            raise ValidationError(f"Tickets can be reopened within {REOPEN_DAYS} days; please open a new one.")
        ticket.status, ticket.resolved_at, ticket.closed_at = S.OPEN, None, None
        ticket.save(update_fields=["status", "resolved_at", "closed_at", "updated_at"])
        log(ticket, request.user, "reopened", str(request.data.get("reason", "")))
        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=["post"])
    def rate(self, request, pk=None):
        ticket = self.get_object()
        if ticket.requester_id != request.user.pk:
            raise PermissionDenied("Only the requester can rate.")
        if ticket.status not in (S.RESOLVED, S.CLOSED):
            raise ValidationError("Rate after the ticket is resolved.")
        try:
            rating = int(request.data.get("rating"))
        except (TypeError, ValueError):
            rating = 0
        if not 1 <= rating <= 5:
            raise ValidationError({"rating": "1 to 5."})
        ticket.rating = rating
        ticket.save(update_fields=["rating", "updated_at"])
        return Response({"rating": rating})

    @action(detail=False, methods=["get"])
    def agents(self, request):
        """Help desk staff tickets can be assigned to."""
        self._agent()
        users = [u for u in User.objects.filter(organization_id=request.user.organization_id, is_active=True)
                 .order_by("full_name") if is_agent(u)]
        return Response(ChatUserSerializer(users, many=True).data)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        self._agent()
        qs = Ticket.objects.filter(organization_id=request.user.organization_id)
        open_qs = qs.filter(status__in=OPEN_STATUSES)
        now = timezone.now()
        response_time = qs.filter(first_response_at__isnull=False).annotate(
            rt=ExpressionWrapper(F("first_response_at") - F("created_at"), output_field=DurationField())
        ).aggregate(avg=Avg("rt"))["avg"]
        responded = qs.filter(first_response_at__isnull=False)
        return Response({
            "open": open_qs.count(),
            "unassigned": open_qs.filter(assignee__isnull=True).count(),
            "overdue": open_qs.filter(first_response_at__isnull=True, due_at__lt=now).count(),
            "by_status": dict(qs.values_list("status").annotate(n=Count("id"))),
            "by_priority": dict(open_qs.values_list("priority").annotate(n=Count("id"))),
            "avg_first_response_hours": round(response_time.total_seconds() / 3600, 1) if response_time else None,
            "sla_met_pct": round(responded.filter(first_response_at__lte=F("due_at")).count()
                                 / responded.count() * 100, 1) if responded.exists() else None,
            "avg_rating": qs.aggregate(r=Avg("rating"))["r"],
        })

    def get_object(self):
        obj = self.get_queryset().filter(pk=self.kwargs["pk"]).first()
        if obj is None:
            raise Http404
        return obj
