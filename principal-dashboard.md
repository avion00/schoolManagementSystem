# Principal / Admin Dashboard — Complete Control Surface

Authoritative spec of **everything the Principal/Admin (and Super Admin) can do**: view, create,
edit, delete, assign roles/tasks, grant/revoke permissions, and approve. Each capability is mapped
to its UI surface, RBAC permission code, REST API endpoint, and current build status. This is the
blueprint we implement against.

## Legend

| Flag | Meaning |
|---|---|
| ✅ | Built & verified (backend API working) |
| 🟡 | Partially built (model/API exists; UI or sub-feature missing) |
| ❌ | Not built yet (planned) |

- **API base:** `/api/v1/` · **Auth:** JWT in HttpOnly cookies · **Docs:** `/api/docs/`
- Every capability is enforced **server-side** by RBAC + tenant isolation via
  `backend/apps/core/viewsets.py` (`TenantModelViewSet`) and `backend/apps/core/permissions.py`
  (`HasPermission`). The UI only hides/shows controls; the backend is the source of truth.
- Permission code format: `module.action.scope` (e.g. `student.view.all`).

## Roles in scope

| Role | Governs | Notes |
|---|---|---|
| **Super Admin (platform)** | All schools/orgs, billing, plans, platform settings, security, backups | `user.is_platform_admin = True`; spans tenants. Platform console ❌ pending. |
| **Principal / Admin** | One organization/school: people, academics, ops, exams, finance, settings, access | The main in-school controller. Has all in-school permissions. |

> Principal/Admin = full permission set **within their organization** (tenant-isolated).
> Super Admin = cross-tenant + platform operations. Sensitive Super Admin actions must be audit-logged
> (Plan.md §4.1).

---

# 1. Dashboard Home (Principal landing)

KPI widgets + quick actions. Data comes from per-module aggregation endpoints (most ❌ pending — to
build as `/reports/*` or `?summary=` endpoints).

| Widget | Source | Status |
|---|---|---|
| Total students (active) | `GET /students/?status=active` (count) | 🟡 (list exists; dedicated summary ❌) |
| Total teachers/staff | `GET /teachers/` (count) | 🟡 |
| Today's attendance % | `GET /attendance/?date=today` aggregate | ❌ |
| Fee collection (today/month) | `/reports/fees/collection/` | ❌ |
| Pending dues | `/reports/fees/due/` | ❌ |
| Exam performance snapshot | `/reports/exams/*` | ❌ |
| Pending approvals (discounts, marks, deletions) | approvals service | ❌ |
| Admissions pipeline | admissions/CRM module | ❌ |
| Payroll overview | payroll module | ❌ |
| Recent audit activity | `/audit/logs/` | ❌ (model ✅, viewer API ❌) |

Quick actions (permission-gated buttons): New student, Take attendance, Create exam, Generate
invoice, Post notice, Invite user.

---

# 2. Navigation (Principal sidebar)

