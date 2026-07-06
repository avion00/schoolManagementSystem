from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Branch, Organization, School, User


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "region", "is_active", "created_at")
    search_fields = ("name", "slug")
    list_filter = ("region", "is_active")


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "organization", "is_active")
    search_fields = ("name", "code")
    list_filter = ("organization", "is_active")


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "school", "is_active")
    search_fields = ("name", "code")
    list_filter = ("school", "is_active")


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("email",)
    list_display = ("email", "full_name", "organization", "is_platform_admin", "is_staff", "is_active")
    list_filter = ("is_platform_admin", "is_staff", "is_active", "organization")
    search_fields = ("email", "full_name")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Profile", {"fields": ("full_name", "organization")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "is_platform_admin", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login",)}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "full_name", "organization", "password1", "password2", "is_staff", "is_superuser", "is_platform_admin"),
        }),
    )
    readonly_fields = ("last_login",)
