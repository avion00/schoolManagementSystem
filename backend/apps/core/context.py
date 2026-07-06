"""Thread-local request context.

Lets non-view code (e.g. audit logging) reach the current request for IP /
user-agent / actor without threading it through every call. Set and cleared by
RequestContextMiddleware.
"""
import threading

_local = threading.local()


def set_current_request(request):
    _local.request = request


def get_current_request():
    return getattr(_local, "request", None)


def clear_current_request():
    if hasattr(_local, "request"):
        del _local.request


def get_current_user():
    request = get_current_request()
    if request is None:
        return None
    user = getattr(request, "user", None)
    if user is not None and getattr(user, "is_authenticated", False):
        return user
    return None


def get_client_ip(request):
    if request is None:
        return None
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")
