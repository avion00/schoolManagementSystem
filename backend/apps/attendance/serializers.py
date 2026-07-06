from rest_framework import serializers

from apps.core.serializers import TenantPrimaryKeyRelatedField
from apps.students.models import Student

from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    student = TenantPrimaryKeyRelatedField(queryset=Student.objects.all())
    student_name = serializers.CharField(source="student.full_name", read_only=True)

    class Meta:
        model = Attendance
        fields = ["id", "student", "student_name", "date", "status", "remark", "is_active"]
        read_only_fields = ["is_active"]


class AttendanceBulkRecordSerializer(serializers.Serializer):
    student = TenantPrimaryKeyRelatedField(queryset=Student.objects.all())
    status = serializers.ChoiceField(choices=Attendance.Status.choices)
    remark = serializers.CharField(required=False, allow_blank=True, default="")


class AttendanceBulkSerializer(serializers.Serializer):
    date = serializers.DateField()
    records = AttendanceBulkRecordSerializer(many=True)
