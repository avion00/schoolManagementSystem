"""OpenAPI schema customisation (drf-spectacular).

Plain APIViews in this project (portals, reports) return hand-built JSON. Rather
than leaving them out of the schema with an error, document them as free-form
JSON objects; views can still be precise with @extend_schema where it matters.
"""
from drf_spectacular.extensions import OpenApiAuthenticationExtension
from drf_spectacular.openapi import AutoSchema as BaseAutoSchema
from drf_spectacular.types import OpenApiTypes
from rest_framework.generics import GenericAPIView


class AutoSchema(BaseAutoSchema):
    def _is_plain_view(self):
        view = self.view
        return not isinstance(view, GenericAPIView) and not any(
            hasattr(view, attr) for attr in ("get_serializer", "get_serializer_class", "serializer_class")
        )

    def get_request_serializer(self):
        if self._is_plain_view():
            return OpenApiTypes.OBJECT if self.method in ("POST", "PUT", "PATCH") else None
        return super().get_request_serializer()

    def get_response_serializers(self):
        if self._is_plain_view():
            return OpenApiTypes.OBJECT
        return super().get_response_serializers()


class CookieJWTScheme(OpenApiAuthenticationExtension):
    """The SPA authenticates with an HttpOnly cookie. (Bearer tokens are
    documented by SimpleJWT's own `jwtAuth` extension.)"""

    target_class = "apps.accounts.authentication.CookieJWTAuthentication"
    name = "cookieAuth"

    def get_security_definition(self, auto_schema):
        return {"type": "apiKey", "in": "cookie", "name": "access_token"}
