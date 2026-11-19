"""Test settings — fast, isolated, deterministic."""
from .base import *  # noqa: F401,F403

DEBUG = False
SECRET_KEY = "test-only-secret-key-that-is-long-enough-for-hs256-signing"
ALLOWED_HOSTS = ["testserver", "localhost", "127.0.0.1"]

DATABASES = {
    "default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}
}

# Argon2 is deliberately slow; tests don't need that.
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

# Throttling makes tests order-dependent; auth throttling has its own test.
REST_FRAMEWORK = {**REST_FRAMEWORK, "DEFAULT_THROTTLE_CLASSES": ()}  # noqa: F405

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