Permission-gated menu tree (rendered from the user's `permissions[]` returned by `/auth/me/`):

```
Dashboard                       (all)
People
  ├─ Students                   student.view.*
  ├─ Guardians                  guardian.view
  ├─ Teachers                   teacher.view
  └─ Staff / Accountants        teacher.view / user.manage      ❌
Academics
  ├─ Academic Years             academics.view
  ├─ Classes & Sections         academics.view
  ├─ Subjects                   academics.view
  └─ Timetable                  academics.view                   ❌
Operations
  ├─ Attendance                 attendance.report / .take
  ├─ Notices / Communication    (comm.*)                         ❌
  └─ Homework / LMS             (lms.*)                           ❌
Exams
  ├─ Exams & Schedule           exam.view / exam.create
  ├─ Marks                      exam.marks.enter
  ├─ Grade Scales               exam.view
  └─ Results / Report Cards     exam.result.publish              🟡
Finance
  ├─ Fee Categories/Structures  fee.view / fee.create
  ├─ Invoices                   fee.view / fee.create
  ├─ Payments / Receipts        fee.collect
  ├─ Discounts / Scholarships   fee.discount.approve             🟡
  ├─ Expenses                   (expense.*)                      ❌
  └─ Payroll                    (payroll.*)                      ❌
Reports & Analytics             report.view                      ❌
Access Control
  ├─ Users                      user.manage                      ❌ API
  ├─ Roles & Permissions        role.manage                      🟡 (read-only)
  └─ Permission Overrides       role.manage                      ❌ API
Audit & Security                (audit.view)                     ❌ API
Settings (School)               settings.manage                  🟡
```

---

# 3. People Management

Capability rows: **Capability · UI · RBAC code · API · Status**

## 3.1 Students  (`backend/apps/students/`)

| Capability | UI | RBAC code | API | Status |
|---|---|---|---|---|
| View list (search/filter/paginate) | Students table | `student.view.all` | `GET /students/` | ✅ |
| Filter by class/section/status/gender | Table filters | `student.view.all` | `GET /students/?class_level=&section=&status=` | ✅ |
| View profile | Student detail | `student.view.all` | `GET /students/{id}/` | ✅ (UI ❌) |
| Create / admit | "New student" modal | `student.create` | `POST /students/` | ✅ |
| Edit | Edit form | `student.update` | `PATCH /students/{id}/` | ✅ (UI ❌) |
| Archive (soft delete) | Archive action | `student.delete` | `DELETE /students/{id}/` (soft) | ✅ (UI ❌) |
| Assign class/section/academic year | Form selects | `student.update` | `PATCH /students/{id}/` | ✅ |
| Assign guardian | Form select | `student.update` | `PATCH /students/{id}/` | ✅ |
| Promote / transfer | Promote wizard | `student.update` | bulk endpoint | ❌ |
| Bulk import (CSV/Excel) | Import dialog | `student.create` | `POST /students/import/` | ❌ |
| Export | Export button | `student.export` | `GET /students/export/` | ❌ |
| ID card generation | Print | `student.view.all` | `/students/{id}/id-card/` | ❌ |
| History timeline | Profile tab | `student.view.all` | `/students/{id}/timeline/` | ❌ |

Constraints enforced: admission number unique per org; roll number unique per class/section/year.

## 3.2 Guardians  (`backend/apps/guardians/`)

| Capability | RBAC code | API | Status |
|---|---|---|---|
| View list / search | `guardian.view` | `GET /guardians/` | ✅ |
| Create / edit / archive | `guardian.manage` | `POST/PATCH/DELETE /guardians/` | ✅ |
| See linked children | `guardian.view` | `children_count` field | ✅ |
| Create guardian login (parent portal) | `user.manage` | user-create endpoint | ❌ |

## 3.3 Teachers & Assignments  (`backend/apps/teachers/`)

| Capability | RBAC code | API | Status |
|---|---|---|---|
| View teachers / search | `teacher.view` | `GET /teachers/` | ✅ |
| Create / edit / archive teacher | `teacher.manage` | `POST/PATCH/DELETE /teachers/` | ✅ |
| Link teacher ↔ login account | `teacher.manage` + `user.manage` | `user` FK on Teacher | 🟡 (field ✅, user-create API ❌) |
| **Assign to class/section/subject** | `teacher.manage` | `POST /teacher-assignments/` | ✅ |
| Set class teacher | `teacher.manage` | `is_class_teacher` | ✅ |
| Remove assignment | `teacher.manage` | `DELETE /teacher-assignments/{id}/` | ✅ |
| Teacher workload report | `report.view` | `/reports/teacher-workload/` | ❌ |
| Leave / performance / docs | `teacher.manage` | (HR sub-models) | ❌ |

## 3.4 Staff / Accountant / Non-teaching staff

| Capability | Status / Note |
|---|---|
| Manage accountant access | Today: an accountant = a **User** + the **Accountant role** (see §5). Account creation API ❌. |
| Generic Staff/HR records (department, designation, salary, leave) | ❌ — only `Teacher` is modelled. A `Staff` model (or generalizing Teacher → Employee) is **pending**. |
| Payroll for staff | ❌ (payroll module pending) |

---

# 4. User Accounts & Access Control  (the "give permission / assign task" core)

**Built & verified** (`backend/apps/accounts/admin_views.py`, `backend/apps/rbac/views.py`). A
Users management UI (`frontend/src/routes/UsersPage.tsx`) lists/creates users, assigns roles, resets
passwords, and activates/deactivates.

| Capability | RBAC code | API | Status |
|---|---|---|---|
| List users in org (tenant-scoped, excludes platform admins) | `user.manage` | `GET /users/` | ✅ |
| **Create user** (teacher, accountant, receptionist…) | `user.manage` | `POST /users/` | ✅ (email invite 🟡) |
| Edit user profile | `user.manage` | `PATCH /users/{id}/` | ✅ |
| Activate / deactivate | `user.manage` | `DELETE /users/{id}/` (deactivate), `POST /users/{id}/activate/` | ✅ |
| Force password reset | `user.manage` | `POST /users/{id}/reset-password/` (sets `must_change_password`) | ✅ |
| View login history | `audit.view` | `GET /audit/logs/?actor=&action=auth.login` | 🟡 (audit log ✅; dedicated view ❌) |
| **Assign role** (scoped to school/branch) | `role.manage` | `POST /rbac/user-roles/` | ✅ |
| Remove role | `role.manage` | `DELETE /rbac/user-roles/{id}/` | ✅ |
| **Per-user permission override** (grant/revoke one perm) | `role.manage` | `POST/DELETE /rbac/permission-overrides/` | ✅ |
| List roles | `role.manage` | `GET /rbac/roles/` | ✅ |
| **Create / edit role** + set its permissions | `role.manage` | `POST/PATCH /rbac/roles/`, `POST /rbac/roles/{id}/permissions/` | ✅ |
| List permission catalog | `role.manage` | `GET /rbac/permissions/` | ✅ |

**Guardrails enforced (verified):** Principal sees only their org's users (never platform admins);
cannot create superusers/platform admins; cannot grant permissions they don't hold (role-permission
set + overrides); system roles are read-only; all changes audit-logged.

