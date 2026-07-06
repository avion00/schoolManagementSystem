# Premium / Commercial Blueprint — Multi-Tenant School Management SaaS

> **This document extends [school.md](../media1/c/Desktop/school.md), it does not replace it.**
> The original blueprint defines the *core product* (SIS + ERP + LMS + admin): students,
> guardians, teachers, attendance, timetable, exams, basic fees, library, transport, hostel,
> inventory, communication, reports, audit. Those modules remain valid as written.
>
> This document adds the **business and experience layers** that turn that core into a
> modern, premium product you can **sell to many schools as Software-as-a-Service**.

## Product Decisions (locked)

| Decision | Choice |
|---|---|
| Commercial model | **Multi-tenant SaaS** — one platform, many schools |
| Target market | **Global / multi-region** — Stripe, multi-currency, GDPR/FERPA, data residency |
| Deep differentiators | **Admissions + CRM** and **Integrations & Payments** |
| Positioning | Premium, professional, white-labelable; sold by subscription |

## How This Reframes the Original Blueprint

`school.md` treats multi-tenancy as "add `school_id` to most tables." That is correct but
insufficient for a commercial SaaS. The shift in mindset:

- The customer is no longer *a school* — it is an **Organization** (which may own several
  schools/branches) that **pays a subscription**.
- Every feature must be **gated by the plan the organization bought**.
- The platform owner (you) needs a **control plane** above all tenants.
- "Fees" now means **two different money flows**: (1) the school collecting fees from
  parents (tenant revenue) and (2) you collecting subscriptions from schools (platform
  revenue). These must never be conflated.

---

# 1. SaaS Commercialization Layer

This is the layer that makes it a product instead of a project. Build **Phase 0** before
the existing roadmap's Phase 1.

## 1.1 Tenancy Model

```txt
Platform (you)
  └── Organization        ← the paying customer (a school or a school group/chain)
        └── School         ← existing concept from school.md
              └── Branch
                    └── Academic Year → Classes / Students / Teachers ...
```

**Isolation strategy — shared database with Row-Level Security (RLS):**

- Every tenant-scoped table carries `org_id` (and `school_id` as today).
- PostgreSQL **RLS policies** enforce isolation at the database layer, not just in app code.
  Even a buggy query or a forgotten `.filter()` cannot leak across tenants.
- The app sets the current tenant per request (e.g. `SET app.current_org = '<uuid>'`); RLS
  policies compare against it.
- **Enterprise option:** schema-per-tenant or dedicated database for large clients that
  demand hard isolation — same codebase, different connection routing.

**Data residency (global market):** each Organization is pinned to a **region** (e.g. EU,
US, APAC). Region determines the database cluster and the S3 bucket region. This is the
foundation for GDPR data-residency commitments.

> This supersedes the "add school_id everywhere" advice in `school.md` §6 — keep `school_id`,
> but add `org_id` and enforce isolation with RLS, not app code alone.

## 1.2 Subscription & Billing (Platform Side)

Use **Stripe Billing** (global, multi-currency, handles tax).

- **Plans:** Trial → Starter → Pro → Enterprise (see §1.7 pricing table).
- **Pricing metrics:** per active student (most common for SIS SaaS) or per seat; annual or
  monthly with proration.
- **Lifecycle:** free trial (no card or card-required), upgrade/downgrade with proration,
  **dunning** (failed-payment retries + email sequence), cancellation, win-back.
- **Tax:** **Stripe Tax** for VAT/GST/sales tax across regions.
- **Invoices & receipts:** Stripe-hosted; mirrored into the platform admin console.

**Critical separation of concerns:**

| Money flow | Who pays whom | Tooling |
|---|---|---|
| **Subscription** (platform revenue) | Organization → You | Stripe Billing |
| **School fees** (tenant revenue) | Parents → School | Payment abstraction in §3 |

These use different Stripe accounts/connect setups and different data models. Do not reuse
the fee module for subscriptions.

## 1.3 Entitlements / Feature Gating

A plan is meaningless unless features actually lock. Model it explicitly:

```txt
Plan                 (Starter, Pro, Enterprise)
PlanFeature          (plan_id, feature_key, enabled, limit)
OrganizationPlan     (org_id, plan_id, status, trial_ends_at, current_period_end)
UsageCounter         (org_id, metric, value, period)   ← students, storage_gb, sms, ai_credits
```

- **Feature flags by plan:** `admissions_crm`, `online_payments`, `public_api`, `sso`,
  `white_label`, `ai_assistant`, etc. Checked on the **backend** (decorator/permission
  class) and reflected in the UI (hide/disable + upsell prompt).
