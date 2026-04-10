# AGENT.md

This repository is designed for long-lived human and AI collaboration. Treat this file as an operating contract for anyone making changes.

## Mission

Build EDVOURA Learning Hub as a premium K-12 tutoring platform with a clean backend spine, durable documentation, and production-oriented engineering discipline.

## Last Session Handoff (2026-04-10 — late session)

### Current Status: Phase 4 Complete · Local Dev Environment Operational

Phase 4 (Live Learning & Communication) is fully built. The backend is now complete.

### Phase 3 Feature Summary

- `academics`: Lesson creation with Zoom/Google Meet live session provisioning. List assignments and attendance endpoints.
- `submissions`: Full assignment submission lifecycle — submit, grade, notify. Late submission detection.
- `quiz-attempts`: Full quiz lifecycle — add questions, start attempt, submit with auto-scoring (JSON equality), get results.
- `attendance`: Batch attendance recording and retrieval for lessons.
- `live-session.service`: Zoom Server-to-Server OAuth token caching and Google Calendar API Service Account provisioning.
- `billing`: Paystack customer creation API. Customer code synced on parent profile completion.
- `parents`: Profile completion creates Paystack customer, stores `paystack_customer_code` on `parent_profiles`.
- `apps/worker`: 
  - `ProgressSnapshotProcessor`: daily attendance rate, assignment completion, average score.
  - `LessonReminderProcessor`: queues reminders 1 hour before lesson to assigned students and parents.
  - `ParentAlertProcessor`: warns parents of overdue assignments not submitted by children.
  - `TutorReminderProcessor`: alerts tutors on ungraded submissions older than 48 hours and upcoming lessons.
- Schema migration: Renamed all `stripe_*` → `paystack_*`. Added Phase 4 notification kinds.
- Webhooks: Added Resend controller using Svix for delivery reconciliation.

### Dev Environment Fixes (this session)

- **Replaced `tsx` with `ts-node/esm`** for `start:dev` script. `tsx` (esbuild-based) does not support `emitDecoratorMetadata`, breaking NestJS constructor-based DI. All controllers returned 500 because injected services were `undefined`.
- **Added `--env-file=../../.env`** to the dev script. The project had no dotenv loader; Node 22's built-in `--env-file` flag is now used.
- **Fixed Zod environment schema**: Optional env vars with empty values (e.g., `RESEND_API_KEY=`) caused validation failures because `.optional()` only accepts `undefined`, not empty string. Added `z.preprocess` transform to coerce empty strings to `undefined`.
- **Added `@fastify/static`** dependency required by NestJS Swagger with Fastify adapter.
- **Added error logging** to `ProblemDetailsFilter` for unhandled exceptions (was silently swallowing stack traces).
- **Built `@edvoura/contracts`** — must be built before `start:dev` since ts-node resolves dist output.

### Verified Working

- `GET /v1/health` → `{"status": "ok"}`
- `GET /v1/ready` → `{"status": "ready", "database": "ok"}`
- Supabase local running on `127.0.0.1:54321` with all 4 migrations applied
- Swagger docs at `http://localhost:4000/v1/docs`

### Production Supabase Credentials (noted, not active)

- URL: `https://xynawxgiwekfxzymvobk.supabase.co`
- Anon key available — stored by user, not in `.env` for dev

Payment gateway is **Paystack** (not Stripe). All Stripe references replaced.

Phase 7: Dashboard Fidelity Maturation.

We are actively converting all role dashboards (Student 1-3, Student 4-6, Student 7-12, Parent, Tutor, Admin) into high-fidelity React layouts mapped precisely to user specifications. We have completely integrated dynamic sidebars and developer toggles for isolated testing.


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
