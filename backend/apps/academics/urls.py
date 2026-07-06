from rest_framework.routers import SimpleRouter

from .views import (
    AcademicYearViewSet,
    ClassLevelViewSet,
    SectionViewSet,
    SubjectViewSet,
)

app_name = "academics"

router = SimpleRouter()
router.register("academic-years", AcademicYearViewSet, basename="academic-year")
router.register("class-levels", ClassLevelViewSet, basename="class-level")
router.register("sections", SectionViewSet, basename="section")
router.register("subjects", SubjectViewSet, basename="subject")

urlpatterns = router.urls
