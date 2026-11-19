from rest_framework.routers import SimpleRouter

from .views import AttendanceViewSet, HolidayViewSet

app_name = "attendance"

router = SimpleRouter()
router.register("attendance", AttendanceViewSet, basename="attendance")
router.register("holidays", HolidayViewSet, basename="holiday")

urlpatterns = router.urls
