from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("action", "actor", "organization", "object_type", "object_id", "ip_address", "created_at")
    list_filter = ("action", "organization")
    search_fields = ("action", "actor__email", "object_id")
    readonly_fields = ("action", "actor", "organization", "object_type", "object_id", "changes", "ip_address", "user_agent", "created_at", "updated_at")
    date_hierarchy = "created_at"

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
