"""Serializers for Principal-side user account management (principal-dashboard.md §4)."""
from rest_framework import serializers

from apps.rbac.services import permission_codes_from_prefetch

from .models import User


class UserAdminSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    password = serializers.CharField(
        write_only=True, required=False, allow_blank=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = [
            "id", "email", "full_name", "is_active", "must_change_password",
            "organization", "roles", "permissions", "password", "created_at",
        ]
        read_only_fields = ["organization", "roles", "permissions", "created_at", "must_change_password"]

    # Both read relations prefetched by UserManagementViewSet (no per-row queries).
    def get_roles(self, obj) -> list[str]:
        return sorted({ur.role.name for ur in obj.user_roles.all() if ur.role.is_active})

    def get_permissions(self, obj) -> list[str]:
        return sorted(permission_codes_from_prefetch(obj, self.context.get("all_permission_codes")))

    def create(self, validated_data):
        password = validated_data.pop("password", "") or None
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", "") or None
        for field, value in validated_data.items():
            setattr(instance, field, value)
        if password:
            instance.set_password(password)
            instance.must_change_password = False
        instance.save()
        return instance
