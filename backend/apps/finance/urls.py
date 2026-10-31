from django.urls import path
from rest_framework.routers import SimpleRouter

from .views import (
    ExpenseViewSet,
    FinanceSummaryView,
    PayrollRunViewSet,
    SalaryStructureViewSet,
    VendorViewSet,
)

app_name = "finance"

router = SimpleRouter()
router.register("vendors", VendorViewSet, basename="vendor")
router.register("expenses", ExpenseViewSet, basename="expense")
router.register("salary-structures", SalaryStructureViewSet, basename="salary-structure")
router.register("payroll-runs", PayrollRunViewSet, basename="payroll-run")

urlpatterns = router.urls + [path("summary/", FinanceSummaryView.as_view(), name="summary")]
