# School Management SaaS

A modern, multi-tenant school management platform. This repository implements the
blueprints in [`BLUEPRINT-PREMIUM.md`](BLUEPRINT-PREMIUM.md) (commercial/SaaS layer)
and the core `school.md` spec.

> **Status: core school operations complete on the backend.** Multi-tenant data model,
> RBAC (roles, permissions, per-user overrides, class-scoped access), JWT-over-HttpOnly-cookie
> auth, audit logging with field diffs, and these modules:
>
> - **Academics**: years, classes (medium/shift/rooms), sections with capacity, subjects
>   with marking schemes, per-year curriculum, syllabus units
> - **Students & guardians**: several guardians per student, lifecycle history
>   (status changes, promotions), CSV export
> - **Teachers**: profiles, class assignments, staff attendance
> - **Attendance**: holiday calendar, edit window, registers, monthly sheets, reports
> - **Exams**: schedule with clash detection, component marks, results engine (grade,
>   GPA, ranks), report cards, admit cards
> - **Fees**: bulk billing, two-person discount approval, overdue tracking, ledger, reports
> - **Portals**: students (`/me/…`), parents (`/me/children/…`), teachers (`/me/teacher/…`)
>
> Every module is tenant-isolated, RBAC-guarded, soft-deleted and audit-logged through the
> shared `TenantModelViewSet`. Remaining work is tracked in
> [`docs/BACKEND-ROADMAP.md`](docs/BACKEND-ROADMAP.md).

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | Django 5.2 + Django REST Framework |
| Auth | SimpleJWT in HttpOnly cookies, refresh rotation + blacklist, Argon2 hashing |
| Realtime | Django Channels + Daphne (in-memory layer in dev; Redis via `REDIS_URL` in production) |
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
    academics/ students/ guardians/ teachers/ attendance/ exams/ fees/
                         domain modules (models, serializers, views, services)
    portal/              student / parent / teacher self-service endpoints
    reports/             dashboard aggregates
  tests/                 pytest suite (two-tenant fixtures)
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
python manage.py seed_rich      # optional: ~60 students, invoices, attendance, marks
python manage.py seed_exams     # optional: grade scale, exam rooms, paper timetable
python manage.py runserver 127.0.0.1:8000
```

Scheduled jobs (cron for now; Celery beat in Phase 3):
```bash
python manage.py mark_overdue_invoices        # daily: unpaid invoices past due -> overdue
python manage.py dispatch_scheduled_notices   # every few minutes: publish due notices + notify
python manage.py purge_orphan_files           # daily: remove uploads never attached to anything
```

### Tests and lint
```bash
pip install -r requirements/dev.txt
pytest                      # uses config.settings.test (in-memory SQLite)
ruff check .
python manage.py spectacular --validate --fail-on-warn --file /dev/null   # OpenAPI health
```

API base: `http://127.0.0.1:8000/api/v1/` · Swagger: `http://127.0.0.1:8000/api/docs/`
· Messaging WebSocket: `ws://127.0.0.1:8000/ws/messaging/` (`runserver` serves ASGI via Daphne)
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
| `student@demo.school` | Student portal (Liam Smith) | Greenwood Group |
| `parent@demo.school` | Parent portal (Robert Smith: Liam, Noah) | Greenwood Group |
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

