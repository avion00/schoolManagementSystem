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
    MyDashboardView,
    MyFeesView,
    MyProfileView,
    MyResultsView,
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
    # Parent portal
    path("children/", MyChildrenView.as_view(), name="my-children"),
    path("children/<uuid:student_id>/", MyChildDashboardView.as_view(), name="my-child"),
    path("children/<uuid:student_id>/attendance/", MyChildAttendanceView.as_view(),
         name="my-child-attendance"),
    path("children/<uuid:student_id>/attendance/summary/", MyChildAttendanceSummaryView.as_view(),
         name="my-child-attendance-summary"),
    path("children/<uuid:student_id>/results/", MyChildResultsView.as_view(), name="my-child-results"),
    path("children/<uuid:student_id>/fees/", MyChildFeesView.as_view(), name="my-child-fees"),
]
