from rest_framework.routers import SimpleRouter

from .views import MyNoticeViewSet, NoticeViewSet, NotificationViewSet

app_name = "communications"

router = SimpleRouter()
router.register("notices", NoticeViewSet, basename="notice")
router.register("me/notices", MyNoticeViewSet, basename="my-notice")
router.register("me/notifications", NotificationViewSet, basename="my-notification")

urlpatterns = router.urls
