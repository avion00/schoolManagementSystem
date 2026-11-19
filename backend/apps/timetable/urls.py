from rest_framework.routers import SimpleRouter

from .views import PeriodSlotViewSet, RoutineEntryViewSet

app_name = "timetable"

router = SimpleRouter()
router.register("periods", PeriodSlotViewSet, basename="period")
router.register("entries", RoutineEntryViewSet, basename="routine-entry")

urlpatterns = router.urls
