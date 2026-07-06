"""Production settings — security hardening per school.md §18."""
from .base import *  # noqa: F401,F403

DEBUG = False

# Fail loudly if the secret/hosts are not configured in production.
SECRET_KEY = env("DJANGO_SECRET_KEY")  # noqa: F405
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")  # noqa: F405

SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False  # JS must read CSRF token

SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "same-origin"
X_FRAME_OPTIONS = "DENY"

# JWT cookies must be secure in production.
AUTH_COOKIE_SECURE = True
AUTH_COOKIE_SAMESITE = env("AUTH_COOKIE_SAMESITE", default="Lax")  # noqa: F405
