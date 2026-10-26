from django.urls import path

from .views import SchoolProfileView, SettingsSectionView, SettingsView

app_name = "orgsettings"

urlpatterns = [
    path("", SettingsView.as_view(), name="all"),
    path("school/", SchoolProfileView.as_view(), name="school"),
    path("<str:section>/", SettingsSectionView.as_view(), name="section"),
]
