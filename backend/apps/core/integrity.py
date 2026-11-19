"""Turn database uniqueness violations into clean 400 responses.

DRF can't pre-validate tenant-scoped unique constraints (`organization` is set
server-side, not a serializer field), so the database is the source of truth and
this maps its error back to the offending field.
"""
from django.db import models
from rest_framework.exceptions import ValidationError

_SKIP = {"organization", "school"}


def _matches(constraint, model, message):
    if constraint.name in message:  # PostgreSQL names the constraint
        return True
    table = model._meta.db_table
    columns = [model._meta.get_field(f).column for f in constraint.fields]
    return all(f"{table}.{col}" in message for col in columns)  # SQLite lists columns


def integrity_error_to_validation(model, exc):
    message = str(exc)
    for constraint in model._meta.constraints:
        if isinstance(constraint, models.UniqueConstraint) and _matches(constraint, model, message):
            fields = [f for f in constraint.fields if f not in _SKIP] or list(constraint.fields)
            label = model._meta.get_field(fields[-1]).verbose_name
            return ValidationError({fields[-1]: f"A {model._meta.verbose_name} with this {label} already exists."})
    return ValidationError("This record conflicts with an existing one.")
