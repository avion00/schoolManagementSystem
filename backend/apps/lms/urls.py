from rest_framework.routers import SimpleRouter

from .views import AssignmentViewSet, LessonPlanViewSet, MaterialViewSet

app_name = "lms"

router = SimpleRouter()
router.register("assignments", AssignmentViewSet, basename="assignment")
router.register("materials", MaterialViewSet, basename="material")
router.register("lesson-plans", LessonPlanViewSet, basename="lesson-plan")

urlpatterns = router.urls
