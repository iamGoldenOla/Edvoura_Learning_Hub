# AGENT.md

This repository is designed for long-lived human and AI collaboration. Treat this file as an operating contract for anyone making changes.

## Mission

Build EDVOURA Learning Hub as a premium K-12 tutoring platform with a clean backend spine, a vibrant Neo-Brutalist frontend, durable documentation, and production-oriented engineering discipline.

## Last Session Handoff (2026-04-12)

### Current Status: Phase 9.1 Plus Auth/Billing Dashboard Integration Pass

The project remains in the Phase 9.1 full-stack state, but this session moved the app beyond several frontend stubs by wiring role resolution, student dashboard data, and the first real billing and entitlement API surface.

### What Exists Today

#### Backend (`apps/api` + `apps/worker`)
- Phase 1: Foundation. Auth, RBAC, core API skeleton, Supabase config, schema, and RLS foundation.
- Phase 2: Onboarding and Identity. Parent/student/tutor/admin onboarding modules, Paystack billing webhook handling, notification service, and worker process.
- Phase 3: Academic Core. Assignment submissions with late detection, quiz attempts with auto-scoring, lesson attendance, live session provisioning (Zoom plus Google Meet stub), progress snapshots, and Paystack customer creation.
- Phase 4: Live Learning and Communication. Zoom OAuth caching, Resend email webhooks, proactive parent alerts, tutor reminders, and lesson reminder processing.
- This session:
  - `GET /v1/auth/me` now returns `primaryRole` plus student learner profile data when available.
  - `GET /v1/academics/student/dashboard` now provides a unified student overview payload with enrollments, upcoming lessons, assignments, and progress snapshots.
  - Billing now exposes plan listing, billing summary, plan create/update, and local subscription bootstrap endpoints under `/v1/billing`.

#### Frontend (`apps/web` - Next.js)
- Phase 7: Role Dashboards. Student, parent, tutor, and admin dashboards exist, with broad student route coverage and grade-band-aware navigation.
- Phase 9: Marketing Website. Landing page, navbar/footer, login, and signup flows exist.
- Phase 9.1: Inner Marketing Pages. About, Services, Pricing, Blog, Careers, and Contact exist.
- This session:
  - `/dash` and the shared dashboard layout now resolve role and learner context from backend `auth/me` instead of relying on Supabase metadata as the primary source of truth.
  - Student home, student assignments, and student live sessions now use the backend student dashboard endpoint instead of nonexistent API routes and placeholder assumptions.
  - Login and signup actions now redirect through `/dash` so role routing remains centralized.
  - `apps/web/next.config.ts` now pins `turbopack.root`, and deprecated `src/middleware.ts` was migrated to `src/proxy.ts`.
  - Hardened dashboard shell layering to keep the sidebar and header above content overlays, and added navbar auto-close on route change or escape.
  - Added dev-only role guard fallback for student routes plus friendly fallback panels on student dashboard pages when the API is not yet ready.
  - Added missing public env vars for Supabase and API base in `.env` and allowed additional dev origins for Next.js.
  - Removed unused `.sixth` folder.

#### Design System
- Visual language: high-contrast white backgrounds, navy command surfaces, heavy borders, and hard 3D offset shadows.
- Grade-specific framing:
  - Grades 1-3: playful, guided, high-encouragement presentation.
  - Grades 4-6: mission-style layouts and clearer progress framing.
  - Grades 7-12: stronger academic and performance-oriented presentation.
- Shell: `DashboardClientShell` remains the common dashboard frame.
- Utility classes: `brutalist-card`, `brutalist-3d`, `brutalist-header` in `globals.css`.

### What Was Broken Before This Pass

- Frontend dashboard routing depended too heavily on `user_metadata.role`.
- Student dashboard pages were calling endpoints that did not exist.
- Student home was still largely decorative and not tied to a coherent backend summary contract.
- Billing had webhook/customer groundwork, but no usable frontend-facing entitlement summary or plan management surface.
- Next.js was inferring the wrong workspace root for Turbopack.

### What Still Needs Work

1. Complete Phase 5 Billing and Entitlements:
   Paystack checkout/authorization flow, webhook reconciliation, family access gating, and invoice/payment lifecycle enforcement.
2. Finish Dashboard Data Binding:
   parent, tutor, and admin dashboards still need the same API-backed treatment now applied to the student dashboard.
3. Harden Auth Onboarding:
   signup still stores useful metadata, but domain-profile completion and role-linked onboarding should become more explicit and enforced.
4. Phase 6 Engagement:
   rewards, badges, streaks, games metadata, and spelling bee remain planned.
5. Verification:
   contracts and API builds pass, and the web app compiles successfully, but some local Next.js verification commands still hit environment-specific `spawn EPERM` restrictions under sandboxed runs.
   Local cleanup of `apps/web/.next` can fail if a dev server is running; stop active Node dev processes before clearing cached files.

## Immediate Next Priorities

1. Connect billing subscription bootstrap to real Paystack checkout flow.
2. Bind parent dashboard to live billing, children, and notification data.
3. Bind tutor dashboard to real classes, grading queues, and schedule data.
4. Bind admin dashboard to real user, tutor review, and financial summary data.
5. Add stronger end-to-end verification around login, role routing, student dashboard load, and billing summary visibility.

## Working Rules

- Read `README.md`, `PROJECT_RULES.md`, `PROJECT_STRUCTURE.md`, and `ARCHITECTURE_DECISIONS.md` before major changes.
- Keep one canonical architecture. Do not introduce alternate API servers, duplicate auth flows, or overlapping service layers.
- Update project memory files whenever architecture, schema, workflows, routing, roles, or deployment assumptions change.
- Prefer additive, well-documented migrations over implicit schema edits.
- Keep business logic in TypeScript services. Use SQL for schema, integrity, RLS, views, helper functions, and narrow triggers.
- Preserve role and relationship semantics. EDVOURA is not a generic LMS.

## Implementation Expectations

- Backend-first. Do not jump into UI-heavy work before the backend contract exists.
- Supabase is the platform core. Respect its strengths instead of fighting it with duplicate infrastructure.
- `apps/api` is the single privileged backend surface.
- Frontend direct Supabase access is allowed only for a small, explicit allowlist of RLS-safe reads.
- All privileged mutations, third-party integrations, and webhook handling go through the API.
- Keep modules cohesive and explicit. If code does not have a clear module home, stop and decide before adding it.

## Auth and RBAC Expectations

- `auth.users` is the identity root.
- `public.profiles` is the application-facing user record.
- Role assignment lives in `public.user_roles`.
- Domain-specific user extensions live in `public.parent_profiles`, `public.student_profiles`, `public.tutor_profiles`, and `public.admin_profiles`.
- Relationship-based access matters as much as role-based access. Parent-child and tutor-class links are first-class authorization inputs.

## Documentation Discipline

Update these files whenever relevant:

- `README.md`: product summary and canonical architecture
- `PROJECT_RULES.md`: engineering and governance rules
- `PROJECT_STRUCTURE.md`: folder and ownership map
- `IMPLEMENTATION_ROADMAP.md`: current build sequence
- `PRODUCT_WORKFLOWS.md`: user and operational workflows
- `ARCHITECTURE_DECISIONS.md`: major technical decisions
- `CHANGELOG_INTERNAL.md`: internal milestone record

## Safe Change Checklist

Before merging any meaningful change:

1. Verify it fits the canonical architecture.
2. Verify schema and RLS implications.
3. Verify audit, billing, and notification side effects if relevant.
4. Verify documentation updates were made.
5. Verify test coverage or note the gap explicitly.
