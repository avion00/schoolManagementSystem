"""ASGI entrypoint: HTTP via Django, WebSockets via Channels (messaging)."""
import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")

django_asgi_app = get_asgi_application()  # must load before importing app code

from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402
from channels.security.websocket import AllowedHostsOriginValidator  # noqa: E402

from apps.messaging.auth import JWTCookieAuthMiddleware  # noqa: E402
from apps.messaging.routing import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(JWTCookieAuthMiddleware(URLRouter(websocket_urlpatterns))),
})
