from rest_framework.routers import SimpleRouter

from .views import (
    PermissionViewSet,
    RoleViewSet,
    UserPermissionOverrideViewSet,
    UserRoleViewSet,
)

app_name = "rbac"

router = SimpleRouter()
router.register("permissions", PermissionViewSet, basename="permission")
router.register("roles", RoleViewSet, basename="role")
router.register("user-roles", UserRoleViewSet, basename="user-role")
router.register("permission-overrides", UserPermissionOverrideViewSet, basename="permission-override")

urlpatterns = router.urls
