from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication

from .sessions import active_session


class CookieJWTAuthentication(JWTAuthentication):
    """Reads the JWT access token from an HttpOnly cookie.

    Falls back to the Authorization header (useful for API clients / Swagger).
    """

    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            raw_token = request.COOKIES.get(settings.AUTH_COOKIE_ACCESS)
        else:
            raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None
        validated_token = self.get_validated_token(raw_token)
        session = active_session(validated_token)
        if not session:
            raise AuthenticationFailed("This session was signed out.", code="session_revoked")
        return self.get_user(validated_token), validated_token
