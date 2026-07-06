from rest_framework.routers import SimpleRouter

from .admin_views import UserManagementViewSet

app_name = "accounts_admin"

router = SimpleRouter()
router.register("users", UserManagementViewSet, basename="user")

urlpatterns = router.urls
