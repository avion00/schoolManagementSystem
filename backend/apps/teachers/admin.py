from django.contrib import admin

from .models import Teacher, TeacherAssignment


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ("full_name", "employee_id", "designation", "status", "organization", "is_active")
    list_filter = ("status", "is_active", "organization")
    search_fields = ("full_name", "employee_id", "email")


@admin.register(TeacherAssignment)
class TeacherAssignmentAdmin(admin.ModelAdmin):
    list_display = ("teacher", "class_level", "section", "subject", "is_class_teacher", "is_active")
    list_filter = ("is_class_teacher", "is_active", "academic_year")
    search_fields = ("teacher__full_name",)
