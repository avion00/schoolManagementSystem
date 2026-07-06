from django.contrib import admin

from .models import Exam, ExamSubject, GradeBand, GradeScale, Mark


class GradeBandInline(admin.TabularInline):
    model = GradeBand
    extra = 0


@admin.register(GradeScale)
class GradeScaleAdmin(admin.ModelAdmin):
    list_display = ("name", "organization", "is_active")
    inlines = [GradeBandInline]
    search_fields = ("name",)


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ("name", "academic_year", "is_locked", "is_published", "organization", "is_active")
    list_filter = ("is_locked", "is_published", "is_active")
    search_fields = ("name",)


@admin.register(ExamSubject)
class ExamSubjectAdmin(admin.ModelAdmin):
    list_display = ("exam", "class_level", "subject", "full_marks", "pass_marks")
    search_fields = ("subject__name",)


@admin.register(Mark)
class MarkAdmin(admin.ModelAdmin):
    list_display = ("student", "exam_subject", "marks_obtained", "is_absent")
    search_fields = ("student__first_name", "student__last_name")