- **Quota enforcement:** max students, storage GB, monthly SMS/WhatsApp/AI credits. Soft
  limits warn; hard limits block with an upgrade CTA.
- **Metered add-ons:** overage on SMS/WhatsApp/AI/storage reported to Stripe as usage.

This complements (does not replace) the RBAC permission system in `school.md` §5:
**RBAC decides what a _user_ may do; entitlements decide what an _organization_ has bought.**
Both checks must pass.

## 1.4 Self-Serve Onboarding Wizard

Target **time-to-value < 15 minutes**:

```txt
1. Sign up (email/SSO) → create Organization
2. School setup (name, logo, address, academic year, calendar)
3. Import data (students/teachers via guided CSV/Excel with validation preview)
4. Invite users (admins, teachers) with role pre-assignment
5. Optional: seed demo data so the dashboards aren't empty
6. Land on a checklist-driven dashboard ("3 of 7 steps complete")
```

Reuse the bulk-import validation already called for in `school.md` §13.

## 1.5 White-Labeling

- Per-tenant **theme tokens** (logo, primary/secondary colors, favicon) driving the design
  system in §6.
- **Custom domain**: `portal.springfield.edu` via CNAME, with **automated TLS** (ACME).
- **Branded email**: custom sender domain with SPF/DKIM/DMARC so transactional mail isn't
  "from us."
- Branded PDF templates (ID cards, certificates, report cards, offer letters, receipts).

## 1.6 Platform Admin Console (Control Plane)

A separate app/area for **you**, the platform owner — distinct from the per-school Super
Admin in `school.md` §4.1.

```txt
Tenant lifecycle: create / suspend / cancel / restore
Secure impersonation ("log in as") — always audit-logged, time-boxed, consent-flagged
Usage & churn dashboards (MRR, ARR, active students, trial conversion, churn)
Plan management & manual overrides / discounts
Feature-flag rollout (per tenant, per plan, gradual %)
Status page + SLA + scheduled maintenance windows
Platform-wide security & error monitoring
```

## 1.7 Pricing & Packaging

Every gated feature in §1.3 must appear in exactly one tier here (verification rule).

| Capability | Trial | Starter | Pro | Enterprise |
|---|:---:|:---:|:---:|:---:|
| Core SIS (students/teachers/classes) | ✅ | ✅ | ✅ | ✅ |
| Attendance, timetable, exams | ✅ | ✅ | ✅ | ✅ |
| School fee management | ✅ | ✅ | ✅ | ✅ |
| **Online fee payments** | — | add-on | ✅ | ✅ |
| Communication (email/in-app) | limited | ✅ | ✅ | ✅ |
| SMS / WhatsApp | — | metered | metered | metered |
| **Admissions + CRM** | — | — | ✅ | ✅ |
| LMS / assignments / online exams | — | ✅ | ✅ | ✅ |
| **Public API + webhooks** | — | — | ✅ | ✅ |
| **SSO (SAML/OIDC)** | — | — | — | ✅ |
| **White-label + custom domain** | — | — | add-on | ✅ |
| **AI assistant & insights** | — | — | metered | ✅ |
| Data residency choice | — | — | — | ✅ |
| SLA + priority support | — | — | — | ✅ |
| Max students | 50 | 500 | 5,000 | unlimited |

Metered add-ons: SMS/WhatsApp credits, AI usage, extra storage.

---

# 2. Admissions + CRM Engine  *(priority differentiator — specified in depth)*

This is a *revenue-generating* module for schools (it fills seats) and a top reason they buy
premium. It is the front door to the student lifecycle that `school.md` only picks up *after*
a student already exists.

## 2.1 Public Admission Microsite

A white-labeled public site per school: programs offered, fee summary, FAQs, key dates, and
a prominent **Apply** CTA. SEO-friendly, mobile-first, on the school's custom domain (§1.5).

## 2.2 Lead Capture & Attribution

- Sources: embedded web forms, landing pages, walk-in entry, phone enquiry, referral, bulk
  import.
- **UTM + source attribution** on every lead so marketing ROI is measurable.
- De-duplication on email/phone.

## 2.3 CRM Pipeline (Kanban + List)

```txt
Enquiry → Application → Document Verification → Entrance Test / Interview
        → Offer → Payment → Enrolled
        (side states: Waitlisted, Rejected, Lost)
```

