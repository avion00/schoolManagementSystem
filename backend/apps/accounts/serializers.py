from rest_framework import serializers

from apps.rbac.services import user_permission_codes, user_role_names

from .models import Organization, User


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["id", "name", "slug", "region"]


class UserSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)
    roles = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    is_student = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "full_name", "is_platform_admin", "is_superuser",
            "must_change_password", "is_student", "organization", "roles", "permissions",
        ]

    def get_roles(self, obj):
        return user_role_names(obj)

    def get_permissions(self, obj):
        return sorted(user_permission_codes(obj))

    def get_is_student(self, obj):
        try:
            return obj.student_profile is not None
        except Exception:
            return False


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        style={"input_type": "password"}, trim_whitespace=False
    )