**Guardrails to implement:** a Principal cannot grant a permission they don't hold; cannot create
platform admins; role/permission changes are audit-logged (`permission.change`). Effective permissions
are resolved by `backend/apps/rbac/services.py:user_permission_codes()` (roles ∪ overrides).

---

# 5. Academic Setup  (`backend/apps/academics/`, grade scales in `apps/exams/`)

| Capability | RBAC code | API | Status |
|---|---|---|---|
| Academic years (CRUD, set current) | `academics.manage` | `/academics/academic-years/` | ✅ |
| Class levels (CRUD) | `academics.manage` | `/academics/class-levels/` | ✅ |
| Sections (CRUD, per class) | `academics.manage` | `/academics/sections/` | ✅ |
| Subjects (CRUD) | `academics.manage` | `/academics/subjects/` | ✅ |
| Grade scales & bands | `exam.create` | `/exams/grade-scales/`, `/exams/grade-bands/` | ✅ |
| Timetable (periods, rooms, conflicts) | `academics.manage` | `/timetable/*` | ❌ |
| Syllabus / lesson plans | `academics.manage` | `/academics/syllabus/` | ❌ |
| Promotion rules | `academics.manage` | — | ❌ |

---

# 6. Daily Operations

## 6.1 Attendance  (`backend/apps/attendance/`)

| Capability | RBAC code | API | Status |
|---|---|---|---|
| View attendance (filter date/status/student) | `attendance.report` | `GET /attendance/` | ✅ |
| Take attendance (single) | `attendance.take` | `POST /attendance/` | ✅ |
| **Take class register (bulk)** | `attendance.take` | `POST /attendance/bulk/` | ✅ |
| Correct/update | `attendance.update` | `PATCH /attendance/{id}/` | ✅ |
| Attendance after lock-date → approval | `attendance.update` | approval flow | ❌ |
| Monthly %/low-attendance reports | `attendance.report` | `/reports/attendance/*` | ❌ |
| Parent absence notification | (comm.*) | notification job | ❌ |

## 6.2 Communication / Notices, 6.3 Homework / LMS — ❌ (modules pending; see Plan.md §7.10, §7.17)

---

# 7. Exams & Results  (`backend/apps/exams/`)

| Capability | RBAC code | API | Status |
|---|---|---|---|
| Create/edit exam | `exam.create` | `/exams/exams/` | ✅ |
| Define exam-subjects (full/pass marks, date) | `exam.create` | `/exams/exam-subjects/` | ✅ |
| Oversee marks entry | `exam.view` / `exam.marks.enter` | `/exams/marks/` | ✅ |
| **Lock / unlock marks** | `exam.marks.lock` | `POST /exams/exams/{id}/lock/` `/unlock/` | ✅ |
| **Publish / unpublish results** | `exam.result.publish` | `POST /exams/exams/{id}/publish/` `/unpublish/` | ✅ |
| Marks-entry blocked once locked | (enforced in serializer) | — | ✅ |
| Report cards / mark sheets / transcripts | `exam.view` | `/exams/{id}/report-cards/` | ❌ |
| Rank / GPA / statistics | `exam.view` | `/reports/exams/*` | ❌ |
| Marks-correction approval (after publish) | `exam.result.publish` | approval flow | ❌ |

