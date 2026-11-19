"""Server-assigned document numbers (school.md §7.11: invoice/receipt numbers
must not be client-controlled)."""
from django.db import transaction
from django.utils import timezone

from apps.core.models import DocumentSequence


def next_document_number(organization_id, prefix, *, width=5):
    """Return e.g. "INV-2026-00042", unique and sequential per org, prefix and year.

    The counter row is locked (SELECT ... FOR UPDATE on PostgreSQL), so concurrent
    callers never get the same number. Must run inside the caller's transaction.
    """
    year = timezone.localdate().year
    key = f"{prefix.lower()}:{year}"
    with transaction.atomic():
        seq, _ = DocumentSequence.objects.select_for_update().get_or_create(
            organization_id=organization_id, key=key,
        )
        seq.last_value += 1
        seq.save(update_fields=["last_value"])
    return f"{prefix}-{year}-{seq.last_value:0{width}d}"
