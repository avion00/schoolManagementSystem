from rest_framework.routers import SimpleRouter

from .views import TeacherAssignmentViewSet, TeacherViewSet

app_name = "teachers"

router = SimpleRouter()
router.register("teachers", TeacherViewSet, basename="teacher")
router.register("teacher-assignments", TeacherAssignmentViewSet, basename="teacher-assignment")

urlpatterns = router.urls
