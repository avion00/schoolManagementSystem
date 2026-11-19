import uuid

from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from apps.core.viewsets import TenantModelViewSet

from . import services
from .models import PeriodSlot, RoutineEntry
from .serializers import PeriodSlotSerializer, RoutineEntrySerializer

_MANAGE = {
    "create": "timetable.manage",
    "update": "timetable.manage",
    "partial_update": "timetable.manage",
    "destroy": "timetable.manage",
}


def _uuid(request, name):
    raw = request.query_params.get(name)
    if not raw:
        return None
    try:
        return uuid.UUID(raw)
    except ValueError:
        raise ValidationError({name: "Must be a valid id."})


class PeriodSlotViewSet(TenantModelViewSet):
    """Bell schedule. Readable by everyone in the organization (portals too)."""

    queryset = PeriodSlot.objects.all()
    serializer_class = PeriodSlotSerializer
    audit_label = "period_slot"
    permission_required = _MANAGE
    filterset_fields = ["shift", "is_break"]

    def perform_destroy(self, instance):
        if instance.entries.exists():
            raise ValidationError("Classes are scheduled in this period; move them first.")
        super().perform_destroy(instance)


class RoutineEntryViewSet(TenantModelViewSet):
    queryset = RoutineEntry.objects.select_related(
        "period", "subject", "teacher", "room", "section", "section__class_level", "academic_year"
    )
    serializer_class = RoutineEntrySerializer
    audit_label = "routine_entry"
    permission_required = {
        **_MANAGE,
        "list": "timetable.view",
        "retrieve": "timetable.view",
        "grid": "timetable.view",
        "conflicts": "timetable.view",
        "stats": "timetable.view",
    }
    filterset_fields = {
        "academic_year": ["exact"], "section": ["exact"], "section__class_level": ["exact"],
        "day": ["exact"], "teacher": ["exact"], "room": ["exact"], "subject": ["exact"],
        "status": ["exact"], "period__shift": ["exact"],
    }

    @action(detail=False, methods=["get"])
    def grid(self, request):
        """Weekly grid for ?section=, ?teacher= or ?room= (active entries)."""
        filters = {}
        for name in ("section", "teacher", "room", "academic_year"):
            value = _uuid(request, name)
            if value:
                filters[f"{name}_id"] = value
        if not any(k in filters for k in ("section_id", "teacher_id", "room_id")):
            raise ValidationError("Provide a section, teacher or room.")
        entries = self.get_queryset().filter(status=RoutineEntry.Status.ACTIVE, **filters)
        return Response({"days": services.weekly(entries), "periods": len(entries)})

    @action(detail=False, methods=["get"])
    def conflicts(self, request):
        """Clashes among existing active entries (e.g. after a teacher swap)."""
        out, seen = [], set()
        for e in self.filter_queryset(self.get_queryset()).filter(status=RoutineEntry.Status.ACTIVE):
            for c in services.clashes(
                organization_id=e.organization_id, academic_year=e.academic_year, day=e.day,
                period=e.period, section=e.section, teacher=e.teacher, room=e.room, exclude_id=e.pk,
            ):
                pair = frozenset((str(e.id), c["entry"]))
                if pair not in seen:
                    seen.add(pair)
                    out.append({"entry": str(e.id), "section": str(e.section), "day": e.day, "clash": c})
        return Response({"count": len(out), "conflicts": out})

    @action(detail=False, methods=["get"])
    def stats(self, request):
        qs = self.filter_queryset(self.get_queryset()).filter(status=RoutineEntry.Status.ACTIVE)
        return Response({
            "weekly_periods": qs.count(),
            "sections": qs.values("section").distinct().count(),
            "teachers": qs.exclude(teacher=None).values("teacher").distinct().count(),
            "unassigned_teacher": qs.filter(teacher=None).count(),
        })
