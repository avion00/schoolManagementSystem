from rest_framework import serializers

from apps.academics.models import AcademicYear, Section, Subject
from apps.core.serializers import TenantPrimaryKeyRelatedField, merged_value
from apps.exams.models import ExamRoom
from apps.teachers.models import Teacher

from .models import PeriodSlot, RoutineEntry
from .services import clashes


class PeriodSlotSerializer(serializers.ModelSerializer):
    duration_minutes = serializers.IntegerField(read_only=True)

    class Meta:
        model = PeriodSlot
        fields = [
            "id", "shift", "period_no", "label", "start_time", "end_time", "is_break",
            "duration_minutes", "is_active",
        ]
        read_only_fields = ["is_active"]
        validators = []

    def validate(self, attrs):
        start = merged_value(attrs, self.instance, "start_time")
        end = merged_value(attrs, self.instance, "end_time")
        if end <= start:
            raise serializers.ValidationError({"end_time": "End time must be after the start time."})
        shift = merged_value(attrs, self.instance, "shift")
        org_id = self.context["request"].user.organization_id
        same_shift = PeriodSlot.objects.filter(organization_id=org_id, shift=shift)
        if self.instance:
            same_shift = same_shift.exclude(pk=self.instance.pk)
        if same_shift.filter(period_no=merged_value(attrs, self.instance, "period_no")).exists():
            raise serializers.ValidationError({"period_no": "This period number already exists in the shift."})
        overlap = same_shift.filter(start_time__lt=end, end_time__gt=start).first()
        if overlap:
            raise serializers.ValidationError(f"Overlaps {overlap} in the same shift.")
        return attrs


class RoutineEntrySerializer(serializers.ModelSerializer):
    academic_year = TenantPrimaryKeyRelatedField(queryset=AcademicYear.objects.all())
    section = TenantPrimaryKeyRelatedField(queryset=Section.objects.all())
    period = TenantPrimaryKeyRelatedField(queryset=PeriodSlot.objects.all())
    subject = TenantPrimaryKeyRelatedField(queryset=Subject.objects.all())
    teacher = TenantPrimaryKeyRelatedField(queryset=Teacher.objects.all(), required=False, allow_null=True)
    room = TenantPrimaryKeyRelatedField(queryset=ExamRoom.objects.all(), required=False, allow_null=True)
    class_level_name = serializers.CharField(source="section.class_level.name", read_only=True)
    section_name = serializers.CharField(source="section.name", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    teacher_name = serializers.CharField(source="teacher.full_name", read_only=True, default=None)
    room_name = serializers.CharField(source="room.name", read_only=True, default=None)
    period_no = serializers.IntegerField(source="period.period_no", read_only=True)
    shift = serializers.CharField(source="period.shift", read_only=True)
    start_time = serializers.TimeField(source="period.start_time", read_only=True)
    end_time = serializers.TimeField(source="period.end_time", read_only=True)

    class Meta:
        model = RoutineEntry
        fields = [
            "id", "academic_year", "section", "class_level_name", "section_name", "day",
            "period", "period_no", "shift", "start_time", "end_time",
            "subject", "subject_name", "teacher", "teacher_name", "room", "room_name",
            "status", "notes", "is_active",
        ]
        read_only_fields = ["is_active"]
        validators = []

    def validate(self, attrs):
        data = {f: merged_value(attrs, self.instance, f) for f in (
            "academic_year", "section", "day", "period", "teacher", "room", "status",
        )}
        if data["period"].is_break:
            raise serializers.ValidationError({"period": "Classes can't be scheduled in a break."})
        status = data["status"] or RoutineEntry.Status.ACTIVE  # model default on create
        if status != RoutineEntry.Status.ACTIVE:
            return attrs  # inactive entries don't occupy the slot
        found = clashes(
            organization_id=self.context["request"].user.organization_id,
            academic_year=data["academic_year"], day=data["day"], period=data["period"],
            section=data["section"], teacher=data["teacher"], room=data["room"],
            exclude_id=getattr(self.instance, "pk", None),
        )
        if found:
            raise serializers.ValidationError({"conflicts": found})
        return attrs
