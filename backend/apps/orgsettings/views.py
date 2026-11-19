from django.db import transaction
from drf_spectacular.utils import extend_schema
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import School
from apps.audit.services import record_audit
from apps.core.permissions import HasPermission

from .defaults import DEFAULTS, merged, validate_section
from .models import OrganizationSettings
from .serializers import SchoolProfileSerializer


class _ManageOnWrite(HasPermission):
    """Anyone in the organization reads; settings.manage writes."""

    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return bool(request.user and request.user.is_authenticated)
        view.required_permission = "settings.manage"
        return super().has_permission(request, view)


def _school(request):
    qs = School.objects.filter(organization_id=request.user.organization_id)
    school_id = request.query_params.get("school")
    school = (qs.filter(pk=school_id) if school_id else qs.order_by("created_at")).first()
    if school is None:
        raise ValidationError("No school found for your organization.")
    return school


class SchoolProfileView(APIView):
    permission_classes = [IsAuthenticated, _ManageOnWrite]
    serializer_class = SchoolProfileSerializer

    def get(self, request):
        return Response(SchoolProfileSerializer(_school(request), context={"request": request}).data)

    def patch(self, request):
        school = _school(request)
        data = SchoolProfileSerializer(school, data=request.data, partial=True, context={"request": request})
        data.is_valid(raise_exception=True)
        data.save()
        record_audit(action="settings.school_profile", actor=request.user, instance=school, request=request,
                     organization=request.user.organization, changes={k: str(v) for k, v in data.validated_data.items()})
        return Response(data.data)


class SettingsView(APIView):
    """GET all sections (defaults merged with the school's values)."""

    permission_classes = [IsAuthenticated, _ManageOnWrite]

    @extend_schema(operation_id="v1_settings_all")
    def get(self, request):
        row = OrganizationSettings.objects.filter(organization_id=request.user.organization_id).first()
        return Response(merged(row.data if row else {}))


class SettingsSectionView(APIView):
    """PATCH /settings/<section>/ with a partial object; unknown keys and wrong types are rejected."""

    permission_classes = [IsAuthenticated, _ManageOnWrite]

    def get(self, request, section):
        if section not in DEFAULTS:
            raise ValidationError({"section": "Unknown section."})
        return Response(SettingsView().get(request).data[section])

    @transaction.atomic
    def patch(self, request, section):
        if not isinstance(request.data, dict):
            raise ValidationError("Send an object.")
        errors = validate_section(section, request.data)
        if errors:
            raise ValidationError({"settings": errors})
        row, _ = OrganizationSettings.objects.select_for_update().get_or_create(
            organization_id=request.user.organization_id)
        current = dict(row.data.get(section, {}))
        for key, val in request.data.items():
            if isinstance(DEFAULTS[section][key], dict):
                current[key] = {**current.get(key, {}), **val}
            else:
                current[key] = val
        row.data = {**row.data, section: current}
        row.updated_by = request.user
        row.save()
        record_audit(action=f"settings.{section}", actor=request.user, request=request,
                     organization=request.user.organization, changes=request.data)
        return Response(merged(row.data)[section])
