# School Management SaaS

A modern, multi-tenant school management platform. This repository implements the
blueprints in [`BLUEPRINT-PREMIUM.md`](BLUEPRINT-PREMIUM.md) (commercial/SaaS layer)
and the core `school.md` spec.

> **Status: Foundation + Core SIS/Academics/Finance.** Built and verified end-to-end:
> multi-tenant data model, custom user, RBAC (roles + permissions + per-user overrides),
> JWT-over-HttpOnly-cookie auth with refresh rotation, audit logging, and a React + Vite
> SPA (login, dashboard, students page). Domain modules implemented so far:
>
> - **Academics** — academic years, class levels, sections, subjects
> - **Guardians** — parent/guardian records (multi-child)
> - **Students** — full CRUD with admission/roll uniqueness + status
> - **Teachers** — staff + class/subject assignments
> - **Attendance** — daily per-student + bulk class register
> - **Exams** — grade scales, exams, exam-subjects, marks, with **lock + publish** workflow
> - **Fees** — categories, structures, invoices, items, payments (no hard delete; **reversal**;
>   auto status recompute)
>
> Each module is tenant-isolated, RBAC-guarded, soft-deleted, and audit-logged via the
> reusable `TenantModelViewSet`. Remaining (not yet built): timetable, LMS/assignments,
> payroll, library, transport, hostel, inventory, communication/notifications, reports,
> admissions/CRM, online payments, MFA, backups.

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | Django 5.2 + Django REST Framework |
| Auth | SimpleJWT in HttpOnly cookies, refresh rotation + blacklist, Argon2 hashing |
| DB | SQLite by default (dev); PostgreSQL-ready via `DATABASE_URL` |
| API docs | drf-spectacular (OpenAPI 3 + Swagger UI) |
| Frontend | React 18 + Vite + TypeScript (TSX), React Router, TanStack Query |
| UI | Tailwind CSS + shadcn/ui components |

## Repository Layout

```
backend/                 Django project
  config/settings/       base / dev / prod settings
  apps/
    core/                base model mixins, tenant scoping, middleware, permissions
    accounts/            Organization / School / Branch + custom User + auth API
    rbac/                Permission / Role / assignments + permission resolution
    audit/               append-only AuditLog + record_audit()
frontend/                React + Vite SPA
  src/
    lib/                 api client (axios+refresh), auth provider
    components/ui/        shadcn/ui components
    routes/              LoginPage, DashboardPage
```

## Prerequisites

- Python 3.12+ and Node 18+ (tested on Python 3.13, Node 22)
- PostgreSQL optional (SQLite is the default for local dev)

## Backend — run

```bash
cd backend
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements/base.txt   # Windows
# source .venv/bin/activate && pip install -r requirements/base.txt # macOS/Linux

cp .env.example .env            # adjust if needed (SQLite works out of the box)
python manage.py migrate
python manage.py seed_demo      # demo org, roles, users
python manage.py runserver 127.0.0.1:8000
```

API base: `http://127.0.0.1:8000/api/v1/` · Swagger: `http://127.0.0.1:8000/api/docs/`
· Django admin: `http://127.0.0.1:8000/admin/`

### Use PostgreSQL instead of SQLite
Set in `backend/.env`:
```
DATABASE_URL=postgres://user:password@localhost:5432/school_saas
```

## Frontend — run

```bash
cd frontend
npm install
npm run dev        # http://127.0.0.1:5173
```

`frontend/.env` points the SPA at the API (`VITE_API_URL=http://127.0.0.1:8000/api/v1`).

## Demo accounts

All demo passwords: `Passw0rd!2024`

| Email | Role | Scope |
|---|---|---|
| `principal@demo.school` | Principal (all permissions) | Greenwood Group |
| `teacher@demo.school` | Teacher (subset) | Greenwood High |
| `accountant@demo.school` | Accountant (fees) | Greenwood High |
| `admin@platform.test` | Platform admin (superuser) | all tenants |

Create your own superuser: `python manage.py createsuperuser`.

## Auth flow

1. `POST /api/v1/auth/login/` → sets `access_token` (15 min) + `refresh_token` (7 d)
   HttpOnly cookies, returns the user with resolved roles + permissions.
2. The SPA reads the session via `GET /api/v1/auth/me/`.
3. On a 401, the axios interceptor calls `POST /api/v1/auth/refresh/` once and replays
   the request (refresh tokens rotate and old ones are blacklisted).
4. `POST /api/v1/auth/logout/` blacklists the refresh token and clears cookies.

## Security notes (current foundation)

- Passwords hashed with **Argon2**; JWTs in **HttpOnly** cookies (not localStorage).
- Permission checks enforced **server-side** (RBAC); the SPA only hides/shows UI.
- Tenant scoping via `organization` on records; **PostgreSQL Row-Level Security** is
  the planned hardening layer (see `BLUEPRINT-PREMIUM.md` §1.1) once on Postgres.
- `prod.py` enables HSTS, SSL redirect, secure cookies, and security headers.
- `npm audit` reports advisories in dev-only tooling (Vite/esbuild) — not shipped to
  production; review before a release.

## Next modules (roadmap)

Per `BLUEPRINT-PREMIUM.md` §10: SaaS billing + entitlements → Students/Academics →
Attendance → Admissions + CRM → Online payments → Exams → Integrations.

hey