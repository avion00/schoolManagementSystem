"""Cookie-based JWT auth flow."""
import pytest
from rest_framework.test import APIClient

from tests.conftest import PASSWORD

pytestmark = pytest.mark.django_db

LOGIN = "/api/v1/auth/login/"


def login(client, email, password=PASSWORD):
    return client.post(LOGIN, {"email": email, "password": password}, format="json")


def test_login_sets_httponly_cookies_and_me_works(tenant):
    client = APIClient()
    res = login(client, tenant.users["Principal"].email)
    assert res.status_code == 200
    assert res.cookies["access_token"]["httponly"]
    assert res.cookies["refresh_token"]["httponly"]
    me = client.get("/api/v1/auth/me/")
    assert me.status_code == 200 and me.json()["email"] == tenant.users["Principal"].email


def test_bad_password_401(tenant):
    assert login(APIClient(), tenant.users["Principal"].email, "nope").status_code == 401


def test_refresh_rotates_and_old_token_is_blacklisted(tenant):
    client = APIClient()
    login(client, tenant.users["Principal"].email)
    old = client.cookies["refresh_token"].value
    assert client.post("/api/v1/auth/refresh/").status_code == 200
    assert client.cookies["refresh_token"].value != old
    replay = APIClient()
    replay.cookies["refresh_token"] = old
    assert replay.post("/api/v1/auth/refresh/").status_code == 401


def test_refresh_rejected_for_deactivated_user(tenant):
    client = APIClient()
    user = tenant.users["Teacher"]
    login(client, user.email)
    user.is_active = False
    user.save()
    assert client.post("/api/v1/auth/refresh/").status_code == 401


def test_logout_blacklists_refresh(tenant):
    client = APIClient()
    login(client, tenant.users["Principal"].email)
    token = client.cookies["refresh_token"].value
    assert client.post("/api/v1/auth/logout/").status_code == 200
    replay = APIClient()
    replay.cookies["refresh_token"] = token
    assert replay.post("/api/v1/auth/refresh/").status_code == 401


def test_login_is_rate_limited(tenant):
    # Per-IP throttle; an unknown email so account lockout doesn't kick in first.
    client = APIClient()
    email = "nobody@nowhere.test"
    codes = [login(client, email, "wrong").status_code for _ in range(11)]
    assert codes[:10] == [401] * 10
    assert codes[10] == 429
