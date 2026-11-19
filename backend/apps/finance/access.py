"""Expense receipts are readable by finance staff."""
from apps.files.access import register
from apps.rbac.services import user_has_permission


@register
def expense_receipts(user, stored):
    return stored.expenses.exists() and user_has_permission(user, "finance.view")
