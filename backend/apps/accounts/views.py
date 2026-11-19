from django.conf import settings
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.audit.services import record_audit
from apps.core.context import get_client_ip

from . import sessions
from .models import User, UserSession
from .serializers import LoginSerializer, UserSerializer


def _set_cookie(response, key, value, max_age):
    response.set_cookie(
        key, value,
        max_age=max_age,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        domain=settings.AUTH_COOKIE_DOMAIN,
        path=settings.AUTH_COOKIE_PATH,
    )


def _set_auth_cookies(response, access, refresh=None):
    _set_cookie(
        response, settings.AUTH_COOKIE_ACCESS, str(access),
        int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
    )
    if refresh is not None:
        _set_cookie(
            response, settings.AUTH_COOKIE_REFRESH, str(refresh),
            int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        )
    return response


class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    # Brute-force protection: per-IP limit from DEFAULT_THROTTLE_RATES["auth"].
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        candidate = User.objects.filter(email__iexact=email).first()
        if candidate is not None and sessions.is_locked(candidate):
            return Response(
                {"detail": "Too many failed attempts. Try again later.", "code": "account_locked"},
                status=status.HTTP_403_FORBIDDEN,
            )
        user = authenticate(request, username=email, password=serializer.validated_data["password"])
        if user is None or not user.is_active:
            if candidate is not None:
                sessions.record_failed_login(candidate)
                record_audit(action="auth.login_failed", actor=None, instance=candidate, request=request,
                             organization=candidate.organization)
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        sessions.record_successful_login(user)
        _, refresh = sessions.start_session(user, request)
        response = Response(UserSerializer(user).data)
        _set_auth_cookies(response, refresh.access_token, refresh)
        record_audit(
            action="auth.login", actor=user, request=request,
            organization=user.organization,
        )
        return response


class RefreshView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        raw = request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
        if not raw:
            return Response(
                {"detail": "No refresh token."}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            refresh = RefreshToken(raw)
            # A deactivated account must not keep minting access tokens.
            user_id = refresh.get(settings.SIMPLE_JWT.get("USER_ID_CLAIM", "user_id"))
            if not User.objects.filter(pk=user_id, is_active=True).exists():
                refresh.blacklist()
                raise TokenError("User is inactive.")
            session = sessions.active_session(refresh)
            if not session:
                raise TokenError("Session revoked.")
            if session is not True:
                session.last_used_at = timezone.now()
                session.ip_address = get_client_ip(request)
                session.save(update_fields=["last_used_at", "ip_address", "updated_at"])
            access = refresh.access_token
            new_refresh = None
            if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS"):
                if settings.SIMPLE_JWT.get("BLACKLIST_AFTER_ROTATION"):
                    try:
                        refresh.blacklist()
                    except AttributeError:
                        pass
                refresh.set_jti()
                refresh.set_exp()
                refresh.set_iat()
                new_refresh = refresh
        except TokenError:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        response = Response({"detail": "refreshed"})
        _set_auth_cookies(response, access, new_refresh)
        return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        raw = request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
        if raw:
            try:
                token = RefreshToken(raw)
                token.blacklist()
                if token.get("sid"):
                    UserSession.objects.filter(pk=token["sid"]).update(revoked_at=timezone.now())
            except (TokenError, AttributeError):
                pass
        response = Response({"detail": "logged out"})
        response.delete_cookie(
            settings.AUTH_COOKIE_ACCESS,
            path=settings.AUTH_COOKIE_PATH, domain=settings.AUTH_COOKIE_DOMAIN,
        )
        response.delete_cookie(
            settings.AUTH_COOKIE_REFRESH,
            path=settings.AUTH_COOKIE_PATH, domain=settings.AUTH_COOKIE_DOMAIN,
        )
        record_audit(
            action="auth.logout", actor=request.user, request=request,
            organization=getattr(request.user, "organization", None),
        )
        return response


class MeView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        from .account_views import ProfileUpdateSerializer

        data = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        data.is_valid(raise_exception=True)
        data.save()
        return Response(UserSerializer(request.user).data)
