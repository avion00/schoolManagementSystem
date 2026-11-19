"""Channels middleware: authenticate WebSockets with the JWT access cookie."""
from http.cookies import SimpleCookie

from channels.db import database_sync_to_async
from django.conf import settings
from django.contrib.auth.models import AnonymousUser


@database_sync_to_async
def _user_from_token(raw):
    from rest_framework_simplejwt.exceptions import TokenError
    from rest_framework_simplejwt.tokens import AccessToken

    from apps.accounts.models import User

    try:
        token = AccessToken(raw)
    except TokenError:
        return AnonymousUser()
    user = User.objects.filter(pk=token.get("user_id"), is_active=True).first()
    return user or AnonymousUser()


class JWTCookieAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        cookies = SimpleCookie()
        for name, value in scope.get("headers", []):
            if name == b"cookie":
                cookies.load(value.decode())
        morsel = cookies.get(settings.AUTH_COOKIE_ACCESS)
        scope["user"] = await _user_from_token(morsel.value) if morsel else AnonymousUser()
        return await self.inner(scope, receive, send)
