from django.contrib import admin

from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = (
        "admission_number", "full_name", "class_level", "section",
        "status", "organization", "is_active",
    )
    list_filter = ("status", "gender", "is_active", "organization", "class_level")
    search_fields = ("first_name", "middle_name", "last_name", "admission_number", "roll_number")
    autocomplete_fields = ()
