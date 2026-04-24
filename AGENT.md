# AGENT.md

This repository is designed for long-lived human and AI collaboration. Treat this file as an operating contract for anyone making changes.

## Mission

Build EDVOURA Learning Hub as a premium K-12 tutoring platform with a clean backend spine, a vibrant Neo-Brutalist frontend, durable documentation, and production-oriented engineering discipline.

## Last Session Handoff (2026-04-24)

### Current Status: Dashboards Overhauled & Live Data Integrated

The platform has successfully transitioned its core management interfaces (Admin, Super Admin, Tutor, Parent) into a fully-wired, production-grade command center using a unified **Neo-Brutalist** design language (`border-[4px] border-dark`, hard shadows, vibrant pastels) powered by real-time Supabase queries instead of mocked data.

### What Exists Today

#### Platform State
- The canonical Supabase schema history remains in `supabase/migrations/`.
- A single manual SQL artifact now exists at `supabase/cutover_all.sql`.
- The active cutover guide now exists at `VERCEL_SUPABASE_CUTOVER.md`.
- `apps/web` is deployed to Vercel and depends directly on Supabase via Server Actions and Route Handlers.
- All 14 Super Admin sub-pages (`Users`, `Students`, `Tutors`, `Academic`, `Engagement`, `Finance`, `Support`, etc.) now fetch **live data** instead of mock placeholders.
- The UI across Parent, Tutor, and Admin portals has been standardized to the Neo-Brutalist design system.
- Paystack payment routing logic has been corrected (Parents stay in-app, Tutors enter bank details internally, Super Admin gets raw Paystack console access).

#### Current Supabase Footprint
- Four storage buckets are created by migrations:
  - `avatars`
  - `assignment-assets`
  - `student-work`
  - `lesson-resources`
- Only avatar object policies are currently defined in migrations.
- Reference data and bucket creation are seeded by the migration history; `supabase/seed.sql` is currently empty.

#### Direct Classroom Loop Status
- `apps/web/src/lib/app-context.ts` now has a direct Supabase fallback that builds student dashboard data from `profiles`, `student_profiles`, `classes`, `class_enrollments`, `assignments`, `assignment_submissions`, `submission_grades`, `lessons`, and `progress_snapshots`.
- Tutor builder, roster, grading, and student assignment upload pages are now wired to Supabase rather than local mock state.
- The new migration adds:
  - `public.sync_current_user_membership()`
  - `public.create_tutor_assignment(...)`
  - `public.submit_student_assignment(...)`
  - `public.grade_student_submission(...)`
  - `public.classes.grade_level_id`
- Storage-backed assignment assets and student submission files are now being wired through Supabase buckets and attachment RPCs.
- This is the first real shared dashboard loop:
  - tutor publishes assignment
  - matching students are enrolled into the grade-specific class
  - student sees the assignment
  - student submits work
  - tutor sees and grades the submission

### What Still Needs Work

1. Phase 0: Supabase Base Setup
   Load the canonical SQL into the hosted Supabase project and verify buckets, schemas, and auth.
2. Phase 1: Vercel Frontend Base
   Deploy `apps/web` with only the required Supabase frontend env vars.
3. Phase 2: RLS-Safe Direct Reads
   Replace the simplest `apiClient` reads with direct Supabase access.
4. Phase 2A: Direct Classroom Loop
   Finish validating the new tutor-student assignment flow and apply the new migration to hosted Supabase.
5. Phase 3: Storage Hardening
   Add missing policies for `assignment-assets`, `student-work`, and `lesson-resources`.
6. Phase 4: Workflow Migration
   Move billing, notifications, webhooks, live-session provisioning, and admin actions out of `apps/api`. (Webhooks, Admin actions, Billing summary reads completed).
7. Phase 5: API Removal
   Remove the remaining `NEXT_PUBLIC_API_URL` dependency from the frontend by porting remaining frontend mutations to Next.js Server Actions.

## Immediate Next Priorities

1. Run full end-to-end regression testing on the Vercel + Supabase deployment.
2. Complete `Phase 0` through `Phase 5` of the cutover on the hosted Supabase instance (applying all schema migrations and verifying buckets).
3. Validate student assignment submissions, grading, and direct Live Session creation via the new UI workflows.
4. Keep `AGENT.md`, `README.md`, `VERCEL_SUPABASE_CUTOVER.md`, and GitHub in sync after each completed phase.

## Working Rules

- Read `README.md`, `PROJECT_RULES.md`, `PROJECT_STRUCTURE.md`, and `ARCHITECTURE_DECISIONS.md` before major changes.
- Keep one canonical architecture. Do not introduce alternate API servers, duplicate auth flows, or overlapping service layers.
- Update project memory files whenever architecture, schema, workflows, routing, roles, or deployment assumptions change.
- During the `Vercel + Supabase only` transition, complete and validate one cutover phase before starting the next.
- Prefer additive, well-documented migrations over implicit schema edits.
- Keep business logic in TypeScript services. Use SQL for schema, integrity, RLS, views, helper functions, and narrow triggers.
- Preserve role and relationship semantics. EDVOURA is not a generic LMS.

## Implementation Expectations

- Backend-first. Do not jump into UI-heavy work before the backend contract exists.
- Supabase is the platform core. Respect its strengths instead of fighting it with duplicate infrastructure.
- Next.js is the single privileged backend and frontend surface.
- Frontend direct Supabase access is allowed for RLS-safe reads.
- All privileged mutations, third-party integrations, and webhook handling go through Next.js Server Actions and Route Handlers.

## Auth and RBAC Expectations

- `auth.users` is the identity root.
- `public.profiles` is the application-facing user record.
- Role assignment lives in `public.user_roles`.
- Domain-specific user extensions live in `public.parent_profiles`, `public.student_profiles`, `public.tutor_profiles`, and `public.admin_profiles`.
- Relationship-based access matters as much as role-based access. Parent-child and tutor-class links are first-class authorization inputs.

## Documentation Discipline

Update these files whenever relevant:

- `README.md`: product summary and canonical architecture
- `VERCEL_SUPABASE_CUTOVER.md`: active cutover sequence and deployment notes
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
