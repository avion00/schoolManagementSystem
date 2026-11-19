"""Production settings: everything sensitive comes from the environment.

See docs/DEPLOY.md and deploy/.env.example for the variables.
"""
from .base import *  # noqa: F401,F403
from .base import env

DEBUG = False

# Fail loudly if the secret/hosts are not configured in production.
SECRET_KEY = env("DJANGO_SECRET_KEY")
# localhost is for the container health check, which bypasses the proxy.
ALLOWED_HOSTS = [*env.list("ALLOWED_HOSTS"), "localhost"]
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS")
# The SPA is served from the same origin as the API, so no cross-origin access is needed.
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
FRONTEND_URL = env("FRONTEND_URL")

# TLS terminates at the reverse proxy (Caddy), which sets X-Forwarded-Proto.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
SECURE_REDIRECT_EXEMPT = [r"^health/$", r"^ready/$"]
USE_X_FORWARDED_HOST = True

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False  # JS must read CSRF token

SECURE_HSTS_SECONDS = env.int("SECURE_HSTS_SECONDS", default=31536000)
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "same-origin"
X_FRAME_OPTIONS = "DENY"

# JWT cookies must be secure in production.
AUTH_COOKIE_SECURE = True
AUTH_COOKIE_SAMESITE = env("AUTH_COOKIE_SAMESITE", default="Lax")

# PostgreSQL is required in production (SQLite is for development only).
DATABASES = {"default": env.db("DATABASE_URL")}
DATABASES["default"]["CONN_MAX_AGE"] = env.int("DB_CONN_MAX_AGE", default=60)
DATABASES["default"]["CONN_HEALTH_CHECKS"] = True

# Redis: shared cache (login throttling must count across workers) and Channels.
REDIS_URL = env("REDIS_URL")
CACHES = {"default": {"BACKEND": "django.core.cache.backends.redis.RedisCache", "LOCATION": REDIS_URL}}
CHANNEL_LAYERS = {
    "default": {"BACKEND": "channels_redis.core.RedisChannelLayer", "CONFIG": {"hosts": [REDIS_URL]}},
}

# Email (notification emails, password resets), e.g.
#   EMAIL_URL=smtp+tls://user:password@smtp.example.com:587
# Leave unset to log emails instead of sending them.
if env("EMAIL_URL", default=""):
    vars().update(env.email_url("EMAIL_URL"))
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL")
SERVER_EMAIL = DEFAULT_FROM_EMAIL
EMAIL_TIMEOUT = 20

TIME_ZONE = env("TIME_ZONE", default="UTC")

# Structured JSON logs on stdout (collected by Docker).
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {"json": {"()": "apps.core.logging.JsonFormatter"}},
    "handlers": {"stdout": {"class": "logging.StreamHandler", "formatter": "json"}},
    "root": {"handlers": ["stdout"], "level": env("LOG_LEVEL", default="INFO")},
    "loggers": {
        "django.request": {"level": "WARNING"},
        "django.security": {"level": "WARNING"},
        "daphne": {"level": "WARNING"},
    },
}

# Optional error tracking.
if env("SENTRY_DSN", default=""):
    import sentry_sdk

    sentry_sdk.init(
        dsn=env("SENTRY_DSN"), environment=env("SENTRY_ENVIRONMENT", default="production"),
        traces_sample_rate=env.float("SENTRY_TRACES_SAMPLE_RATE", default=0.0), send_default_pii=False,
    )
