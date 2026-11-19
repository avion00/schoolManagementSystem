"""Self-service account endpoints: profile, password, password reset, sessions."""
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.http import Http404
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.audit.services import record_audit

from . import sessions
from .models import User, UserSession


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["full_name", "phone", "timezone", "language"]


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(trim_whitespace=False)
    new_password = serializers.CharField(trim_whitespace=False)
    sign_out_other_sessions = serializers.BooleanField(default=True)


class ResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(trim_whitespace=False)


class SessionSerializer(serializers.ModelSerializer):
    is_current = serializers.SerializerMethodField()

    class Meta:
        model = UserSession
        fields = ["id", "user_agent", "ip_address", "created_at", "last_used_at", "is_current"]

    def get_is_current(self, obj) -> bool:
        return str(obj.pk) == self.context.get("current_sid")


def _current_sid(request):
    token = getattr(request, "auth", None)
    return str(token.get("sid")) if token is not None and token.get("sid") else None


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        data = ChangePasswordSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        v = data.validated_data
        user = request.user
        if not user.check_password(v["current_password"]):
            raise ValidationError({"current_password": "That's not your current password."})
        if v["current_password"] == v["new_password"]:
            raise ValidationError({"new_password": "Choose a different password."})
        sessions.set_password(user, v["new_password"])
        revoked = sessions.revoke_sessions(user, keep=_current_sid(request)) if v["sign_out_other_sessions"] else 0
        record_audit(action="auth.password_changed", actor=user, instance=user, request=request,
                     organization=user.organization, changes={"other_sessions_revoked": revoked})
        return Response({"detail": "Password changed.", "other_sessions_revoked": revoked})


class PasswordResetRequestView(APIView):
    """Always answers the same way, so it can't be used to discover accounts."""

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"
    serializer_class = ResetRequestSerializer

    def post(self, request):
        data = ResetRequestSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=data.validated_data["email"], is_active=True).first()
        if user is not None:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
            send_mail(
                "Reset your password",
                f"Use this link to choose a new password (valid for a limited time):\n\n{link}\n\n"
                "If you didn't ask for this, you can ignore this email.",
                settings.DEFAULT_FROM_EMAIL, [user.email],
            )
            record_audit(action="auth.password_reset_requested", actor=None, instance=user, request=request,
                         organization=user.organization)
        return Response({"detail": "If that email has an account, a reset link is on its way."})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"
    serializer_class = ResetConfirmSerializer

    def post(self, request):
        data = ResetConfirmSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        v = data.validated_data
        try:
            user = User.objects.get(pk=force_str(urlsafe_base64_decode(v["uid"])), is_active=True)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError, UnicodeDecodeError):
            user = None
        if user is None or not default_token_generator.check_token(user, v["token"]):
            raise ValidationError({"token": "This reset link is invalid or has expired."})
        sessions.set_password(user, v["new_password"])  # also invalidates the token (hash changes)
        sessions.revoke_sessions(user)
        sessions.record_successful_login(user)  # clears any lockout
        record_audit(action="auth.password_reset", actor=user, instance=user, request=request,
                     organization=user.organization)
        return Response({"detail": "Password updated. Please sign in."})


class SessionListView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SessionSerializer

    def get(self, request):
        qs = UserSession.objects.filter(user=request.user, revoked_at__isnull=True)
        return Response(SessionSerializer(qs, many=True, context={"current_sid": _current_sid(request)}).data)


class SessionRevokeView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SessionSerializer

    def delete(self, request, pk):
        updated = UserSession.objects.filter(pk=pk, user=request.user, revoked_at__isnull=True).update(
            revoked_at=timezone.now())
        if not updated:
            raise Http404
        record_audit(action="auth.session_revoked", actor=request.user, request=request,
                     organization=request.user.organization, changes={"session": str(pk)})
        return Response(status=204)


class SessionRevokeOthersView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SessionSerializer

    def post(self, request):
        n = sessions.revoke_sessions(request.user, keep=_current_sid(request))
        return Response({"revoked": n})
