from django.urls import path

from .account_views import (
    ChangePasswordView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    SessionListView,
    SessionRevokeOthersView,
    SessionRevokeView,
)
from .views import LoginView, LogoutView, MeView, RefreshView

app_name = "accounts"

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", RefreshView.as_view(), name="refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("sessions/", SessionListView.as_view(), name="sessions"),
    path("sessions/revoke-others/", SessionRevokeOthersView.as_view(), name="sessions-revoke-others"),
    path("sessions/<uuid:pk>/", SessionRevokeView.as_view(), name="session-revoke"),
]
