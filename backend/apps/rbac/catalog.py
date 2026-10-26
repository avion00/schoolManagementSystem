"""The permission catalog and default role templates — the single source of truth.

`sync_catalog` runs after every `migrate` (see RbacConfig.ready), so a permission
added here reaches every environment without re-seeding. Newly introduced codes
are also granted to existing roles whose template includes them (additive only:
customisations made by schools are never removed).
"""

PERMISSIONS = [
    ("student.view.all", "View all students", "student"),
    ("student.view.class", "View class students", "student"),
    ("student.create", "Create student", "student"),
    ("student.update", "Update student", "student"),
    ("student.delete", "Delete student", "student"),
    ("student.export", "Export students", "student"),
    ("attendance.take", "Take attendance", "attendance"),
    ("attendance.update", "Update attendance", "attendance"),
    ("attendance.report", "Attendance reports", "attendance"),
    ("exam.create", "Create exam", "exam"),
    ("exam.marks.enter", "Enter marks", "exam"),
    ("exam.marks.lock", "Lock marks", "exam"),
    ("exam.result.publish", "Publish results", "exam"),
    ("fee.view", "View fees", "fee"),
    ("fee.create", "Create fee", "fee"),
    ("fee.collect", "Collect fee", "fee"),
    ("fee.refund", "Refund fee", "fee"),
    ("fee.discount.approve", "Approve fee discount", "fee"),
    ("role.manage", "Manage roles", "rbac"),
    ("user.manage", "Manage users", "accounts"),
    ("report.view", "View reports", "reports"),
    ("settings.manage", "Manage settings", "settings"),
    ("academics.view", "View academic structure", "academics"),
    ("academics.manage", "Manage academic structure", "academics"),
    ("guardian.view", "View guardians", "guardian"),
    ("guardian.manage", "Manage guardians", "guardian"),
    ("teacher.view", "View teachers", "teacher"),
    ("teacher.manage", "Manage teachers", "teacher"),
    ("exam.view", "View exams", "exam"),
    ("audit.view", "View audit logs", "audit"),
    ("student.view.own", "View own student record", "student"),
    ("student.update.own", "Edit own profile", "student"),
    ("attendance.view.own", "View own attendance", "attendance"),
    ("result.view.own", "View own results", "exam"),
    ("fee.view.own", "View own fees", "fee"),
    ("student.promote", "Promote / change student status", "student"),
]

ROLE_PERMISSIONS = {
    "Principal": [code for code, _, _ in PERMISSIONS],  # everything
    "Teacher": [
        "student.view.class", "student.view.all", "attendance.take",
        "attendance.update", "attendance.report", "exam.marks.enter",
        "report.view", "academics.view", "guardian.view", "teacher.view",
        "exam.view",
    ],
    "Accountant": [
        "fee.view", "fee.create", "fee.collect", "fee.refund",
        "fee.discount.approve", "report.view",
    ],
    "Parent": [
        "student.view.own", "attendance.view.own", "result.view.own", "fee.view.own",
    ],
    "Student": [
        "student.view.own", "student.update.own",
        "attendance.view.own", "result.view.own", "fee.view.own",
    ],
}


def sync_catalog(**kwargs):
    from .models import Permission, Role, RolePermission

    created_codes = set()
    perms = {}
    for code, name, module in PERMISSIONS:
        perm, created = Permission.objects.update_or_create(
            code=code, defaults={"name": name, "module": module}
        )
        perms[code] = perm
        if created:
            created_codes.add(code)

    if not created_codes:
        return
    for role_name, codes in ROLE_PERMISSIONS.items():
        new_for_role = created_codes.intersection(codes)
        if not new_for_role:
            continue
        for role in Role.objects.filter(name=role_name, organization__isnull=False):
            for code in new_for_role:
                RolePermission.objects.get_or_create(role=role, permission=perms[code])
