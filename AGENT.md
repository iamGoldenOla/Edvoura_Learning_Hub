# AGENT.md

This repository is designed for long-lived human and AI collaboration. Treat this file as an operating contract for anyone making changes.

## Mission

Build EDVOURA Learning Hub as a premium K-12 tutoring platform with a clean backend spine, a vibrant Neo-Brutalist frontend, durable documentation, and production-oriented engineering discipline.

## Last Session Handoff (2026-04-22)

### Current Status: Pure Vercel + Supabase Deployment Achieved

The repo still has its canonical architecture of `apps/web` plus the privileged NestJS backend in `apps/api`, but the web dashboard now has an active cutover branch of work that starts replacing mock/API-dependent classroom flows with direct Supabase data.

### What Exists Today

#### Platform State
- The canonical Supabase schema history remains in `supabase/migrations/`.
- A single manual SQL artifact now exists at `supabase/cutover_all.sql`.
- The active cutover guide now exists at `VERCEL_SUPABASE_CUTOVER.md`.
- `apps/web` can be deployed to Vercel.
- `apps/api` code remains in the repo but is no longer required by `apps/web`.
- `apps/web` no longer depends on `NEXT_PUBLIC_API_URL` — all frontend flows use direct Supabase access or Next.js Server Actions/Route Handlers.
- `api-client.ts` is now orphaned — zero imports reference it.
- A new migration now exists at `supabase/migrations/20260421130000_phase7_direct_dashboard_assignment_flow.sql`.
- A follow-up storage migration now exists at `supabase/migrations/20260422100000_phase8_dashboard_storage_and_asset_links.sql`.

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

1. Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel environment variables for webhook and admin server action support.
2. Delete the `apps/api` folder entirely, as `apps/web` is now 100% decoupled and the legacy backend is no longer used.
3. Validate the application works end-to-end as a pure `Vercel + Supabase only` deployment.
4. Implement Live Session management (e.g., Zoom/Google Meet integration) directly within `apps/web` or via Supabase Edge Functions.
5. Keep `AGENT.md`, `README.md`, `VERCEL_SUPABASE_CUTOVER.md`, and GitHub in sync after each completed phase.

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
