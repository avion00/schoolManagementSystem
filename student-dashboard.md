# Student Dashboard — Complete Build Plan (Student Role)

Authoritative plan of **everything to build for the Student role**: what a logged-in student can
view, submit, download, pay, and be notified about — each mapped to UI, RBAC permission code, REST
API endpoint, and current build status. Mirrors `principal-dashboard.md`.

## Legend

| Flag | Meaning |
|---|---|
| ✅ | Built & verified |
| 🟡 | Partially built (data/model exists; student-facing access or sub-feature missing) |
| ❌ | Not built yet (planned) |

- **API base:** `/api/v1/` · **Auth:** JWT in HttpOnly cookies.
- Student data is exposed only through **self-service `/me/*` endpoints** scoped to the logged-in
  student — never by passing another student's id (IDOR-safe, `principal-dashboard.md` security rule).

---

## ✅ Current state — UPDATED (core student portal is BUILT)

The student access layer + the four data-backed screens are **built and verified end-to-end**:

- `Student.user` OneToOne link ✅ (`backend/apps/students/models.py`); `/auth/me/` returns `is_student`.
- **Student role** seeded with `*.view.own` permissions (`seed_demo.py`); demo login
  `student@demo.school` linked to a real Student.
- **Self-service `/me/*` endpoints** ✅ (`backend/apps/portal/`): dashboard, profile (GET/PATCH),
  attendance (+summary), results (published only), fees (+summary) — each strictly scoped to the
  logged-in student.
- **Admin provisioning** ✅: `POST /students/{id}/create-login/` creates a portal login + assigns the
  Student role.
- **Student portal UI** ✅ (`frontend/src/routes/student/` + `StudentLayout`): the app auto-switches
  to the student layout when `is_student` is true.
- **Security verified:** student → staff endpoints (`/students/`, `/fees/invoices/`) return **403**;
  a non-student (principal) → `/me/*` returns **403**; `/me/*` only ever returns the caller's own data.

**Still pending (whole new modules):** Timetable, Assignments/LMS, Notices, Notifications, Library,
Transport/Hostel, Messaging, online fee payment — see §5, §7, §8, §10–13.

---

# 0. Foundation — Student Access Layer (build FIRST)

| # | Capability | What was built | Status |
|---|---|---|---|
| 0.1 | **Student ↔ User link** | `Student.user` OneToOne (`related_name="student_profile"`) + migration. | ✅ |
| 0.2 | **Student role + scoped permissions** | `Student` role seeded with `student.view.own`, `student.update.own`, `attendance.view.own`, `result.view.own`, `fee.view.own`. | ✅ |
| 0.3 | **Self-service `/me/*` endpoints** | `apps/portal` resolves `request.user.student_profile`; `HasStudentProfile` permission; own-data only. | ✅ |
| 0.4 | **Account provisioning** | `POST /students/{id}/create-login/` (`user.manage`) creates login + assigns Student role + temp password. | ✅ |
| 0.5 | **Guardian → children access** | Same pattern for parents (`Guardian.user` link + `/me/children/...`). | ❌ (next) |

**Security invariant for every `/me/*` endpoint:** derive the student from the JWT, never from a URL
id; return `404`/empty for anything not owned by the caller.

---

# 1. Student Dashboard Home

| Widget | Source endpoint | Status |
|---|---|---|
| My attendance % (term) | `GET /me/attendance/summary/` | ❌ |
| Today's timetable | `GET /me/timetable/?day=today` | ❌ (timetable module ❌) |
| Pending assignments | `GET /me/assignments/?status=pending` | ❌ (LMS ❌) |
| Latest results | `GET /me/results/?latest=1` | ❌ |
| Fee due / next due date | `GET /me/fees/summary/` | ❌ |
| Recent notices | `GET /me/notices/?limit=5` | ❌ (notices ❌) |
| Unread notifications | `GET /me/notifications/` | ❌ |

---

# 2. Navigation (Student sidebar)

```
Dashboard
My Profile          me.profile
Attendance          attendance.view.own
Timetable           timetable.view.own        (module ❌)
Results             result.view.own
Assignments         assignment.view.own       (module ❌)
Fees                fee.view.own
Notices             notice.view               (module ❌)
Library             library.view.own          (module ❌)
Transport / Hostel  transport.view.own        (module ❌)
Messages            message.send              (module ❌)
```

---

# 3. My Profile

