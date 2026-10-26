# Backend Roadmap

Plan for completing the Django/DRF backend. Status is kept up to date as work lands.

**Legend:** ✅ done · 🚧 in progress · ⬜ not started

## Guiding principles

- **The frontend is the contract.** Most of the 78 frontend pages run on mock data in
  `frontend/src/data/*.ts`. Those TypeScript types describe what the API must return.
- **Build on the existing foundation.** Every tenant module uses `TenantModelViewSet`, which
  provides tenant isolation, per-action RBAC, soft delete and audit logging.
- **Tests come with every change.** pytest runs with two-tenant fixtures so every module is
  checked for cross-tenant leaks.
- **Money and grades are never silently mutated.** Payments are reversed rather than edited,
  invoices are cancelled rather than deleted, and marks lock before results are published.
- **Work happens on one branch per phase or module**, committed locally until we decide to push.

---

## Phase 0: Hardening and test harness ✅

| Item | Status |
|---|---|
| pytest + pytest-django, test settings, two-tenant fixtures | ✅ |
| ruff linting, GitHub Actions CI (lint, migration check, tests) | ✅ |
| Dashboard reports gated by `report.view` / `fee.view` / `audit.view` | ✅ |
| Permission catalog lives in code (`apps/rbac/catalog.py`) and syncs on `migrate` | ✅ |
| Duplicate tenant-scoped values (admission number, codes…) return 400 instead of 500 | ✅ |
| RBAC privilege escalation blocked (role assignment, overrides, role edits, account takeover) | ✅ |
| Soft-deleted roles stop granting permissions | ✅ |
| Fees: positive amounts, no overpayment, immutable payments, server-assigned numbers, row locking | ✅ |
| Invoice items tenant-scoped (IDOR and 500 fixed), totals derived from items | ✅ |
| Exams: marks range and class checks, lock freezes marks and subjects, publish requires lock | ✅ |
| Auth: login throttling works, refresh refused for deactivated users | ✅ |
| Audit logs record before/after diffs | ✅ |
| Permission resolution memoised per request | ✅ |

## Phase 1: Finish existing modules to match the frontend

| Module | Scope | Status |
|---|---|---|
| Students and guardians | Several guardians per student (`StudentGuardian`, existing data migrated), extra guardian and student fields, server-assigned guardian codes and registration numbers, parent logins, **parent portal** (`/me/children/...`), status-change and promotion history, staff overview endpoint, CSV export. Document uploads move to the uploads work in Phase 2 | ✅ |
| Teachers | Profile and employment fields, teacher logins, `student.view.class` enforced (teachers see only their sections), one class teacher per section, staff attendance (bulk register, monthly sheet, summary), **teacher portal** (`/me/teacher/...`: dashboard, classes with attendance/marks progress, class roster, own attendance). Salary goes to the Payroll module | ✅ |
| Academics | Class metadata (code, medium, shift, status, building, room), section code/room/**capacity enforced** on enrolment and promotion, subject type/category/status/marking scheme, `ClassSubject` curriculum per year (exam papers default their marks from it), `SyllabusUnit` with teacher progress updates, class and subject overview endpoints, delete protection for in-use records | ✅ |
| Attendance | Holiday calendar, lock on past days, teacher limited to assigned sections, monthly sheet, student/class/teacher reports, analytics | ⬜ |
| Exams | Exam schedule (rooms, invigilators, conflict detection), bulk marks entry, computed grade/GPA/rank, report cards, admit cards | ⬜ |
| Fees | Bulk invoice generation from fee structures, discounts with approval, overdue job, student fee ledger, finance reports | ⬜ |
| API quality | OpenAPI schema with no warnings (portal and report views need response serializers), fix N+1 queries on the user list | ⬜ |

## Phase 2: New modules

| Module | Scope | Status |
|---|---|---|
| Timetable / class routine | Periods, shifts, rooms; conflicts by teacher, room and section | ⬜ |
| Notices and notifications | Audience targeting (role, class, section), read receipts, in-app notifications | ⬜ |
| Messaging | Conversations, groups, broadcasts, message requests, moderation, export; live delivery over WebSockets (Django Channels) | ⬜ |
| LMS | Homework and assignments, submissions, learning materials, validated file uploads | ⬜ |
| Finance operations | Expenses, vendors, payroll | ⬜ |
| Help desk | Tickets, assignment, SLA tracking, replies and activity | ⬜ |
| Settings and account | School profile, per-module settings, change and forgot password, session list and revoke | ⬜ |

## Phase 3: Production readiness

| Item | Status |
|---|---|
| Docker Compose with PostgreSQL, Redis and Celery | ⬜ |
| PostgreSQL row-level security as a second tenant-isolation layer | ⬜ |
| MFA and login lockout | ⬜ |
| Structured logging, Sentry, readiness checks | ⬜ |
| Backups | ⬜ |
| SaaS billing, entitlements and admissions CRM (`BLUEPRINT-PREMIUM.md`) | ⬜ |

## Open questions for the repo owner

- Should we stop tracking `backend/db.sqlite3` in git and rebuild it with `seed_demo` instead?
