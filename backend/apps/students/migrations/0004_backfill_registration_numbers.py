from django.db import migrations


def forwards(apps, schema_editor):
    """Give existing students a registration number (REG-<year>-NNNNN) and
    continue the per-org sequence from there."""
    from django.utils import timezone

    Student = apps.get_model("students", "Student")
    DocumentSequence = apps.get_model("core", "DocumentSequence")

    year = timezone.localdate().year
    counters = {}
    for s in Student.objects.filter(registration_number="").order_by("organization_id", "created_at"):
        counters[s.organization_id] = counters.get(s.organization_id, 0) + 1
        s.registration_number = f"REG-{year}-{counters[s.organization_id]:05d}"
        s.save(update_fields=["registration_number"])
    for org_id, last in counters.items():
        DocumentSequence.objects.update_or_create(
            organization_id=org_id, key=f"reg:{year}", defaults={"last_value": last}
        )


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0001_initial"),
        ("students", "0003_student_profile_fields_and_history"),
    ]

    operations = [migrations.RunPython(forwards, migrations.RunPython.noop)]
