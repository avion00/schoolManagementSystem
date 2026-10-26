from rest_framework import serializers

from apps.accounts.models import School
from apps.files.serializers import FileIdsField, StoredFileSerializer


class SchoolProfileSerializer(serializers.ModelSerializer):
    logo_id = FileIdsField(required=False, allow_null=True, write_only=True, source="logo")
    logo = StoredFileSerializer(read_only=True, allow_null=True)

    class Meta:
        model = School
        fields = ["id", "name", "code", "principal_name", "email", "phone", "website", "address", "city",
                  "state", "country", "postal_code", "registration_number", "tax_number", "logo_id", "logo"]
        read_only_fields = ["code"]

    def validate_logo_id(self, value):
        if value is not None and value.kind != "image":
            raise serializers.ValidationError("The logo must be an image.")
        return value
