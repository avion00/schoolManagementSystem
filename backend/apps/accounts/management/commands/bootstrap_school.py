"""Set up a real customer: permissions, one organization + school, its roles,
and the first Principal login. No demo data.

    python manage.py bootstrap_school --org "Sunrise Education" --slug sunrise \\
        --school "Sunrise Academy" --code SA --admin-email principal@sunrise.edu \\
        --admin-name "Asha Rai"

Prints a one-time password (the user must change it at first sign-in) unless
--password is given. Safe to re-run: it only adds what is missing.
"""
import secrets

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.accounts.models import Organization, School, User
from apps.rbac.catalog import PERMISSIONS, ROLE_PERMISSIONS
from apps.rbac.models import Permission, Role, RolePermission, UserRole


class Command(BaseCommand):
    help = "Create a customer organization, school, roles and Principal account."

    def add_arguments(self, parser):
        parser.add_argument("--org", required=True, help="Organization name")
        parser.add_argument("--slug", required=True, help="Short unique id, e.g. sunrise")
        parser.add_argument("--school", required=True, help="School name")
        parser.add_argument("--code", required=True, help="School code, e.g. SA")
        parser.add_argument("--admin-email", required=True)
        parser.add_argument("--admin-name", required=True)
        parser.add_argument("--password", help="Initial password (default: generated)")

    @transaction.atomic
    def handle(self, *args, **o):
        perms = {}
        for code, name, module in PERMISSIONS:
            perms[code], _ = Permission.objects.get_or_create(code=code, defaults={"name": name, "module": module})

        org, _ = Organization.objects.get_or_create(slug=o["slug"], defaults={"name": o["org"]})
        school, _ = School.objects.get_or_create(organization=org, code=o["code"], defaults={"name": o["school"]})
        roles = {}
        for role_name, codes in ROLE_PERMISSIONS.items():
            roles[role_name], _ = Role.objects.get_or_create(organization=org, name=role_name)
            for code in codes:
                RolePermission.objects.get_or_create(role=roles[role_name], permission=perms[code])

        email = o["admin_email"].strip().lower()
        user = User.objects.filter(email__iexact=email).first()
        if user and user.organization_id not in (None, org.pk):
            raise CommandError(f"{email} already belongs to another organization.")
        password = None
        if user is None:
            password = o["password"] or secrets.token_urlsafe(12)
            user = User(email=email, full_name=o["admin_name"], organization=org, must_change_password=not o["password"])
            user.set_password(password)
            user.save()
        UserRole.objects.get_or_create(user=user, role=roles["Principal"], school=None)

        self.stdout.write(self.style.SUCCESS(f"Organization: {org.name} ({org.slug})  School: {school.name} ({school.code})"))
        self.stdout.write(self.style.SUCCESS(f"Principal: {email}"))
        if password and not o["password"]:
            self.stdout.write(self.style.WARNING(f"One-time password: {password}  (must be changed at first sign-in)"))
        self.stdout.write("Next: sign in, then add the academic year, classes, subjects and staff in Settings.")
