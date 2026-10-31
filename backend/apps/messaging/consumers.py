"""Realtime messaging socket: ws(s)://<host>/ws/messaging/

Authenticated by the same HttpOnly JWT cookie as the REST API. The server
pushes events (message.created / updated / deleted, conversation.read,
typing); clients send messages through REST and only send `typing` here.
"""
import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.core.serializers.json import DjangoJSONEncoder

from .services import user_group


class MessagingConsumer(AsyncJsonWebsocketConsumer):
    @classmethod
    async def encode_json(cls, content):
        # Payloads come from DRF serializers: UUIDs, datetimes, decimals.
        return json.dumps(content, cls=DjangoJSONEncoder)

    async def connect(self):
        user = self.scope.get("user")
        if user is None or not user.is_authenticated:
            await self.close(code=4401)
            return
        self.group = user_group(user.pk)
        await self.channel_layer.group_add(self.group, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, "group"):
            await self.channel_layer.group_discard(self.group, self.channel_name)

    async def receive_json(self, content, **kwargs):
        if content.get("action") == "typing" and content.get("conversation"):
            members = await self._members_if_allowed(content["conversation"])
            for uid in members:
                if uid != self.scope["user"].pk:
                    await self.channel_layer.group_send(user_group(uid), {
                        "type": "chat.event", "event": "typing",
                        "payload": {"conversation": content["conversation"], "user": str(self.scope["user"].pk)},
                    })

    async def chat_event(self, event):
        await self.send_json({"event": event["event"], "payload": event["payload"]})

    @database_sync_to_async
    def _members_if_allowed(self, conversation_id):
        from .models import Conversation
        from .services import member_ids, membership

        conv = Conversation.objects.filter(pk=conversation_id).first()
        if conv is None or membership(conv, self.scope["user"]) is None:
            return []
        return member_ids(conv)
