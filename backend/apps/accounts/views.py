from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.audit.services import record_audit

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
    throttle_scope = "auth"

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request,
            username=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        if user is None or not user.is_active:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        refresh = RefreshToken.for_user(user)
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
                RefreshToken(raw).blacklist()
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

    def get(self, request):
        return Response(UserSerializer(request.user).data)