- Drag-and-drop Kanban **and** filterable list/table views.
- **Counselor assignment** with workload balancing.
- **SLAs & follow-up tasks/reminders** (e.g. "contact within 24h").
- Per-lead **activity timeline**: calls, emails, notes, status changes, document uploads.

## 2.4 Application Intake

- **Dynamic application form builder** — schools define custom fields per program/year.
- Document upload (birth certificate, prior transcripts, photo) with the same AV-scan +
  signed-URL rules as `school.md` §7.10 / §11.6.
- **Online application fee payment** via the payment abstraction in §3.
- Auto-generated application number.

## 2.5 Selection Workflow

- Entrance test / interview **scheduling** (slots, capacity).
- **Scorecards** and weighted scoring.
- **Merit list** generation; **waitlist** with automatic promotion when a seat frees.

## 2.6 Offer & Enrollment Conversion

- Templated **offer-letter PDF** (optional e-signature).
- Seat confirmation via **deposit payment**.
- **One-click conversion: enrolled applicant → Student record** — no re-keying. This writes
  into the existing Student/Guardian models from `school.md` §7.3–7.4 and provisions guardian
  login + welcome sequence.

## 2.7 Drip Communication

Automated **email / SMS / WhatsApp sequences** (e.g. "application incomplete," "test
reminder," "offer expiring"), reusable templates, and bulk messaging — all routed through
the comms providers in §3.2 and the queue in §4.

## 2.8 Admissions Analytics

Funnel conversion by stage, **source ROI**, counselor performance, intake forecast vs.
capacity, and geographic distribution of applicants.

## 2.9 Data Models (new)

```txt
Lead                (org_id, school_id, source, utm_*, status, owner_id, contact info)
Enquiry             (lead_id, program_id, notes)
Application         (lead_id, application_no, program, academic_year_id, status, fee_status)
ApplicationForm     (school_id, program_id, version)
ApplicationFormField(form_id, key, label, type, required, options)
PipelineStage       (school_id, name, order, sla_hours)
Activity            (application_id, type, payload, actor_id, created_at)     ← timeline
Task                (application_id, owner_id, due_at, status)                ← follow-ups
OfferLetter         (application_id, template_id, pdf_url, signed_at)
AdmissionPayment    (application_id, payment_id → §3, type=application|deposit)
MeritList           (school_id, program_id, academic_year_id, entries[])
```

All carry `org_id` + `school_id` and obey RLS (§1.1) and audit logging (`school.md` §7.19).

---

# 3. Integrations & Payments  *(priority differentiator — specified in depth)*

## 3.1 Payments Abstraction

A provider-agnostic interface so the product is not locked to one gateway or region:

```txt
interface PaymentProvider:
    create_payment_intent(amount, currency, metadata, idempotency_key)
    capture / authorize
    refund(payment_id, amount?)         ← partial supported
    create_payment_link(...)
    save_payment_method / charge_saved
    handle_webhook(event)               ← verified signature
```

- **Default provider: Stripe** (global, multi-currency). Pluggable regional providers added
  later without touching callers.
- **PCI scope:** use **hosted fields / tokens only** — card data never touches our servers,
  keeping the platform at **PCI SAQ-A** (lowest burden).
- **Used for:** school fee collection, application fees (§2.4), enrollment deposits (§2.6).
- **Robustness:** **idempotency keys** on every charge, **webhook-driven reconciliation**
  (never trust the client redirect), refunds/partial refunds, payment links, saved methods,
  auto-pay/mandates for recurring fees, settlement & payout reports.

> Reinforces `school.md` §7.11's rule "do not physically delete financial records" — all
> payment state transitions are append-only and reconciled against gateway webhooks.

## 3.2 Communication Providers (pluggable)

| Channel | Default provider | Notes |
|---|---|---|
| Email | Amazon SES / SendGrid | branded sender domain (§1.5) |
| SMS | Twilio / Vonage | metered credits (§1.3) |
| WhatsApp | WhatsApp Business API | template approval required |
| Push | FCM / APNs | for PWA + future native apps |

All behind a `NotificationProvider` interface; all dispatched via Celery (§4), never inline
in the request — consistent with `school.md` §16.

## 3.3 Enterprise SSO & Auth

- **SAML 2.0 + OIDC** for staff (Google Workspace, Microsoft Entra ID) — Enterprise tier.
- **Social login** (Google/Apple) for parents/students — lower friction.
- SCIM user provisioning (Enterprise, later).
- Layers on top of the auth security already in `school.md` §7.2 / §11.1 (MFA, refresh
  rotation, HttpOnly cookies).

## 3.4 Productivity & Classroom Integrations

- **Online classes:** create Zoom / Google Meet / Microsoft Teams meetings directly from the
  timetable and LMS.
- **Calendar sync:** two-way Google/Outlook + read-only iCal feeds (timetable, exams, events).
- **Accounting export:** QuickBooks / Xero / Tally connectors + journal CSV for the finance
  module in `school.md` §7.11.

## 3.5 Public API + Webhooks (Pro/Enterprise)

This makes the platform a *platform*:

- **Auth:** per-tenant API keys and OAuth2 client-credentials, **scoped** to entitlements and
  RBAC, **rate-limited** per key.
- **Webhooks:** tenant-defined subscriptions, **HMAC-signed** payloads, automatic **retries
  with backoff** and a dead-letter view. Backed by the **outbox pattern** (§4) for at-least-
  once delivery.
- **Event catalog:** `student.created`, `payment.succeeded`, `application.enrolled`,
  `invoice.overdue`, `result.published`, ...
- **Developer portal:** OpenAPI docs (§4), sandbox keys, usage logs.

## 3.6 Hardware & Device Integrations

- Biometric / RFID **ingestion API** for attendance and gate-pass.
- Barcode / QR generation & scanning for ID cards, library issue/return, attendance, and
  visitor gate-pass.

---

# 4. Modern Architecture Upgrades

Keep the **modular monolith** (Django/DRF) from `school.md` §2 — but add:

- **API contract:** DRF + **OpenAPI 3** via `drf-spectacular`, versioned `/api/v1`, **cursor
  pagination**, idempotency on money-touching writes.
- **Real-time:** Django Channels / WebSockets for notifications, live attendance, and chat.
- **Reliability:** domain events + **transactional outbox** for integrations/webhooks;
  **Celery + Celery Beat** for scheduled jobs (fee reminders, digests, drip sequences) with
  dead-letter handling.
- **Search:** PostgreSQL full-text search now → OpenSearch at scale.
- **Caching:** Redis with **per-tenant cache keys** (never share cache across orgs).
- **Files:** S3 with **per-tenant prefixes**, signed URLs, **antivirus scan on upload**
  (extends `school.md` §11.6).
- **Frontend:** **React (Vite) SPA** + TypeScript (TSX) + React Router + Tailwind +
  **shadcn/ui design system**, TanStack Query, React Hook Form + Zod (aligns with `school.md`
  §1 frontend stack). The public admission microsite (§2.1) is **pre-rendered/SSG** (e.g.
  vite-plugin-ssg) so SEO isn't lost without Next.js; the authenticated app stays a fast SPA.

---

# 5. AI / ML Layer  *(premium, provider-pluggable)*

- **Predictive (classical ML — scikit-learn / gradient boosting):**
  at-risk / dropout prediction, attendance & grade anomaly alerts, fee-default risk scoring.
- **Generative (LLM behind an abstraction):** auto report-card remarks, lesson-plan and
  question-paper drafting, and a **RAG-based assistant** for parents/students grounded in the
  school's own notices and policies. Default to the **latest Claude models via the Anthropic
  API** (e.g. Opus 4.8 for quality, Sonnet 4.6 for cost-sensitive volume), kept behind an
  `LLMProvider` interface so models/providers are swappable.
- **Optimization:** smart timetable generation via a constraint solver (extends the conflict
  rules in `school.md` §7.7).
- **Privacy guardrails:** no training on student PII, strict data minimization, consent-gated,
  region-aware (§7). AI is a metered add-on (§1.7).

---

# 6. Modern UX / Design  *(premium feel)*

Design system + theme tokens (drives white-label §1.5), **dark mode**, **PWA + offline**,
command palette, customizable dashboards/widgets, data grids with saved views + bulk actions,
global search, in-app onboarding tours/checklists, notifications center, optimistic UI +
skeleton loaders, **WCAG 2.1 AA accessibility**, full **i18n + RTL**, and locale-aware
multi-currency / timezone / date formatting (essential for the global market).

**Native mobile apps** (iOS/Android for parents/students/teachers, push + offline) are noted
as a **fast-follow add-on tier**, not part of the first commercial release.

---

# 7. Enterprise Security & Compliance  *(global market)*

Extends `school.md` §11–§12. Adds:

- **Regulatory tooling:** GDPR / FERPA / COPPA — **data-subject requests** (export, delete,
  anonymize), consent + cookie management, DPA + published sub-processor list.
- **Data residency:** region-pinned tenants (§1.1).
- **Encryption:** TLS in transit (already), **field-level encryption at rest for PII**,
  secrets in **KMS / Vault** (no secrets in env files in prod).
- **Isolation assurance:** PostgreSQL **RLS** (§1.1) + **automated tenant-isolation tests** in
  CI that attempt cross-tenant access and must fail.
- **Audit integrity:** make the audit log from `school.md` §7.19 **append-only / hash-chained**
  so entries can't be silently altered.
- **Perimeter & process:** WAF + DDoS protection, **SOC 2** readiness, scheduled pen-tests,
  and a bug-bounty program.

---

# 8. Observability & DevOps  *(premium operations)*

- **Observability:** OpenTelemetry (traces/metrics/logs) → Grafana / Prometheus / Loki;
  Sentry for errors; uptime + synthetic checks feeding the status page (§1.6).
- **Feature flags:** Unleash / Flagsmith (powers gradual rollout in §1.6 and entitlements UX).
- **CI/CD:** GitHub Actions running unit + integration + **e2e (Playwright)** + **load (k6)**,
  plus **SAST / dependency / secret / container scans**, with **per-PR preview environments**.
- **Infrastructure:** Terraform (IaC), blue-green / canary deploys.
- **Resilience:** DR plan with defined **RTO/RPO**, encrypted automated backups +
  **restore drills**, and **per-tenant backup/export** (extends `school.md` §11.8).

---

# 9. Monetizable Add-on Modules

Beyond the core in `school.md`, these are sellable upsells mapped to plan tiers (§1.7):

```txt
Online exams / quizzes + proctoring + question bank
Alumni management + donations / fundraising
Events + ticketing
Canteen / POS + student wallet
Visitor / gate-pass management (ties to §3.6 hardware)
Health / clinic + vaccination records
Certificate generation + public QR verification portal
Survey / feedback / form builder
(Future) learning-content marketplace
```

---

# 10. Revised Commercial Roadmap

Insert a new **Phase 0** ahead of `school.md`'s Phase 1, and re-frame the rest under the SaaS
lens. The original Phase 1–7 content stays valid — it is sequenced here, not rewritten.

| Phase | Focus | Key deliverables |
|---|---|---|
| **Phase 0 — SaaS Foundation** *(new)* | Make it a product | Tenancy + RLS, Stripe Billing, entitlements/feature-gating, onboarding wizard, white-label, platform admin console |
| Phase 1 — Foundation | from `school.md` | Auth, RBAC, school/branch, audit logging, admin dashboard |
| Phase 2 — Core School | from `school.md` | Students, guardians, teachers, classes, sections, subjects, assignments |
| Phase 3 — Daily Ops | from `school.md` | Attendance, timetable, notices, homework, role dashboards |
| **Phase 3.5 — Growth Engine** *(new)* | Differentiator | Admissions + CRM (§2), online payments (§3.1) |
| Phase 4 — Exams | from `school.md` | Exam setup, marks, grading, report cards, publish |
| Phase 5 — Finance | from `school.md` | Fee structures, invoices, payments, payroll |
| **Phase 5.5 — Integrations** *(new)* | Differentiator | Comms providers, SSO, online classes, public API + webhooks (§3) |
| Phase 6 — Advanced modules | from `school.md` + §9 | Library, transport, hostel, inventory, add-ons |
| **Phase 6.5 — AI** *(new)* | Premium | Predictive + generative AI (§5) |
| Phase 7 — Hardening | from `school.md` + §7/§8 | Compliance, observability, DR, pen-test, SOC 2 |

## Commercial MVP (first paying schools)

```txt
Phase 0 (SaaS foundation)
+ Core SIS (students / teachers / classes)        [Phase 1–2]
+ Attendance + dashboards                          [Phase 3]
+ Online fee payments                              [Phase 3.5 / 5]
+ Admissions + CRM (lite)                          [Phase 3.5]
+ Audit logs                                       [Phase 1]
```

Everything else ships as later, monetizable releases that move schools up the pricing tiers.

---

# 11. Reference Standards

Extends the references in `school.md` §26:

- OWASP ASVS & OWASP Top 10 — application security verification
- NIST SP 800-63 — digital identity / authentication
- Stripe Billing docs + PCI **SAQ-A** guidance — subscription & payment compliance
- SAML 2.0 / OpenID Connect specs — enterprise SSO
- GDPR / FERPA / COPPA — student data protection (global)
- Django / DRF security documentation
