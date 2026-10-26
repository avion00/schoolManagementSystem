# Roadmap

Plan for completing the platform end to end (backend, then wiring the frontend to it, then production). Status is kept up to date as work lands.

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

## Phase 1: Finish existing modules to match the frontend ✅

| Module | Scope | Status |
|---|---|---|
| Students and guardians | Several guardians per student (`StudentGuardian`, existing data migrated), extra guardian and student fields, server-assigned guardian codes and registration numbers, parent logins, **parent portal** (`/me/children/...`), status-change and promotion history, staff overview endpoint, CSV export. Document uploads move to the uploads work in Phase 2 | ✅ |
| Teachers | Profile and employment fields, teacher logins, `student.view.class` enforced (teachers see only their sections), one class teacher per section, staff attendance (bulk register, monthly sheet, summary), **teacher portal** (`/me/teacher/...`: dashboard, classes with attendance/marks progress, class roster, own attendance). Salary goes to the Payroll module | ✅ |
| Academics | Class metadata (code, medium, shift, status, building, room), section code/room/**capacity enforced** on enrolment and promotion, subject type/category/status/marking scheme, `ClassSubject` curriculum per year (exam papers default their marks from it), `SyllabusUnit` with teacher progress updates, class and subject overview endpoints, delete protection for in-use records | ✅ |
| Attendance | Holiday calendar (no attendance on holidays), no future dates, teachers limited to their own sections, edit window for past days (`ATTENDANCE_EDIT_WINDOW_DAYS`, bypassed by `attendance.manage.all`), section register, monthly sheet, student report, class comparison, stats (today, monthly rate, weekly change, 6-month trend). Absence alerts to guardians come with Notifications | ✅ |
| Exams | Exam codes/types/status, exam rooms, paper schedule (time, room, invigilators) with **clash detection** (room, invigilator, class), component marks (theory/practical/internal), non-overlapping grade bands with pass/fail, **results engine** (grade, GPA, pass/fail, class and section rank, incomplete detection) shared by staff and portals, bulk marks entry and marks sheet scoped to what the teacher teaches, publish blocked while marks are missing (`force` overrides), report card and admit card endpoints (JSON; the frontend prints them) | ✅ |
| Fees | Item quantity × unit price, fee structure frequency, **bulk invoice generation** per billing period (safe to re-run), **two-person discount approval** that reduces the amount payable, automatic overdue status plus `mark_overdue_invoices` command (run daily), student fee roster, **ledger** with running balance, reports (summary by method, collection trend, defaulters), more payment methods and who received each payment | ✅ |
| API quality | OpenAPI schema generates with 0 warnings and 0 errors (was 299 warnings, 108 errors) and is validated in CI. User list loads in a fixed number of queries (no per-row queries). Regression tests guard both | ✅ |

## Phase 2: New modules ✅

| Module | Scope | Status |
|---|---|---|
| Timetable / class routine | Period slots per shift (no overlaps, breaks), routine entries by section × day × period, **clash checks by clock time** (section slot, teacher, room, across shifts), weekly grids by section/teacher/room, conflict report, stats; weekly timetable and "today" (completed/ongoing/upcoming) for students, parents and teachers. Rooms are shared with exams | ✅ |
| Notices and notifications | Notices with drafts, scheduling (`dispatch_scheduled_notices`), publish/archive, audiences (role groups narrowed by class/section), pinning, expiry, read receipts and acknowledgements with recipient stats; in-app notification inbox (unread count, read, read-all, archive); automatic notifications for notice publish, **student absence → guardians**, results published → students and parents, discount decision → requester. Email/SMS delivery arrives with Celery (Phase 3) | ✅ |
| Messaging | Direct chats (one per pair), groups with permissions, **contact policy from real profiles** (students/parents reach only their own teachers directly, otherwise a message request the recipient approves, rejects or blocks), unread counts and seen status, 15-minute edits, soft delete, reactions, pins, reporting and moderation queue, conversation lock, audited admin view and export, broadcasts (recipients hidden from each other, optional replies), **live updates over WebSockets** (Channels, cookie-authenticated, origin-checked). Attachments arrive with the uploads work in LMS | ✅ |
| LMS | **Private file uploads** (size limit, extension allowlist, magic-byte content check, random storage names, permission-checked download with `nosniff` + sandbox CSP, audited, orphan purge job); assignments/homework (draft → publish → close, late policy, attachments, grading with feedback or return-for-changes); student submissions with To do / Late / Submitted / Graded / Missing status; learning materials (files or links); lesson plans with principal review; teachers limited to classes and subjects they teach; notifications to students and guardians on publish and grading | ✅ |
| Finance operations | Vendors with purchase/outstanding totals; expenses with receipts and **two-person approval** (pending → approved/rejected → paid, frozen once decided); salary structures (bank details visible only with `payroll.manage`); monthly **payroll runs** that deduct days absent in staff attendance, allow bonus/deduction adjustments, keep adjustments when regenerated, need approval by someone other than the preparer, and record paid salary expenses; teacher payslips in the portal; income vs expense summary | ✅ |
| Help desk | Tickets from any user (TKT codes, category, department, related student), **SLA first-response targets by priority** with on track / due soon / overdue / met / breached, public replies and agent-only internal notes, attachments, assignment to help desk staff, status workflow, resolve / close / reopen (7-day window for requesters), ratings, activity timeline, notifications, stats (open, overdue, unassigned, average first response, SLA met %) | ✅ |
| Settings and account | School profile with logo; organization settings (notifications, fees, attendance, exams, security, appearance) stored sparsely over code defaults and **validated** (unknown keys, types, ranges); attendance lock period and notification toggles take effect; **login lockout** from the security settings; profile edit; change password (signs out other devices); **forgot-password by email** (single-use links, same answer for unknown emails); **active sessions** with device/IP and immediate revocation (session id in the JWT) | ✅ |

## Phase 3: Frontend integration 🚧

The SPA was built on mock data (`frontend/src/data/*.ts`). Each module moves to a typed API
layer in `frontend/src/api/`: types generated from the backend's OpenAPI schema
(`npm run api:types`), TanStack Query hooks, and mappers from API responses to the shapes the
pages already use, with unit tests. A module's mock arrays are deleted when it's wired, so the
type-checker shows anything still using fake data.

| Module | Status |
|---|---|
| Foundation (generated types, HTTP helpers, Vitest, dev env) | ✅ |
| Students: list, details, add/edit form with guardians, photo, documents (upload/verify), status changes, CSV export | ✅ |
| Parents / guardians | 🚧 |
| Teachers | ⬜ |
| Classes, subjects, class routine | ⬜ |
| Attendance | ⬜ |
| Exams (schedule, grades, marks entry, results, report and admit cards) | ⬜ |
| Billing (fees, invoices, payments, expenses, payroll, vendors, reports) | ⬜ |
| Notices and notifications | ⬜ |
| Messages (REST + WebSocket) | ⬜ |
| Help desk | ⬜ |
| Settings, account, sessions | ⬜ |
| Dashboards (principal, accountant) | ⬜ |
| Student portal | ⬜ |
| Teacher portal | ⬜ |
| Parent portal (new pages) | ⬜ |

## Phase 4: Production readiness

| Item | Status |
|---|---|
| Docker Compose with PostgreSQL, Redis and Celery | ⬜ |
| PostgreSQL row-level security as a second tenant-isolation layer | ⬜ |
| MFA (login lockout is done, in settings/account) | ⬜ |
| Structured logging, Sentry, readiness checks | ⬜ |
| Backups | ⬜ |
| SaaS billing, entitlements and admissions CRM (`BLUEPRINT-PREMIUM.md`) | ⬜ |

### Known gaps (no backend yet, shown honestly in the UI)
- Student CSV **import**, transport and hostel, awards, teacher remarks.
- Student list loads all rows client-side (fine for a few thousand students); move to server-side
  pagination + a stats endpoint for very large schools.

## Open questions for the repo owner

- Should we stop tracking `backend/db.sqlite3` in git and rebuild it with `seed_demo` instead?
