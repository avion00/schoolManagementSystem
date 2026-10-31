from django.urls import path
from rest_framework.routers import SimpleRouter

from .views import (
    CollectionTrendView,
    DefaultersView,
    FeeCategoryViewSet,
    FeeDiscountViewSet,
    FeeStructureViewSet,
    FeeSummaryView,
    InvoiceItemViewSet,
    InvoiceViewSet,
    LedgerView,
    PaymentViewSet,
    StudentFeesView,
)

app_name = "fees"

router = SimpleRouter()
router.register("fee-categories", FeeCategoryViewSet, basename="fee-category")
router.register("fee-structures", FeeStructureViewSet, basename="fee-structure")
router.register("invoices", InvoiceViewSet, basename="invoice")
router.register("invoice-items", InvoiceItemViewSet, basename="invoice-item")
router.register("payments", PaymentViewSet, basename="payment")

router.register("discounts", FeeDiscountViewSet, basename="fee-discount")

urlpatterns = router.urls + [
    path("student-fees/", StudentFeesView.as_view(), name="student-fees"),
    path("ledger/", LedgerView.as_view(), name="ledger"),
    path("reports/summary/", FeeSummaryView.as_view(), name="report-summary"),
    path("reports/collection-trend/", CollectionTrendView.as_view(), name="report-collection-trend"),
    path("reports/defaulters/", DefaultersView.as_view(), name="report-defaulters"),
]
