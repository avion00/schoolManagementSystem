"""Who may download a StoredFile.

Apps that attach files register a checker: `register(fn)` where
`fn(user, stored_file) -> bool`. A user may download a file they uploaded,
or one any checker grants. Nothing else is readable.
"""
_CHECKERS = []


def register(fn):
    _CHECKERS.append(fn)
    return fn


def can_download(user, stored_file):
    if stored_file.organization_id != user.organization_id and not user.is_superuser:
        return False
    if stored_file.uploaded_by_id == user.pk:
        return True
    return any(check(user, stored_file) for check in _CHECKERS)
