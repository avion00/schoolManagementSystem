"""Dashboard endpoints only expose what the caller is allowed to see."""
import pytest

pytestmark = pytest.mark.django_db

SUMMARY = "/api/v1/dashboard/summary/"
ANALYTICS = "/api/v1/dashboard/analytics/"


@pytest.mark.parametrize("url", [SUMMARY, ANALYTICS])
def test_requires_report_permission(api, tenant, url):
    assert api(tenant.users["Student"]).get(url).status_code == 403
    assert api().get(url).status_code == 401


def test_principal_sees_everything(api, tenant):
    data = api(tenant.users["Principal"]).get(SUMMARY).json()
    assert data["students"] == 1
    assert data["outstanding_dues"] == 1000.0
    assert data["recent_activity"] is not None


def test_finance_and_audit_hidden_without_permission(api, tenant):
    data = api(tenant.users["Teacher"]).get(SUMMARY).json()
    assert data["students"] == 1
    assert data["fee_collected_this_month"] is None
    assert data["outstanding_dues"] is None
    assert data["recent_activity"] is None

    analytics = api(tenant.users["Teacher"]).get(ANALYTICS).json()
    assert analytics["fees_series"] is None
    assert analytics["recent_invoices"] is None
    assert analytics["attendance_series"] is not None
