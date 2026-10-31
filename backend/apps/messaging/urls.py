from rest_framework.routers import SimpleRouter

from .views import (
    BroadcastViewSet,
    ConversationViewSet,
    MessageRequestViewSet,
    MessageViewSet,
    ModerationViewSet,
)

app_name = "messaging"

router = SimpleRouter()
router.register("conversations", ConversationViewSet, basename="conversation")
router.register("messages", MessageViewSet, basename="message")
router.register("requests", MessageRequestViewSet, basename="message-request")
router.register("moderation/reports", ModerationViewSet, basename="moderation-report")
router.register("broadcasts", BroadcastViewSet, basename="broadcast")

urlpatterns = router.urls