---

# 8. Finance  (`backend/apps/fees/`)

| Capability | RBAC code | API | Status |
|---|---|---|---|
| Fee categories (CRUD) | `fee.create` | `/fees/fee-categories/` | ✅ |
| Fee structures (CRUD) | `fee.create` | `/fees/fee-structures/` | ✅ |
| Invoices (create, items, view) | `fee.create` / `fee.view` | `/fees/invoices/`, `/fees/invoice-items/` | ✅ |
| Record payment | `fee.collect` | `POST /fees/payments/` | ✅ |
| Auto status recompute (unpaid→partial→paid) | — | (model) | ✅ |
| **Reverse payment** (no hard delete) | `fee.refund` | `POST /fees/payments/{id}/reverse/` | ✅ |
| **Cancel invoice** (with reason) | `fee.create` | `POST /fees/invoices/{id}/cancel/` | ✅ |
| Discount / scholarship **approval** | `fee.discount.approve` | approval flow | 🟡 (code exists; workflow ❌) |
| Receipts (PDF) | `fee.view` | `/fees/payments/{id}/receipt/` | ❌ |
| Expenses / ledger | (expense.*) | `/fees/expenses/` | ❌ |
| Payroll | (payroll.*) | `/payroll/*` | ❌ |
| Financial reports (collection, dues, P/L) | `report.view` | `/reports/fees/*` | ❌ |

**Rule enforced (Plan.md §7.11):** financial records are never hard-deleted — payments reverse,
invoices cancel; both audit-logged.

---

# 9. Approvals & Workflows the Principal drives  (Plan.md §14)

| Workflow | Flow | Status |
|---|---|---|
| Fee discount/scholarship | Accountant requests → **Principal approves** → applied + audit + receipt | ❌ (approval engine) |
| Marks correction (post-publish) | Teacher requests → Exam controller reviews → **Principal approves** → update + audit | ❌ |
| Student deletion | Admin marks inactive → **Principal approves** → archived (data retained) | 🟡 (soft delete ✅; approval routing ❌) |
| Payroll | HR prepares → Accountant verifies → **Principal approves** → paid + payslip | ❌ |
| Exam lock/publish | Principal/Exam controller locks then publishes | ✅ (the working example) |

Build target: a generic `ApprovalRequest` model (type, payload, requester, approver, status, reason)
+ audit, reused across all flows.

---

# 10. Reports & Analytics  (Plan.md §15) — ❌ pending

Student (class list, admission, dropout, guardian contacts), Attendance (daily/monthly/low),
Exam (mark sheet, result summary, top/failed, transcript), Finance (collection, dues, discount,
expense, payroll, P/L, ledger), Admin (teacher workload, class strength, login activity, audit).
Export: PDF / Excel / CSV / print.

---

# 11. Settings (School)  (`backend/apps/accounts/` for School/Branch)

| Capability | RBAC code | Status |
|---|---|---|
| School profile (logo, address, contact, reg/PAN) | `settings.manage` | 🟡 (School model ✅; settings API/UI ❌) |
| Branches (CRUD) | `settings.manage` | 🟡 (Branch model ✅; API ❌) |
| Academic config / working days / holidays | `settings.manage` | ❌ |
| Grading & fee rules | `settings.manage` | 🟡 |
| ID card / certificate templates | `settings.manage` | ❌ |
| SMS / email / notification settings | `settings.manage` | ❌ |

---

# 12. Audit & Security  (`backend/apps/audit/`)

| Capability | RBAC code | API | Status |
|---|---|---|---|
| Audit log writes (login, CRUD, lock/publish, reverse, cancel, access changes) | — | `record_audit()` | ✅ |
| **View audit log** (who/what/when/changes/IP) | `audit.view` | `GET /audit/logs/` (filter `action`, `actor`; search) | ✅ |
| Login history | `audit.view` | `GET /audit/logs/?action=auth.login` | 🟡 |
| Permission-change log | `audit.view` | `GET /audit/logs/?action=role.permissions.set` etc. | ✅ |

---

# 13. Super Admin (Platform) Capabilities  (Plan.md §4.1, BLUEPRINT-PREMIUM §1.6)

