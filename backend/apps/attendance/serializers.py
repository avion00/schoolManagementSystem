from rest_framework import serializers

from apps.core.serializers import TenantPrimaryKeyRelatedField
from apps.students.models import Student

from .models import Attendance, Holiday


class AttendanceSerializer(serializers.ModelSerializer):
    student = TenantPrimaryKeyRelatedField(queryset=Student.objects.all())
    student_name = serializers.CharField(source="student.full_name", read_only=True)

    class Meta:
        model = Attendance
        fields = ["id", "student", "student_name", "date", "status", "remark", "is_active"]
        read_only_fields = ["is_active"]
        validators = []  # duplicates surface from the DB constraint as a 400


class AttendanceBulkRecordSerializer(serializers.Serializer):
    student = TenantPrimaryKeyRelatedField(queryset=Student.objects.all())
    status = serializers.ChoiceField(choices=Attendance.Status.choices)
    remark = serializers.CharField(required=False, allow_blank=True, default="")


class AttendanceBulkSerializer(serializers.Serializer):
    date = serializers.DateField()
    records = AttendanceBulkRecordSerializer(many=True, allow_empty=False)

    def validate_records(self, records):
        ids = [r["student"].pk for r in records]
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError("Each student may appear only once.")
        return records


class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = ["id", "name", "start_date", "end_date", "description", "is_active"]
        read_only_fields = ["is_active"]
        extra_kwargs = {"end_date": {"required": False}}

    def validate(self, attrs):
        start = attrs.get("start_date") or getattr(self.instance, "start_date", None)
        attrs.setdefault("end_date", getattr(self.instance, "end_date", None) or start)
        if attrs["end_date"] < start:
            raise serializers.ValidationError({"end_date": "End date cannot be before the start date."})
        return attrs
