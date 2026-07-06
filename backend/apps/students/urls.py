from rest_framework.routers import SimpleRouter

from .views import StudentViewSet

app_name = "students"

router = SimpleRouter()
router.register("students", StudentViewSet, basename="student")

urlpatterns = router.urls
