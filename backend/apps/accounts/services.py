"""Account provisioning shared by every "create a login for this person" flow
(students, guardians, teachers)."""
import secrets

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework.exceptions import ValidationError

from .models import User


@transaction.atomic
def provision_login(*, email, full_name, organization_id, role_name, password=None):
    """Create a portal user with a role from the person's organization.

    Returns (user, password). When no password is given a temporary one is
    generated, and the user must change it at first login either way.
    """
    from apps.rbac.models import Role, UserRole

    email = (email or "").strip().lower()
    if not email:
        raise ValidationError({"email": "An email is required."})
    if User.objects.filter(email__iexact=email).exists():
        raise ValidationError({"email": "A user with this email already exists."})

    user = User(email=email, full_name=full_name, organization_id=organization_id,
                must_change_password=True)
    if password:
        try:
            validate_password(password, user)
        except DjangoValidationError as exc:
            raise ValidationError({"password": list(exc.messages)})
    else:
        password = secrets.token_urlsafe(9)
    user.set_password(password)
    user.save()

    role = Role.objects.filter(organization_id=organization_id, name=role_name).first()
    if role is None:
        raise ValidationError(f"The '{role_name}' role does not exist in this organization.")
    UserRole.objects.create(user=user, role=role, school=None)
    return user, password
