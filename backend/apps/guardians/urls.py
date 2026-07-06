from rest_framework.routers import SimpleRouter

from .views import GuardianViewSet

app_name = "guardians"

router = SimpleRouter()
router.register("guardians", GuardianViewSet, basename="guardian")

urlpatterns = router.urls
