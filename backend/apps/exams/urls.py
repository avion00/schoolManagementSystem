from rest_framework.routers import SimpleRouter

from .views import (
    ExamSubjectViewSet,
    ExamViewSet,
    GradeBandViewSet,
    GradeScaleViewSet,
    MarkViewSet,
)

app_name = "exams"

router = SimpleRouter()
router.register("exams", ExamViewSet, basename="exam")
router.register("exam-subjects", ExamSubjectViewSet, basename="exam-subject")
router.register("marks", MarkViewSet, basename="mark")
router.register("grade-scales", GradeScaleViewSet, basename="grade-scale")
router.register("grade-bands", GradeBandViewSet, basename="grade-band")

urlpatterns = router.urls
