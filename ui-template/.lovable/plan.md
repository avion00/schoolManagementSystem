# Hermes — Role-Based Login & Creator Workspace

Add mock auth, role gating, and a full Creator workspace alongside the existing Admin prototype. No backend — everything runs in localStorage-backed React context.

## 1. Auth foundation (mock)

New files:
- `src/lib/hermes-auth.ts` — types (`Role = "admin" | "creator"`), demo users (2 admins, 4 creators, one disabled), mock credentials, session helpers.
- `src/components/hermes/AuthProvider.tsx` — context with `user`, `login`, `logout`, `switchRole` (prototype-only), persisted to localStorage.
- `src/routes/auth.tsx` — public login page: Hermes branding, email + password, Remember me, Forgot password link, Sign in button, error states (bad creds / disabled account), a "Demo logins" panel with one-click Admin and Creator buttons, and a persistent prototype "View as Admin / Creator" toggle.
- `src/routes/_authenticated.tsx` — pathless layout with `beforeLoad` that redirects to `/auth` when unauthenticated; picks Admin vs Creator shell based on `user.role`.

Wire `AuthProvider` in `__root.tsx` above `ProjectProvider`. Move every existing route under `_authenticated/` (rename files, keep contents) so admin pages stay gated.

## 2. Role gating

Extend `AppShell` sidebar groups to filter by role. Admin sees the full nav already built. Creator sees a compact new shell:
- My Work · Production Tasks · Revision Requests · Completed Work · My Profile · Logout

A creator hitting an admin-only URL is redirected to `/my-work`. Add `requireRole` helper used in `beforeLoad` of admin-only routes (opportunity, research, patterns, cmo, engagement, performance, accounts, calendar, system, settings, approvals list — creators only access their own task pages).

## 3. Creator mock data

Extend `src/lib/hermes-data.ts`:
- Add `assignments`: creator-facing view of production cards (project, title, type, due, priority, status, recipe id, inspiration links, admin comments, versions array with `{v, uploadedAt, note, thumbnail}`, audit trail).
- Statuses: `Assigned | In Production | Submitted for Review | Revision Requested | Resubmitted | Approved | Scheduled | Published`.
- Map ~6 assignments across the demo creators covering every status.

## 4. Creator routes (all under `_authenticated/creator/`)

- `my-work.tsx` — dashboard with sections: New assignments · Due soon · In production · Revision requests · Waiting approval · Recently approved. Assignment cards with Open Task button.
- `tasks.tsx` — full task list, filterable by status.
- `tasks.$id.tsx` — task detail: recipe (script, shots, presenter, wardrobe, location, props, camera, on-screen text, caption/CTA/hashtags, thumbnail brief, inspiration links, deadline, admin comments), upload area (mock drop zone + preview), reviewer note textarea, Save draft / Submit for approval. After submit: shows submitted version locked; new upload creates v+1. Version history strip. Status banner explains next step.
- `revisions.tsx` — filtered task list of `Revision Requested`.
- `completed.tsx` — approved + scheduled + published personal history.
- `profile.tsx` — read-only profile + logout.

## 5. Admin additions

- `settings.users.tsx` — Users & Roles table (name, email, role, projects, status, last login, active assignments, Manage). Manage drawer: create creator (name, email, temp password, projects, active toggle), reset password, deactivate, remove project access. Add link into existing Settings page.
- Extend `approvals.tsx` with filters: Project · Creator · Asset type · Submission date · Status · Due date.
- Extend `approvals.$id.tsx` with: creator name + submitted timestamp, version selector with previous versions, creator note, revision-instructions textarea (required when Request revision), internal review note field, side-by-side version compare toggle, approval writes approver + timestamp and routes to calendar (mock state update), auto-publish rule check against Accounts & Platforms status (Meta auto vs TikTok/X manual pack).
- Audit timeline component reused on both admin approval detail and creator task detail.

## 6. Visual / design

Reuse existing tokens (navy sidebar, ember accents, card-elevated, status color map). Creator shell mirrors admin styling but with simplified sidebar (fewer groups) and a distinct "Creator" workspace badge in the header. Login page uses `gradient-navy` background with an ember-accented card.

## Technical notes

- Pure client state; no server functions. `_authenticated` layout uses `ssr: false` to avoid SSR redirect issues.
- Route file moves: use `mv` for each existing `src/routes/*.tsx` → `src/routes/_authenticated/*.tsx` and update `createFileRoute` paths. `approvals.$id.tsx`, `research.$id.tsx` follow suit.
- Sidebar groups continue to render in AppShell but are filtered by role from context.
- Prototype role switcher is a small pill in the header (only when logged in) that toggles between the last-used admin and creator demo accounts — for stakeholder demos.
- All "publish/approve/notify" actions remain mock: toast + local state update, matching the existing prototype tone.