| Capability | UI | RBAC code | API | Status |
|---|---|---|---|---|
| View own profile (name, DOB, class, roll, admission #, guardian) | Profile page | `student.view.own` | `GET /me/profile/` | 🟡 (data ✅, endpoint ❌) |
| View own documents/photo | Profile | `student.view.own` | `GET /me/documents/` | ❌ |
| Limited self-edit (phone, email, photo — if allowed) | Edit form | `student.update.own` | `PATCH /me/profile/` | ❌ |
| **Cannot** edit academic fields (class, roll, status) | — | — | enforced server-side | ❌ rule |

---

# 4. My Attendance

| Capability | RBAC code | API | Status |
|---|---|---|---|
| View own attendance (calendar/list) | `attendance.view.own` | `GET /me/attendance/` | 🟡 (Attendance model ✅; scoping ❌) |
| Monthly/term % summary | `attendance.view.own` | `GET /me/attendance/summary/` | ❌ |
| **Cannot** mark/change attendance | — | enforced | ❌ rule |

---

# 5. My Timetable  *(needs Timetable module — ❌)*

| Capability | RBAC code | API | Status |
|---|---|---|---|
| View own class timetable (weekly) | `timetable.view.own` | `GET /me/timetable/` | ❌ (no Timetable model yet) |
| Today's periods | `timetable.view.own` | `GET /me/timetable/?day=today` | ❌ |

---

# 6. My Results

| Capability | RBAC code | API | Status |
|---|---|---|---|
| View **published** results only | `result.view.own` | `GET /me/results/` | 🟡 (Mark/Exam ✅, `is_published` gate ✅; own-scoping endpoint ❌) |
| Mark sheet per exam | `result.view.own` | `GET /me/results/{exam_id}/` | ❌ |
| GPA / percentage / rank | `result.view.own` | computed | ❌ |
| Download report card (PDF) | `result.view.own` | `GET /me/results/{exam_id}/report-card/` | ❌ |
| Rechecking request | `result.recheck.request` | `POST /me/results/{id}/recheck/` | ❌ |
| **Cannot** see unpublished results or others' marks | — | enforced (`Exam.is_published`) | ✅ gate exists / ❌ scoping |

---

# 7. Assignments / Homework / Notes  *(needs LMS module — ❌)*

| Capability | RBAC code | API | Status |
|---|---|---|---|
| View assigned homework/assignments | `assignment.view.own` | `GET /me/assignments/` | ❌ |
| Download study notes/materials (signed URL) | `assignment.view.own` | `GET /me/materials/` | ❌ |
| **Submit** homework (file upload) | `assignment.submit` | `POST /me/assignments/{id}/submit/` | ❌ |
| View teacher feedback / marks / rubric | `assignment.view.own` | `GET /me/assignments/{id}/` | ❌ |
| Late-submission status | `assignment.view.own` | (field) | ❌ |

File-upload rules to enforce: size limit, type allow-list, AV scan, private signed URLs (Plan.md §7.10).

---

# 8. Notices / Announcements  *(needs Communication module — ❌)*

| Capability | RBAC code | API | Status |
|---|---|---|---|
| View school/class notices | `notice.view` | `GET /me/notices/` | ❌ |
| Mark as read | `notice.view` | `POST /me/notices/{id}/read/` | ❌ |

---

# 9. My Fees

| Capability | RBAC code | API | Status |
|---|---|---|---|
| View own invoices + status (unpaid/partial/paid) | `fee.view.own` | `GET /me/fees/` | 🟡 (Invoice ✅; own-scoping ❌) |
| View payment history / receipts | `fee.view.own` | `GET /me/fees/payments/` | ❌ |
| Download receipt (PDF) | `fee.view.own` | `GET /me/fees/payments/{id}/receipt/` | ❌ |
| **Pay online** (optional) | `fee.pay.own` | `POST /me/fees/{id}/pay/` (gateway) | ❌ (payments/gateway ❌) |
| **Cannot** alter invoices/payments | — | enforced | ❌ rule |

---

# 10. Library  *(needs Library module — ❌)*

| Capability | RBAC code | API | Status |
|---|---|---|---|
| View own issued books + due dates | `library.view.own` | `GET /me/library/` | ❌ |
| View fines | `library.view.own` | `GET /me/library/fines/` | ❌ |
| Search catalog | `library.view` | `GET /library/catalog/` | ❌ |

---

# 11. Transport / Hostel info  *(needs modules — ❌)*

| Capability | RBAC code | API | Status |
|---|---|---|---|
| View own route / stop / vehicle | `transport.view.own` | `GET /me/transport/` | ❌ |
| Live bus tracking (premium) | `transport.view.own` | `GET /me/transport/track/` | ❌ |
| View own hostel room / mess info | `hostel.view.own` | `GET /me/hostel/` | ❌ |

---

# 12. Messaging / Chat with teacher  *(optional — ❌)*

| Capability | RBAC code | API | Status |
|---|---|---|---|
| Message assigned teacher (if enabled) | `message.send` | `POST /me/messages/` | ❌ |
| View conversation threads | `message.view.own` | `GET /me/messages/` | ❌ |

---

# 13. Notifications  *(needs notification system — ❌)*

| Capability | API | Status |
|---|---|---|
| In-app notifications (absent, fee due, homework, result published, notice) | `GET /me/notifications/` | ❌ |
| Mark read | `POST /me/notifications/{id}/read/` | ❌ |

Background delivery (email/SMS/push) needs Celery + Redis (not installed) — code + interface buildable;
live delivery pending infra.

---

# 14. Security & Privacy — what a Student must NOT do (Plan.md §4.4, §22)

- ❌ View any other student's profile / attendance / marks / fees (enforce via `/me/*` scoping).
- ❌ Edit official academic records (marks, attendance, class, status).
- ❌ See unpublished results (`Exam.is_published=False`).
- ❌ Access admin/finance/management endpoints or any `*.view.all` / `*.manage` permission.
- ❌ Read another student's files (private signed URLs only).
- ✅ The Student role is granted **only** `*.view.own` + `assignment.submit` (+ optional message/pay).

---

# 15. RBAC Reference — Student permission codes

**Exists today:** `student.view.own` (code present, but no Student role uses it yet).

**To add (all ❌):**
`student.update.own`, `attendance.view.own`, `result.view.own`, `result.recheck.request`,
`timetable.view.own`, `assignment.view.own`, `assignment.submit`, `notice.view`,
`fee.view.own`, `fee.pay.own`, `library.view.own`, `transport.view.own`, `hostel.view.own`,
`message.send`, `message.view.own`.

**Student role grant set (target):** the `*.view.own` codes above + `assignment.submit`
(+ `fee.pay.own`, `message.send` if those features are enabled). Nothing else.

---

# 16. Implementation Status Summary & Build Order

## 16.1 Status roll-up

| Area | Underlying data | Student access (endpoint + UI) |
|---|---|---|
| Profile | ✅ | ✅ (`/me/profile/` + page, editable contact) |
| Attendance | ✅ | ✅ (`/me/attendance/` + summary + page) |
| Results | ✅ (+ publish gate ✅) | ✅ (`/me/results/`, published-only, + page) |
| Fees | ✅ | ✅ (`/me/fees/` + summary + page) |
| Timetable | ❌ | ❌ |
| Assignments / LMS | ❌ | ❌ |
| Notices | ❌ | ❌ |
| Library | ❌ | ❌ |
| Transport / Hostel | ❌ | ❌ |
| Messaging | ❌ | ❌ |
| Notifications | ❌ | ❌ |
| **Student login + role + scoping (§0)** | ✅ | ✅ |

**Bottom line:** the core student portal (login + profile + attendance + results + fees) is **built,
secured, and verified**. Remaining items each require building a whole new module (timetable, LMS,
notices, notifications, library, transport/hostel, messaging, online payment).

## 16.2 Build order (to make the Student dashboard real)

1. ~~**§0 Foundation** — `Student.user` link + `Student` role + `*.view.own` permissions + account
   provisioning.~~ ✅ **DONE**
2. ~~**Self-service `/me/*` read endpoints** — profile, attendance (+summary), results (published
   only), fees.~~ ✅ **DONE**
3. ~~**Student portal UI** — login → student layout + Dashboard, Profile, Attendance, Results, Fees.~~
   ✅ **DONE**
4. **Timetable module** → `/me/timetable/`. ← next
5. **Assignments / LMS module** (view + **submit** + feedback + file upload) → `/me/assignments/`.
6. **Notices / Communication** → `/me/notices/`.
7. **Notifications** (in-app first; email/SMS/push when Redis+Celery available).
8. **Library, Transport/Hostel** student views.
9. **Online fee payment** (needs gateway) + **Messaging** (optional).

> Parent/Guardian portal reuses the same §0 + `/me/*` pattern (guardian → children), and can be built
> immediately after the student portal.
