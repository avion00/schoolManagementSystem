"""Root URL configuration."""
from django.contrib import admin
from django.core.cache import cache
from django.db import connection
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)


def health(_request):
    """Liveness: the process is up."""
    return JsonResponse({"status": "ok"})


def ready(_request):
    """Readiness: the database and cache answer."""
    checks = {}
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        checks["database"] = "ok"
    except Exception:  # noqa: BLE001
        checks["database"] = "error"
    try:
        cache.set("readiness-probe", "1", 5)
        checks["cache"] = "ok" if cache.get("readiness-probe") == "1" else "error"
    except Exception:  # noqa: BLE001
        checks["cache"] = "error"
    ok = all(v == "ok" for v in checks.values())
    return JsonResponse({"status": "ok" if ok else "error", **checks}, status=200 if ok else 503)


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
    path("timetable/", include("apps.timetable.urls")),
    path("", include("apps.communications.urls")),
    path("messaging/", include("apps.messaging.urls")),
    path("files/", include("apps.files.urls")),
    path("lms/", include("apps.lms.urls")),
    path("finance/", include("apps.finance.urls")),
    path("helpdesk/", include("apps.helpdesk.urls")),
    path("settings/", include("apps.orgsettings.urls")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health, name="health"),
    path("ready/", ready, name="ready"),
    # OpenAPI schema + docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
    # Versioned API
    path("api/v1/", include((api_v1, "v1"))),
]
