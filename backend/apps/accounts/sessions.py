"""Signed-in sessions, login lockout and password policy."""
import datetime

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.context import get_client_ip

from .models import UserSession


def _security(user):
    from apps.orgsettings.services import get_setting

    return {k: get_setting(user.organization_id, "security", k)
            for k in ("max_login_attempts", "lockout_duration_mins", "min_password_length")}


def is_locked(user):
    return user.locked_until is not None and user.locked_until > timezone.now()


def record_failed_login(user):
    """Count a bad password; lock the account once the school's limit is hit."""
    policy = _security(user)
    user.failed_login_count += 1
    if user.failed_login_count >= policy["max_login_attempts"]:
        user.locked_until = timezone.now() + datetime.timedelta(minutes=policy["lockout_duration_mins"])
        user.failed_login_count = 0
    user.save(update_fields=["failed_login_count", "locked_until"])


def record_successful_login(user):
    if user.failed_login_count or user.locked_until:
        user.failed_login_count, user.locked_until = 0, None
        user.save(update_fields=["failed_login_count", "locked_until"])


def start_session(user, request):
    """Create a session and return a refresh token carrying its id (`sid`)."""
    session = UserSession.objects.create(
        user=user, user_agent=request.META.get("HTTP_USER_AGENT", "")[:300], ip_address=get_client_ip(request),
    )
    refresh = RefreshToken.for_user(user)
    refresh["sid"] = str(session.pk)
    return session, refresh


def active_session(token):
    """The live session named by a token's `sid`, or None (revoked / unknown).
    Tokens issued before sessions existed carry no sid and are accepted."""
    sid = token.get("sid")
    if sid is None:
        return True
    return UserSession.objects.filter(pk=sid, revoked_at__isnull=True).first()


def revoke_sessions(user, *, keep=None):
    qs = UserSession.objects.filter(user=user, revoked_at__isnull=True)
    if keep is not None:
        qs = qs.exclude(pk=keep)
    return qs.update(revoked_at=timezone.now())


def check_new_password(user, password):
    policy = _security(user)
    errors = []
    if len(password) < policy["min_password_length"]:
        errors.append(f"Use at least {policy['min_password_length']} characters.")
    try:
        validate_password(password, user)
    except DjangoValidationError as exc:
        errors.extend(exc.messages)
    if errors:
        raise ValidationError({"new_password": errors})


def set_password(user, password):
    check_new_password(user, password)
    user.set_password(password)
    user.must_change_password = False
    user.password_changed_at = timezone.now()
    user.save(update_fields=["password", "must_change_password", "password_changed_at"])