| Capability | API | Status |
|---|---|---|
| Manage schools / orgs / branches (all tenants) | `/platform/organizations/` | ❌ |
| Subscriptions & plans, feature access/gating | `/platform/plans/` | ❌ |
| Manage all users across tenants | `/platform/users/` | ❌ |
| Global system settings | `/platform/settings/` | ❌ |
| Security logs, system health, maintenance mode | `/platform/*` | ❌ |
| Backups (trigger/restore) | `/platform/backups/` | ❌ |
| Platform announcements | `/platform/announcements/` | ❌ |
| **Impersonate a tenant user** (audit-logged) | `/platform/impersonate/` | ❌ |
| `is_platform_admin` flag + implicit full access | (on `User`) | ✅ |

Platform console is a separate area above all tenants; only the `is_platform_admin` flag exists today.

---

# 14. RBAC Reference

## 14.1 Permission catalog (from `seed_demo.py`)

`student.view.own` · `student.view.class` · `student.view.all` · `student.create` · `student.update`
· `student.delete` · `student.export` · `attendance.take` · `attendance.update` · `attendance.report`
· `exam.create` · `exam.view` · `exam.marks.enter` · `exam.marks.lock` · `exam.result.publish`
· `fee.view` · `fee.create` · `fee.collect` · `fee.refund` · `fee.discount.approve`
· `academics.view` · `academics.manage` · `guardian.view` · `guardian.manage` · `teacher.view`
· `teacher.manage` · `role.manage` · `user.manage` · `report.view` · `settings.manage`

**To add:** `audit.view`, `expense.*`, `payroll.*`, `comm.*` (notices/messaging), `lms.*`,
`timetable.*`, `library.*`, `transport.*`, `hostel.*`, `inventory.*`, `admission.*`.

## 14.2 Role → permission matrix (seeded)

| Permission group | Principal | Teacher | Accountant |
|---|:---:|:---:|:---:|
| student.* | all | view.class/all | — |
| attendance.* | all | take/update/report | — |
| exam.* | all | view + marks.enter | — |
| fee.* | all | — | view/create/collect/refund/discount.approve |
| academics / guardian / teacher (view) | all | view | — |
| role.manage / user.manage / settings.manage | ✅ | — | — |
| report.view | ✅ | ✅ | ✅ |

(Principal = every permission in the org. Super Admin = implicit all, cross-tenant.)

---

# 15. Implementation Status Summary & Build Order

## 15.1 Status roll-up

| Domain | Backend | Frontend |
|---|---|---|
| Auth, RBAC core, tenancy, audit writes | ✅ | login ✅ |
| Students / Guardians / Teachers / Academics | ✅ | students 🟡, rest ❌ |
| Attendance | ✅ | ❌ |
| Exams (+ lock/publish) | ✅ | ❌ |
| Fees (+ reverse/cancel) | ✅ | ❌ |
| **User/Role/Permission management APIs** | ✅ | ✅ (Users page) |
| Audit viewer | ✅ | 🟡 (dashboard recent activity) |
| **Dashboard summary aggregations** | ✅ | ✅ (widgets) |
| Approvals engine | ❌ | ❌ |
| Settings / School setup | 🟡 | ❌ |
| Reports & analytics | 🟡 (dashboard summary) | 🟡 |
| Timetable, LMS, Communication | ❌ | ❌ |
| Payroll, Library, Transport, Hostel, Inventory | ❌ | ❌ |
| Super Admin platform console | ❌ | ❌ |

## 15.2 Recommended build order (to make the Principal dashboard real)

1. ~~**Access control APIs** (§4): user CRUD, role create/edit + set permissions, assign role,
   per-user overrides, activate/deactivate.~~ ✅ **DONE** (backend + Users UI).
2. ~~**Principal dashboard aggregation endpoints** (§1) + dashboard UI widgets.~~ ✅ **DONE**
   (`/dashboard/summary/` + widgets).
3. **Frontend management pages** for already-built backends: Teachers, Attendance register,
   Marks entry, Fee collection/invoices (reuse the Students-page pattern). ← next
4. ~~**Audit viewer** (§12) — read API.~~ ✅ API done; dedicated UI page pending.
5. **Approvals engine** (§9) — generic `ApprovalRequest` + the 4 flows.
6. **Settings / School setup** (§11).
7. **Reports & analytics** (§10) + PDF/Excel export.
8. Remaining modules: Timetable, LMS, Communication/Notifications, Payroll, Library, Transport,
   Hostel, Inventory.
9. **Super Admin platform console** (§13).
