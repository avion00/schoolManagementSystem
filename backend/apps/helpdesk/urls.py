from rest_framework.routers import SimpleRouter

from .views import TicketViewSet

app_name = "helpdesk"

router = SimpleRouter()
router.register("tickets", TicketViewSet, basename="ticket")

urlpatterns = router.urls
