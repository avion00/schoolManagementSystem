from rest_framework.routers import SimpleRouter

from .views import StaffAttendanceViewSet, TeacherAssignmentViewSet, TeacherViewSet

app_name = "teachers"

router = SimpleRouter()
router.register("teachers", TeacherViewSet, basename="teacher")
router.register("teacher-assignments", TeacherAssignmentViewSet, basename="teacher-assignment")
router.register("staff-attendance", StaffAttendanceViewSet, basename="staff-attendance")

urlpatterns = router.urls
