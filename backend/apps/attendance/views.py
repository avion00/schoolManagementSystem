from rest_framework.decorators import action
from rest_framework.response import Response

from apps.audit.services import record_audit
from apps.core.viewsets import TenantModelViewSet

from .models import Attendance
from .serializers import AttendanceBulkSerializer, AttendanceSerializer


class AttendanceViewSet(TenantModelViewSet):
    queryset = Attendance.objects.select_related("student").all()
    serializer_class = AttendanceSerializer
    audit_label = "attendance"
    permission_required = {
        "list": "attendance.report",
        "retrieve": "attendance.report",
        "create": "attendance.take",
        "update": "attendance.update",
        "partial_update": "attendance.update",
        "destroy": "attendance.update",
        "bulk": "attendance.take",
    }
    filterset_fields = ["date", "status", "student"]

    @action(detail=False, methods=["post"])
    def bulk(self, request):
        """Mark attendance for many students on one date (take a class register)."""
        org_id = self._require_org()
        serializer = AttendanceBulkSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        date = serializer.validated_data["date"]
        user = request.user
        results = []
        for rec in serializer.validated_data["records"]:
            obj, created = Attendance.objects.update_or_create(
                organization_id=org_id, student=rec["student"], date=date,
                defaults={
                    "status": rec["status"],
                    "remark": rec.get("remark", ""),
                    "updated_by": user,
                },
            )
            if created:
                obj.created_by = user
                obj.save(update_fields=["created_by"])
            results.append(
                {"student": str(rec["student"].id), "status": obj.status, "created": created}
            )
        record_audit(
            action="attendance.bulk", actor=user, request=request,
            organization=user.organization,
            changes={"date": str(date), "count": len(results)},
        )
        return Response({"date": str(date), "results": results})
