from django.db import transaction
from django.db.models import Prefetch, Q
from django.http import Http404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status as http
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.models import User
from apps.audit.services import record_audit
from apps.core.pagination import DefaultPagination

from . import policy, services
from .models import Conversation, Message, MessageRequest, ModerationReport, Participant, Reaction
from .serializers import (
    BroadcastSerializer,
    ChatUserSerializer,
    ConversationSerializer,
    CreateGroupSerializer,
    MessageRequestSerializer,
    MessageSerializer,
    ModerationReportSerializer,
    SendMessageSerializer,
    StartDirectSerializer,
)

MEMBERS = Prefetch(
    "participants", queryset=Participant.objects.filter(left_at__isnull=True).select_related("user")
)


def _audit(request, action, conv=None, **changes):
    record_audit(action=f"message.{action}", actor=request.user, request=request,
                 organization=request.user.organization, instance=conv, changes=changes)


def _org_user(request, user_id):
    user = User.objects.filter(pk=user_id, organization_id=request.user.organization_id, is_active=True).first()
    if user is None:
        raise ValidationError({"user": "User not found."})
    return user


class ConversationViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Conversation.objects.none()  # schema only: lets OpenAPI type the UUID path id

    # --- access ------------------------------------------------------------

    def _get(self, request, pk, *, admin_view=False):
        """A conversation the user belongs to; staff with message.view_all may
        open any conversation in their organization (always audited)."""
        conv = Conversation.objects.filter(pk=pk, organization_id=request.user.organization_id).first()
        if conv is None:
            raise Http404
        if services.membership(conv, request.user):
            return conv
        if admin_view and policy.can(request.user, "message.view_all"):
            _audit(request, "admin_opened_conversation", conv)
            return conv
        raise Http404

    def _serialize(self, request, qs):
        return ConversationSerializer(qs, many=True, context={"request": request}).data

    # --- listing & creation -------------------------------------------------

    @extend_schema(operation_id="messaging_conversations_list")
    def list(self, request):
        """My conversations (?archived=1 for the archive), pinned first."""
        archived = request.query_params.get("archived") in ("1", "true")
        qs = services.conversations_for(request.user, archived=archived).prefetch_related(MEMBERS)
        kind = request.query_params.get("type")
        if kind:
            qs = qs.filter(type=kind)
        if request.query_params.get("unread") in ("1", "true"):
            qs = qs.filter(unread__gt=0)
        qs = qs.order_by("-my_pinned", "-last_message_at", "-created_at")
        paginator = DefaultPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        return paginator.get_paginated_response(self._serialize(request, page))

    def retrieve(self, request, pk=None):
        conv = self._get(request, pk, admin_view=True)
        qs = services.conversations_for(request.user).filter(pk=conv.pk).prefetch_related(MEMBERS)
        obj = qs.first() or Conversation.objects.prefetch_related(MEMBERS).get(pk=conv.pk)
        return Response(ConversationSerializer(obj, context={"request": request}).data)

    @action(detail=False, methods=["get"], url_path="all")
    def all_conversations(self, request):
        """Every conversation in the organization (message.view_all)."""
        if not policy.can(request.user, "message.view_all"):
            raise PermissionDenied()
        qs = Conversation.objects.filter(organization_id=request.user.organization_id).prefetch_related(MEMBERS)
        paginator = DefaultPagination()
        page = paginator.paginate_queryset(qs.order_by("-last_message_at"), request, view=self)
        return paginator.get_paginated_response(self._serialize(request, page))

    @action(detail=False, methods=["post"])
    def direct(self, request):
        """Open (or reuse) a direct chat. If policy needs the recipient's
        approval, a message request is created instead (202)."""
        data = StartDirectSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        other = _org_user(request, data.validated_data["user"])
        rule = policy.contact_rule(request.user, other)
        if rule == policy.DENIED:
            raise PermissionDenied("You can't message this person.")
        if rule == policy.REQUEST:
            existing = MessageRequest.objects.filter(
                from_user=request.user, to_user=other, status=MessageRequest.Status.PENDING
            ).first()
            if MessageRequest.objects.filter(from_user=request.user, to_user=other,
                                             status=MessageRequest.Status.BLOCKED).exists():
                raise PermissionDenied("This person isn't accepting your messages.")
            req = existing or MessageRequest.objects.create(
                organization_id=request.user.organization_id, from_user=request.user, to_user=other,
                reason=data.validated_data.get("reason") or data.validated_data.get("message") or "",
            )
            return Response({"request": MessageRequestSerializer(req).data}, status=http.HTTP_202_ACCEPTED)
        kind = Conversation.Type.PARENT_TEACHER if {
            policy.chat_role(request.user), policy.chat_role(other)} == {policy.PARENT, policy.TEACHER} \
            else Conversation.Type.DIRECT
        conv, created = services.get_or_create_direct(request.user.organization_id, request.user, other, type=kind)
        if data.validated_data.get("message"):
            services.send_message(conv, request.user, data.validated_data["message"])
        return self.retrieve(request, pk=conv.pk) if not created else Response(
            ConversationSerializer(
                services.conversations_for(request.user).prefetch_related(MEMBERS).get(pk=conv.pk),
                context={"request": request},
            ).data, status=http.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"])
    def group(self, request):
        if not policy.can_create_groups(request.user):
            raise PermissionDenied("You can't create groups.")
        data = CreateGroupSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        ids = set(data.validated_data["members"]) - {request.user.pk}
        members = list(User.objects.filter(pk__in=ids, organization_id=request.user.organization_id, is_active=True))
        if len(members) != len(ids):
            raise ValidationError({"members": "Some members weren't found in your organization."})
        blocked = [m.email for m in members if policy.contact_rule(request.user, m) == policy.DENIED]
        if blocked:
            raise ValidationError({"members": f"You can't message: {', '.join(blocked)}"})
        conv = services.create_group(
            request.user.organization_id, request.user, data.validated_data["title"], members,
            type=data.validated_data["type"], permissions=data.validated_data.get("permissions"),
        )
        _audit(request, "group_created", conv, members=len(members))
        return Response(
            ConversationSerializer(services.conversations_for(request.user).prefetch_related(MEMBERS).get(pk=conv.pk),
                                   context={"request": request}).data,
            status=http.HTTP_201_CREATED,
        )

    def partial_update(self, request, pk=None):
        """Rename a group or change its permissions (group admins)."""
        conv = self._get(request, pk)
        me = services.membership(conv, request.user)
        if conv.type == Conversation.Type.DIRECT or not me.is_admin:
            raise PermissionDenied("Only group admins can change the group.")
        if "title" in request.data:
            conv.title = str(request.data["title"])[:150]
        if "permissions" in request.data:
            perms = CreateGroupSerializer(data={"title": "x", "members": [request.user.pk],
                                                "permissions": request.data["permissions"]})
            perms.is_valid(raise_exception=True)
            conv.permissions = {**(conv.permissions or {}), **perms.validated_data["permissions"]}
        conv.save(update_fields=["title", "permissions", "updated_at"])
        return self.retrieve(request, pk=pk)

    # --- messages -------------------------------------------------------------

    @action(detail=True, methods=["get", "post"])
    def messages(self, request, pk=None):
        conv = self._get(request, pk, admin_view=request.method == "GET")
        if request.method == "POST":
            data = SendMessageSerializer(data=request.data, context={"request": request})
            data.is_valid(raise_exception=True)
            reply = None
            if data.validated_data.get("reply_to"):
                reply = Message.objects.filter(pk=data.validated_data["reply_to"]).first()
            msg = services.send_message(conv, request.user, data.validated_data["body"], reply_to=reply,
                                        attachments=data.validated_data.get("attachment_ids") or [])
            return Response(MessageSerializer(msg).data, status=http.HTTP_201_CREATED)
        qs = conv.messages.select_related("sender").prefetch_related("reactions", "attachments").order_by("-created_at")
        before = request.query_params.get("before")
        if before:
            qs = qs.filter(created_at__lt=before)
        page = list(qs[: min(int(request.query_params.get("limit", 50)), 200)])
        marks = dict(Participant.objects.filter(conversation=conv, left_at__isnull=True)
                     .values_list("user_id", "last_read_at"))
        return Response({
            "results": MessageSerializer(list(reversed(page)), many=True, context={"read_marks": marks}).data,
            "has_more": qs.filter(created_at__lt=page[-1].created_at).exists() if page else False,
        })

    @action(detail=True, methods=["post"])
    def read(self, request, pk=None):
        conv = self._get(request, pk)
        me = services.mark_read(conv, request.user)
        return Response({"last_read_at": me.last_read_at})

    @action(detail=True, methods=["patch"])
    def preferences(self, request, pk=None):
        conv = self._get(request, pk)
        me = services.membership(conv, request.user)
        for field in ("pinned", "muted", "archived"):
            if field in request.data:
                setattr(me, field, bool(request.data[field]))
        me.save(update_fields=["pinned", "muted", "archived", "updated_at"])
        return Response({"pinned": me.pinned, "muted": me.muted, "archived": me.archived})

    @action(detail=True, methods=["post", "delete"])
    def members(self, request, pk=None):
        """POST {users: [...]} to add, DELETE {user} to remove (group admins / per settings)."""
        conv = self._get(request, pk)
        me = services.membership(conv, request.user)
        if conv.type in (Conversation.Type.DIRECT, Conversation.Type.PARENT_TEACHER):
            raise ValidationError("Direct chats don't have members to manage.")
        if request.method == "POST":
            if not (me.is_admin or conv.perm("who_can_add_members") == "everyone"):
                raise PermissionDenied("Only group admins can add members.")
            ids = request.data.get("users") or []
            users = list(User.objects.filter(pk__in=ids, organization_id=conv.organization_id, is_active=True))
            for u in users:
                if policy.contact_rule(request.user, u) == policy.DENIED:
                    raise ValidationError({"users": f"You can't add {u.email}."})
                Participant.objects.update_or_create(conversation=conv, user=u, defaults={"left_at": None})
            services.system_message(conv, f"{request.user.full_name or request.user.email} added "
                                          f"{', '.join(u.full_name or u.email for u in users)}")
            return Response({"added": len(users)})
        if not me.is_admin:
            raise PermissionDenied("Only group admins can remove members.")
        target = Participant.objects.filter(conversation=conv, user_id=request.data.get("user"),
                                            left_at__isnull=True).select_related("user").first()
        if target is None:
            raise ValidationError({"user": "Not a member."})
        target.left_at = timezone.now()
        target.save(update_fields=["left_at", "updated_at"])
        services.system_message(conv, f"{target.user.full_name or target.user.email} was removed")
        _audit(request, "member_removed", conv, user=str(target.user_id))
        return Response(status=http.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def leave(self, request, pk=None):
        conv = self._get(request, pk)
        me = services.membership(conv, request.user)
        me.left_at = timezone.now()
        me.save(update_fields=["left_at", "updated_at"])
        if conv.type != Conversation.Type.DIRECT:
            services.system_message(conv, f"{request.user.full_name or request.user.email} left")
        return Response(status=http.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def lock(self, request, pk=None):
        return self._set_lock(request, pk, True)

    @action(detail=True, methods=["post"])
    def unlock(self, request, pk=None):
        return self._set_lock(request, pk, False)

    def _set_lock(self, request, pk, value):
        if not policy.can(request.user, "message.moderate"):
            raise PermissionDenied()
        conv = self._get(request, pk, admin_view=True)
        conv.is_locked = value
        conv.save(update_fields=["is_locked", "updated_at"])
        _audit(request, "conversation_locked" if value else "conversation_unlocked", conv)
        return Response({"is_locked": conv.is_locked})

    @action(detail=True, methods=["get"])
    def export(self, request, pk=None):
        """Full transcript including deleted messages (message.export; audited)."""
        if not policy.can(request.user, "message.export"):
            raise PermissionDenied()
        conv = self._get(request, pk, admin_view=True)
        _audit(request, "exported", conv)
        msgs = conv.messages.select_related("sender", "deleted_by").order_by("created_at")
        return Response({
            "conversation": {"id": str(conv.id), "type": conv.type, "title": conv.title},
            "members": [ChatUserSerializer(p.user).data for p in conv.participants.select_related("user")],
            "messages": [
                {"id": str(m.id), "sender": m.sender.email if m.sender_id else "system", "body": m.body,
                 "created_at": m.created_at, "edited_at": m.edited_at, "deleted_at": m.deleted_at,
                 "deleted_by": m.deleted_by.email if m.deleted_by_id else None}
                for m in msgs
            ],
        })

    # --- contacts & counters ------------------------------------------------

    @action(detail=False, methods=["get"])
    def contacts(self, request):
        """People I can message (?search=), with whether it needs a request."""
        term = request.query_params.get("search", "").strip()
        qs = User.objects.filter(organization_id=request.user.organization_id, is_active=True).exclude(
            pk=request.user.pk)
        if term:
            qs = qs.filter(Q(full_name__icontains=term) | Q(email__icontains=term))
        out = []
        for u in qs.order_by("full_name")[:50]:
            rule = policy.contact_rule(request.user, u)
            if rule != policy.DENIED:
                out.append({**ChatUserSerializer(u).data, "access": rule})
        return Response(out)

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        return Response({"unread": services.total_unread(request.user)})


class MessageViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Message.objects.none()  # schema only: lets OpenAPI type the UUID path id

    def _get(self, request, pk):
        msg = Message.objects.select_related("conversation").filter(
            pk=pk, conversation__organization_id=request.user.organization_id
        ).first()
        if msg is None or not (services.membership(msg.conversation, request.user)
                               or policy.can(request.user, "message.moderate")):
            raise Http404
        return msg

    def partial_update(self, request, pk=None):
        msg = services.edit_message(self._get(request, pk), request.user, str(request.data.get("body", "")))
        return Response(MessageSerializer(msg).data)

    def destroy(self, request, pk=None):
        msg = self._get(request, pk)
        moderator = msg.sender_id != request.user.pk and policy.can(request.user, "message.moderate")
        services.delete_message(msg, request.user, as_moderator=moderator)
        if moderator:
            _audit(request, "message_deleted_by_admin", msg.conversation, message=str(msg.pk))
        return Response(status=http.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def react(self, request, pk=None):
        """Toggle an emoji reaction."""
        msg = self._get(request, pk)
        emoji = str(request.data.get("emoji", ""))[:16]
        if not emoji or msg.deleted_at:
            raise ValidationError({"emoji": "Pick an emoji."})
        existing = Reaction.objects.filter(message=msg, user=request.user, emoji=emoji)
        if existing.exists():
            existing.delete()
        else:
            Reaction.objects.create(message=msg, user=request.user, emoji=emoji)
        data = MessageSerializer(Message.objects.prefetch_related("reactions").get(pk=msg.pk)).data
        services.push(services.member_ids(msg.conversation), "message.updated",
                      {"id": data["id"], "reactions": data["reactions"]})
        return Response(data)

    @action(detail=True, methods=["post"])
    def pin(self, request, pk=None):
        msg = self._get(request, pk)
        me = services.membership(msg.conversation, request.user)
        if msg.conversation.type != Conversation.Type.DIRECT and not (me and me.is_admin):
            raise PermissionDenied("Only group admins can pin messages.")
        msg.is_pinned = not msg.is_pinned
        msg.save(update_fields=["is_pinned", "updated_at"])
        return Response({"is_pinned": msg.is_pinned})

    @action(detail=True, methods=["post"])
    def report(self, request, pk=None):
        msg = self._get(request, pk)
        if msg.sender_id == request.user.pk:
            raise ValidationError("You can't report your own message.")
        report, created = ModerationReport.objects.get_or_create(
            message=msg, reported_by=request.user,
            defaults={"organization_id": msg.conversation.organization_id,
                      "reason": str(request.data.get("reason", ""))[:500] or "Inappropriate",
                      "priority": request.data.get("priority", "normal")},
        )
        return Response(ModerationReportSerializer(report).data,
                        status=http.HTTP_201_CREATED if created else http.HTTP_200_OK)


class MessageRequestViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    queryset = MessageRequest.objects.none()  # schema only: lets OpenAPI type the UUID path id

    @extend_schema(operation_id="messaging_requests_list")
    def list(self, request):
        """?box=incoming (default) or outgoing."""
        box = request.query_params.get("box", "incoming")
        field = "from_user" if box == "outgoing" else "to_user"
        qs = MessageRequest.objects.filter(**{field: request.user}).select_related("from_user", "to_user")
        status = request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)
        return Response(MessageRequestSerializer(qs, many=True).data)

    def _decide(self, request, pk, status):
        req = MessageRequest.objects.filter(pk=pk, to_user=request.user).first()
        if req is None:
            raise Http404
        if req.status != MessageRequest.Status.PENDING:
            raise ValidationError("This request was already decided.")
        with transaction.atomic():
            req.status, req.decided_at = status, timezone.now()
            if status == MessageRequest.Status.APPROVED:
                conv, _ = services.get_or_create_direct(req.organization_id, req.from_user, req.to_user)
                req.conversation = conv
                if req.reason:
                    services.send_message(conv, req.from_user, req.reason)
            req.save()
        return Response(MessageRequestSerializer(req).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        return self._decide(request, pk, MessageRequest.Status.APPROVED)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        return self._decide(request, pk, MessageRequest.Status.REJECTED)

    @action(detail=True, methods=["post"])
    def block(self, request, pk=None):
        return self._decide(request, pk, MessageRequest.Status.BLOCKED)


class ModerationViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    queryset = ModerationReport.objects.none()  # schema only: lets OpenAPI type the UUID path id

    def _check(self, request):
        if not policy.can(request.user, "message.moderate"):
            raise PermissionDenied()

    @extend_schema(operation_id="messaging_moderation_reports_list")
    def list(self, request):
        self._check(request)
        qs = ModerationReport.objects.filter(organization_id=request.user.organization_id).select_related(
            "message", "message__sender", "reported_by")
        qs = qs.filter(status=request.query_params.get("status", "open"))
        return Response(ModerationReportSerializer(qs, many=True).data)

    def _resolve(self, request, pk, status):
        self._check(request)
        report = ModerationReport.objects.filter(pk=pk, organization_id=request.user.organization_id).first()
        if report is None:
            raise Http404
        if status == ModerationReport.Status.ACTIONED:
            services.delete_message(report.message, request.user, as_moderator=True)
        # One decision closes every open report about the same message.
        ModerationReport.objects.filter(message=report.message, status=ModerationReport.Status.OPEN).update(
            status=status, reviewed_by=request.user, reviewed_at=timezone.now(),
            resolution=str(request.data.get("resolution", ""))[:255],
        )
        _audit(request, "moderation_action", report.message.conversation, report=str(report.pk), status=status)
        report.refresh_from_db()
        return Response(ModerationReportSerializer(report).data)

    @action(detail=True, methods=["post"])
    def dismiss(self, request, pk=None):
        return self._resolve(request, pk, ModerationReport.Status.DISMISSED)

    @action(detail=True, methods=["post"], url_path="remove-message")
    def remove_message(self, request, pk=None):
        return self._resolve(request, pk, ModerationReport.Status.ACTIONED)


class BroadcastViewSet(viewsets.ViewSet):
    """One-to-many announcements as chat. Replies off by default."""

    permission_classes = [IsAuthenticated]
    queryset = Conversation.objects.none()  # schema only: lets OpenAPI type the UUID path id

    def _check(self, request):
        if not policy.can(request.user, "message.broadcast"):
            raise PermissionDenied()

    @extend_schema(operation_id="messaging_broadcasts_list")
    def list(self, request):
        self._check(request)
        rows = []
        for conv in Conversation.objects.filter(
            organization_id=request.user.organization_id, type=Conversation.Type.BROADCAST
        ).order_by("-created_at")[:100]:
            first = conv.messages.exclude(type=Message.Type.SYSTEM).order_by("created_at").first()
            members = Participant.objects.filter(conversation=conv).exclude(user=conv.created_by)
            read = members.filter(last_read_at__gte=first.created_at).count() if first else 0
            rows.append({"id": str(conv.id), "title": conv.title, "body": first.body if first else "",
                         "sent_at": conv.created_at, "audience_count": members.count(), "read": read,
                         "allow_replies": conv.perm("who_can_send") == "everyone"})
        return Response(rows)

    def create(self, request):
        from apps.communications.services import resolve_audience

        self._check(request)
        data = BroadcastSerializer(data=request.data, context={"request": request})
        data.is_valid(raise_exception=True)
        v = data.validated_data
        audience = resolve_audience(
            request.user.organization_id, v["audience"],
            [c.pk for c in v.get("class_levels", [])], [s.pk for s in v.get("sections", [])],
        ).exclude(pk=request.user.pk)
        with transaction.atomic():
            conv = services.create_group(
                request.user.organization_id, request.user, v["title"], list(audience),
                type=Conversation.Type.BROADCAST,
                permissions={"who_can_send": "everyone" if v["allow_replies"] else "admins"},
            )
            services.send_message(conv, request.user, v["body"])
        _audit(request, "broadcast_sent", conv, audience=v["audience"], recipients=audience.count())
        return Response({"id": str(conv.id), "recipients": audience.count()}, status=http.HTTP_201_CREATED)
