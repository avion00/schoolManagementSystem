"""Root URL configuration."""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)


def health(_request):
    return JsonResponse({"status": "ok"})


api_v1 = [
    path("auth/", include("apps.accounts.urls")),
    path("", include("apps.accounts.admin_urls")),
    path("rbac/", include("apps.rbac.urls")),
    path("audit/", include("apps.audit.urls")),
    path("", include("apps.reports.urls")),
    path("me/", include("apps.portal.urls")),
    path("academics/", include("apps.academics.urls")),
    path("", include("apps.guardians.urls")),
    path("", include("apps.students.urls")),
    path("", include("apps.teachers.urls")),
    path("", include("apps.attendance.urls")),
    path("exams/", include("apps.exams.urls")),
    path("fees/", include("apps.fees.urls")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health, name="health"),
    # OpenAPI schema + docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
    # Versioned API
    path("api/v1/", include((api_v1, "v1"))),
]
