from django.urls import path

from .views import DashboardAnalyticsView, DashboardSummaryView

app_name = "reports"

urlpatterns = [
    path("dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("dashboard/analytics/", DashboardAnalyticsView.as_view(), name="dashboard-analytics"),
]
