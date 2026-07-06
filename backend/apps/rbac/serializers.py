from rest_framework import serializers

from apps.accounts.models import School, User

from .models import Permission, Role, UserPermissionOverride, UserRole


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ["id", "code", "name", "module", "description"]


class RoleSerializer(serializers.ModelSerializer):
    permissions = serializers.SlugRelatedField(
        slug_field="code", many=True, read_only=True
    )

    class Meta:
        model = Role
        fields = ["id", "name", "description", "is_system", "organization", "permissions"]
        read_only_fields = ["is_system", "organization", "permissions"]


class UserRoleSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all())
    school = serializers.PrimaryKeyRelatedField(
        queryset=School.objects.all(), required=False, allow_null=True, default=None
    )
    user_email = serializers.CharField(source="user.email", read_only=True)
    role_name = serializers.CharField(source="role.name", read_only=True)

    class Meta:
        model = UserRole
        fields = ["id", "user", "user_email", "role", "role_name", "school"]
        # Uniqueness is enforced by the DB constraint + validate(); skip DRF's
        # auto unique-together validator (it would force `school` to be required).
        validators = []

    def validate(self, attrs):
        request = self.context["request"]
        actor = request.user
        if actor.is_superuser or actor.is_platform_admin:
            return attrs
        org_id = actor.organization_id
        if attrs["user"].organization_id != org_id:
            raise serializers.ValidationError({"user": "User is not in your organization."})
        role = attrs["role"]
        if role.organization_id not in (None, org_id):
            raise serializers.ValidationError({"role": "Role is not available to your organization."})
        school = attrs.get("school")
        if school is not None and school.organization_id != org_id:
            raise serializers.ValidationError({"school": "School is not in your organization."})
        return attrs


class UserPermissionOverrideSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    permission = serializers.PrimaryKeyRelatedField(queryset=Permission.objects.all())
    permission_code = serializers.CharField(source="permission.code", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = UserPermissionOverride
        fields = ["id", "user", "user_email", "permission", "permission_code", "granted"]

    def validate(self, attrs):
        from .services import user_permission_codes

        request = self.context["request"]
        actor = request.user
        if actor.is_superuser or actor.is_platform_admin:
            return attrs
        if attrs["user"].organization_id != actor.organization_id:
            raise serializers.ValidationError({"user": "User is not in your organization."})
        # You may only grant permissions you yourself hold.
        if attrs.get("granted", True) and attrs["permission"].code not in user_permission_codes(actor):
            raise serializers.ValidationError(
                {"permission": "You cannot grant a permission you do not hold."}
            )
        return attrs
