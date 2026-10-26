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
    is_guardian = serializers.SerializerMethodField()
    is_teacher = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "full_name", "phone", "timezone", "language", "password_changed_at",
            "last_login", "is_platform_admin", "is_superuser",
            "must_change_password", "is_student", "is_guardian", "is_teacher", "organization", "roles", "permissions",
        ]

    def get_roles(self, obj) -> list[str]:
        return user_role_names(obj)

    def get_permissions(self, obj) -> list[str]:
        return sorted(user_permission_codes(obj))

    def get_is_student(self, obj) -> bool:
        try:
            return obj.student_profile is not None
        except Exception:
            return False

    def get_is_teacher(self, obj) -> bool:
        try:
            return obj.teacher_profile is not None
        except Exception:
            return False

    def get_is_guardian(self, obj) -> bool:
        try:
            return obj.guardian_profile is not None
        except Exception:
            return False


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        style={"input_type": "password"}, trim_whitespace=False
    )
