from rest_framework.routers import SimpleRouter

from .views import AttendanceViewSet

app_name = "attendance"

router = SimpleRouter()
router.register("attendance", AttendanceViewSet, basename="attendance")

urlpatterns = router.urls
