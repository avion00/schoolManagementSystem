from django.contrib import admin

from .models import (
    Permission,
    Role,
    RolePermission,
    UserPermissionOverride,
    UserRole,
)


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "module")
    list_filter = ("module",)
    search_fields = ("code", "name")


class RolePermissionInline(admin.TabularInline):
    model = RolePermission
    extra = 0
    autocomplete_fields = ("permission",)


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name", "organization", "is_system", "is_active")
    list_filter = ("is_system", "is_active", "organization")
    search_fields = ("name",)
    inlines = [RolePermissionInline]


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "school")
    search_fields = ("user__email", "role__name")


@admin.register(UserPermissionOverride)
class UserPermissionOverrideAdmin(admin.ModelAdmin):
    list_display = ("user", "permission", "granted")
    list_filter = ("granted",)
    search_fields = ("user__email", "permission__code")
