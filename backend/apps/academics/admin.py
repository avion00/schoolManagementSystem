from django.contrib import admin

from .models import AcademicYear, ClassLevel, Section, Subject


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ("name", "school", "start_date", "end_date", "is_current", "is_active")
    list_filter = ("is_current", "is_active", "organization")
    search_fields = ("name",)


@admin.register(ClassLevel)
class ClassLevelAdmin(admin.ModelAdmin):
    list_display = ("name", "school", "order", "is_active")
    list_filter = ("is_active", "organization")
    search_fields = ("name",)


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ("__str__", "class_level", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "school", "is_active")
    list_filter = ("is_active", "organization")
    search_fields = ("name", "code")
