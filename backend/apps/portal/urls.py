from django.urls import path

from .views import (
    MyAttendanceSummaryView,
    MyAttendanceView,
    MyChildAttendanceSummaryView,
    MyChildAttendanceView,
    MyChildDashboardView,
    MyChildFeesView,
    MyChildrenView,
    MyChildResultsView,
    MyChildTimetableView,
    MyClassesView,
    MyClassStudentsView,
    MyDashboardView,
    MyFeesView,
    MyProfileView,
    MyResultsView,
    MyStaffAttendanceSummaryView,
    MyStaffAttendanceView,
    MyTeacherDashboardView,
    MyTeacherProfileView,
    MyTeacherTimetableView,
    MyTeacherTodayView,
    MyTimetableView,
    MyTodayView,
)

app_name = "portal"

urlpatterns = [
    # Student portal
    path("dashboard/", MyDashboardView.as_view(), name="my-dashboard"),
    path("profile/", MyProfileView.as_view(), name="my-profile"),
    path("attendance/", MyAttendanceView.as_view(), name="my-attendance"),
    path("attendance/summary/", MyAttendanceSummaryView.as_view(), name="my-attendance-summary"),
    path("results/", MyResultsView.as_view(), name="my-results"),
    path("fees/", MyFeesView.as_view(), name="my-fees"),
    path("timetable/", MyTimetableView.as_view(), name="my-timetable"),
    path("today/", MyTodayView.as_view(), name="my-today"),
    # Parent portal
    path("children/", MyChildrenView.as_view(), name="my-children"),
    path("children/<uuid:student_id>/", MyChildDashboardView.as_view(), name="my-child"),
    path("children/<uuid:student_id>/attendance/", MyChildAttendanceView.as_view(),
         name="my-child-attendance"),
    path("children/<uuid:student_id>/attendance/summary/", MyChildAttendanceSummaryView.as_view(),
         name="my-child-attendance-summary"),
    path("children/<uuid:student_id>/results/", MyChildResultsView.as_view(), name="my-child-results"),
    path("children/<uuid:student_id>/fees/", MyChildFeesView.as_view(), name="my-child-fees"),
    path("children/<uuid:student_id>/timetable/", MyChildTimetableView.as_view(), name="my-child-timetable"),
    # Teacher portal
    path("teacher/", MyTeacherProfileView.as_view(), name="my-teacher-profile"),
    path("teacher/dashboard/", MyTeacherDashboardView.as_view(), name="my-teacher-dashboard"),
    path("teacher/classes/", MyClassesView.as_view(), name="my-classes"),
    path("teacher/classes/<uuid:assignment_id>/students/", MyClassStudentsView.as_view(),
         name="my-class-students"),
    path("teacher/timetable/", MyTeacherTimetableView.as_view(), name="my-teacher-timetable"),
    path("teacher/today/", MyTeacherTodayView.as_view(), name="my-teacher-today"),
    path("teacher/attendance/", MyStaffAttendanceView.as_view(), name="my-staff-attendance"),
    path("teacher/attendance/summary/", MyStaffAttendanceSummaryView.as_view(),
         name="my-staff-attendance-summary"),
]
