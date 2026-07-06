from django.contrib import admin

from .models import Attendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("student", "date", "status", "organization", "is_active")
    list_filter = ("status", "date", "organization")
    search_fields = ("student__first_name", "student__last_name", "student__admission_number")
    date_hierarchy = "date"
