from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.core.permissions import HasPermission

from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogViewSet(
    mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, HasPermission]
    required_permission = "audit.view"
    filterset_fields = ["action", "actor"]
    search_fields = ["action", "object_type", "object_id"]

    def get_queryset(self):
        qs = AuditLog.objects.select_related("actor").all()
        user = self.request.user
        if user.is_superuser or user.is_platform_admin:
            return qs
        return qs.filter(organization_id=user.organization_id)
