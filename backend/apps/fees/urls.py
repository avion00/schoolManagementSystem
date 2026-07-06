from rest_framework.routers import SimpleRouter

from .views import (
    FeeCategoryViewSet,
    FeeStructureViewSet,
    InvoiceItemViewSet,
    InvoiceViewSet,
    PaymentViewSet,
)

app_name = "fees"

router = SimpleRouter()
router.register("fee-categories", FeeCategoryViewSet, basename="fee-category")
router.register("fee-structures", FeeStructureViewSet, basename="fee-structure")
router.register("invoices", InvoiceViewSet, basename="invoice")
router.register("invoice-items", InvoiceItemViewSet, basename="invoice-item")
router.register("payments", PaymentViewSet, basename="payment")

urlpatterns = router.urls
