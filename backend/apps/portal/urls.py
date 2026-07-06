from django.urls import path

from .views import (
    MyAttendanceSummaryView,
    MyAttendanceView,
    MyDashboardView,
    MyFeesView,
    MyProfileView,
    MyResultsView,
)

app_name = "portal"

urlpatterns = [
    path("dashboard/", MyDashboardView.as_view(), name="my-dashboard"),
    path("profile/", MyProfileView.as_view(), name="my-profile"),
    path("attendance/", MyAttendanceView.as_view(), name="my-attendance"),
    path("attendance/summary/", MyAttendanceSummaryView.as_view(), name="my-attendance-summary"),
    path("results/", MyResultsView.as_view(), name="my-results"),
    path("fees/", MyFeesView.as_view(), name="my-fees"),
]
