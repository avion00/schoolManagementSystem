from django.contrib import admin

from .models import Guardian


@admin.register(Guardian)
class GuardianAdmin(admin.ModelAdmin):
    list_display = ("full_name", "relation", "phone", "email", "organization", "is_active")
    list_filter = ("relation", "is_active", "organization")
    search_fields = ("full_name", "phone", "email")
