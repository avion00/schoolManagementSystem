from rest_framework import serializers

from .models import Guardian


class GuardianSerializer(serializers.ModelSerializer):
    children_count = serializers.IntegerField(source="students.count", read_only=True)

    class Meta:
        model = Guardian
        fields = [
            "id", "full_name", "relation", "phone", "email",
            "occupation", "address", "emergency_contact",
            "children_count", "is_active",
        ]
        read_only_fields = ["is_active"]
