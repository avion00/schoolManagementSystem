"""Settings sections, their defaults and (by example) their types."""
from copy import deepcopy

DEFAULTS = {
    "notifications": {
        "channels": {"in_app": True, "email": False, "sms": False, "push": False},
        "events": {
            "attendance_alert": True, "fee_due_reminder": True, "exam_scheduled": True,
            "result_published": True, "notice_published": True, "message_received": True,
            "payment_received": True, "low_attendance_alert": True,
        },
    },
    "fees": {
        "currency": "NPR", "currency_symbol": "Rs.", "late_fee_enabled": False, "late_fee_amount": 0,
        "late_fee_type": "fixed", "grace_period_days": 0,
        "payment_methods": {
            "cash": True, "bank": True, "card": True, "online": True, "wallet": True,
            "mobile_banking": True, "cheque": True,
        },
    },
    "attendance": {
        "attendance_type": "daily", "allow_late_marking": True, "late_threshold_minutes": 10,
        "auto_notify_parents": True, "lock_after_days": 7, "weekend_days": ["saturday"],
        "working_hours_start": "10:00", "working_hours_end": "16:00",
    },
    "exams": {
        "default_pass_percentage": 40, "gpa_enabled": True, "result_approval_required": True,
        "admit_card_required": True, "practical_marks_enabled": True, "internal_assessment_enabled": True,
    },
    "security": {
        "min_password_length": 10, "max_login_attempts": 5, "lockout_duration_mins": 15,
        "session_timeout_mins": 60 * 24 * 7, "login_alerts_enabled": True,
    },
    "appearance": {"theme": "system", "primary_color": "#2563eb", "density": "comfortable"},
}

CHOICES = {
    ("fees", "late_fee_type"): {"fixed", "percentage"},
    ("attendance", "attendance_type"): {"daily", "period"},
    ("appearance", "theme"): {"light", "dark", "system"},
    ("appearance", "density"): {"comfortable", "compact"},
}
RANGES = {
    ("attendance", "lock_after_days"): (0, 365),
    ("exams", "default_pass_percentage"): (0, 100),
    ("security", "min_password_length"): (8, 64),
    ("security", "max_login_attempts"): (3, 20),
    ("security", "lockout_duration_mins"): (1, 1440),
    ("fees", "grace_period_days"): (0, 365),
}


def merged(stored):
    out = deepcopy(DEFAULTS)
    for section, values in (stored or {}).items():
        if section in out:
            for key, val in values.items():
                if isinstance(out[section].get(key), dict):
                    out[section][key].update(val)
                else:
                    out[section][key] = val
    return out


def validate_section(section, patch):
    """Return a list of problems with a partial update to one section."""
    if section not in DEFAULTS:
        return [f"Unknown section '{section}'."]
    errors = []
    spec = DEFAULTS[section]
    for key, val in patch.items():
        if key not in spec:
            errors.append(f"Unknown setting '{key}'.")
            continue
        expected = spec[key]
        if isinstance(expected, dict):
            if not isinstance(val, dict):
                errors.append(f"'{key}' must be an object.")
                continue
            for sub, sv in val.items():
                if sub not in expected:
                    errors.append(f"Unknown setting '{key}.{sub}'.")
                elif type(sv) is not type(expected[sub]):
                    errors.append(f"'{key}.{sub}' must be {type(expected[sub]).__name__}.")
            continue
        if isinstance(expected, bool) and not isinstance(val, bool):
            errors.append(f"'{key}' must be true or false.")
        elif isinstance(expected, int) and not isinstance(expected, bool) and (
                isinstance(val, bool) or not isinstance(val, (int, float))):
            errors.append(f"'{key}' must be a number.")
        elif isinstance(expected, (str, list)) and type(val) is not type(expected):
            errors.append(f"'{key}' must be {type(expected).__name__}.")
        elif (section, key) in CHOICES and val not in CHOICES[(section, key)]:
            errors.append(f"'{key}' must be one of {sorted(CHOICES[(section, key)])}.")
        elif (section, key) in RANGES and not RANGES[(section, key)][0] <= val <= RANGES[(section, key)][1]:
            lo, hi = RANGES[(section, key)]
            errors.append(f"'{key}' must be between {lo} and {hi}.")
    return errors
