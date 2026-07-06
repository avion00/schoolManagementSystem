"""Tenancy + identity models.

Organization is the paying tenant (a school or school group). Schools and
Branches live under an Organization. Users belong to an Organization (except the
platform owner, who spans all tenants).
"""
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from apps.core.models import BaseModel, TimeStampedModel, UUIDModel

from .managers import UserManager


class Organization(BaseModel):
    """Top-level tenant. Subscribes to the platform (billing added later)."""

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=120, unique=True)
    # Data-residency region (school.md / BLUEPRINT-PREMIUM §1.1).
    region = models.CharField(max_length=32, default="global")

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class School(BaseModel):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="schools"
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=32)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=32, blank=True)
    address = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "code"], name="uniq_school_code_per_org"
            )
        ]

    def __str__(self):
        return self.name


class Branch(BaseModel):
    school = models.ForeignKey(
        School, on_delete=models.CASCADE, related_name="branches"
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=32)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["school", "code"], name="uniq_branch_code_per_school"
            )
        ]

    def __str__(self):
        return self.name


class User(UUIDModel, AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    organization = models.ForeignKey(
        Organization, null=True, blank=True,
        on_delete=models.CASCADE, related_name="users",
    )
    # Platform owner (you) — spans all tenants; distinct from a school's super admin.
    is_platform_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    # Set when an admin force-resets the password; UI prompts a change at next login.
    must_change_password = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        ordering = ["email"]

    def __str__(self):
        return self.email

    def get_full_name(self):
        return self.full_name or self.email

    def get_short_name(self):
        return self.full_name.split(" ")[0] if self.full_name else self.email
