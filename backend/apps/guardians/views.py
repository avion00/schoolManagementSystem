from apps.core.viewsets import TenantModelViewSet

from .models import Guardian
from .serializers import GuardianSerializer


class GuardianViewSet(TenantModelViewSet):
    queryset = Guardian.objects.all()
    serializer_class = GuardianSerializer
    audit_label = "guardian"
    permission_required = {
        "list": "guardian.view",
        "retrieve": "guardian.view",
        "create": "guardian.manage",
        "update": "guardian.manage",
        "partial_update": "guardian.manage",
        "destroy": "guardian.manage",
    }
    filterset_fields = ["relation"]
    search_fields = ["full_name", "phone", "email"]
