from rest_framework.routers import SimpleRouter

from .views import GuardianViewSet, StudentGuardianViewSet

app_name = "guardians"

router = SimpleRouter()
router.register("guardians", GuardianViewSet, basename="guardian")
router.register("student-guardians", StudentGuardianViewSet, basename="student-guardian")

urlpatterns = router.urls
