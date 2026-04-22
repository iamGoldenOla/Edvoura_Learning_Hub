# Vercel + Supabase Cutover

This repository is not yet a pure `Vercel + Supabase only` deployment. It still contains a privileged NestJS backend in `apps/api`.

This document records:

- the exact Supabase SQL history to apply
- the single combined SQL file for manual SQL editor runs
- the current storage buckets and policies
- the frontend environment variables for Vercel
- the backend features that still depend on `apps/api`

## Current Reality

Today:

- `apps/web` can be deployed to Vercel as a standalone product
- Supabase provides database, auth, and storage
- `apps/api` code remains in the repo but is no longer required by `apps/web`
- All webhook receivers (Paystack, Resend) are handled by Next.js route handlers
- All dashboard mutations use Next.js Server Actions with direct Supabase access
- `NEXT_PUBLIC_API_URL` is no longer required by the frontend

To become `Vercel + Supabase only`, those `apps/api` responsibilities must be moved into:

- Next.js route handlers / server actions
- Supabase Edge Functions
- Supabase database functions, triggers, and RLS-safe direct reads

## Supabase SQL Files To Run

Run these in order:

1. `supabase/migrations/20260409134500_base_extensions_and_types.sql`
2. `supabase/migrations/20260409135500_foundation_tables.sql`
3. `supabase/migrations/20260409140500_rls_and_access_policies.sql`
4. `supabase/migrations/20260410100000_phase3_paystack_rename_and_submissions.sql`
5. `supabase/migrations/20260410120000_phase4_notification_kinds_and_resend.sql`
6. `supabase/migrations/20260414170000_phase5_dashboard_communications.sql`
7. `supabase/migrations/20260415100000_phase6_learning_orchestration_events.sql`
8. `supabase/migrations/20260421130000_phase7_direct_dashboard_assignment_flow.sql`
9. `supabase/migrations/20260422100000_phase8_dashboard_storage_and_asset_links.sql`
10. `supabase/migrations/20260422113000_phase9_direct_live_sessions.sql`

Notes:

- `supabase/seed.sql` currently contains no required seed data.
- Reference data and bucket creation already happen in the migrations above.
- A combined SQL artifact is available at `supabase/cutover_all.sql`.

## Single SQL File To Run

If you want one file to paste into the Supabase SQL editor instead of running migrations one by one, use:

- `supabase/cutover_all.sql`

This file is a concatenation of the seven canonical migration files in order.

## Storage Buckets

Defined in `supabase/migrations/20260409135500_foundation_tables.sql`:

- `avatars`
  - private
  - size limit: `5 MB`
  - mime types: `image/png`, `image/jpeg`, `image/webp`
- `assignment-assets`
  - private
  - size limit: `50 MB`
  - mime types: `application/pdf`, `image/png`, `image/jpeg`, `video/mp4`
- `student-work`
  - private
  - size limit: `50 MB`
  - mime types: `application/pdf`, `image/png`, `image/jpeg`, `video/mp4`
- `lesson-resources`
  - private
  - size limit: `50 MB`
  - mime types: `application/pdf`, `image/png`, `image/jpeg`, `video/mp4`

## Storage Policies

Currently present in `supabase/migrations/20260409140500_rls_and_access_policies.sql`:

- `storage_avatars_select_owner`
- `storage_avatars_insert_owner`

Current state:

- avatar uploads are covered
- bucket policies for `assignment-assets`, `student-work`, and `lesson-resources` are not yet defined in migrations

That means those buckets exist, but their object-level access model still needs explicit policy work before production use.

## Vercel Environment Variables For `apps/web`

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Currently also expected by the frontend:

- `NEXT_PUBLIC_API_URL`

This exists because `apps/web/src/lib/api-client.ts` still points dashboard and workflow requests to `apps/api`.

## Frontend Areas Still Calling `apps/api`

**NONE** — All `apiClient` imports have been removed. The frontend now operates as a pure `Vercel + Supabase only` deployment.

Previously migrated areas:

- ✅ billing summary and billing actions → direct Supabase billing schema reads
- ✅ notifications webhook delivery → Next.js route handler (`/api/webhooks/resend`)
- ✅ Paystack webhooks → Next.js route handler (`/api/webhooks/paystack`)
- ✅ admin operational actions → Next.js Server Actions (`dash/admin/actions.ts`)
- ✅ parent onboarding flows → Next.js Server Actions (`dash/parent/actions.ts`)
- ✅ profile settings saves → Next.js Server Actions (`dash/profile/actions.ts`)
- ✅ chat messages → direct Supabase client reads/writes
- ✅ live content publishing → direct Supabase client reads/writes
- ✅ audit log panel → direct Supabase audit schema reads

## Cutover Order

Recommended order:

1. Keep `apps/web` on Vercel and Supabase auth/storage working first.
2. Replace simple read flows with direct Supabase reads where RLS is safe.
3. Move webhook endpoints to Supabase Edge Functions or Next.js route handlers.
4. Move notification creation and billing orchestration out of NestJS.
5. Replace live session provider integrations with Vercel route handlers or Supabase Edge Functions.
6. Remove `NEXT_PUBLIC_API_URL` dependency from the frontend.

## Execution Phases

### Phase 0: Supabase Base Setup

Goal:

- Create the Supabase project and load the canonical schema.

Checklist:

1. Create a new Supabase project.
2. Run either:
   - `supabase/cutover_all.sql`
   - or the seven migration files in order
3. Verify the following schemas exist:
   - `public`
   - `private`
   - `billing`
   - `audit`
   - `analytics`
4. Verify the four buckets exist:
   - `avatars`
   - `assignment-assets`
   - `student-work`
   - `lesson-resources`

Exit criteria:

- Schema is loaded
- Buckets exist
- Auth is enabled in Supabase

### Phase 1: Vercel Frontend Base

Goal:

- Deploy `apps/web` to Vercel against Supabase auth and storage.

Checklist:

1. Import `apps/web` into Vercel.
2. Set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Do not rely on `apps/api` deployment for this phase.
4. Validate marketing pages and auth shell load.

Exit criteria:

- Vercel frontend builds
- Supabase client initializes
- Auth pages render

### Phase 2: RLS-Safe Direct Reads

Goal:

- Replace simple frontend reads that do not need privileged backend orchestration.

Candidate areas:

- profile reads
- learner context reads
- notifications feed where policy-safe
- dashboard communication feeds
- avatar storage access

Exit criteria:

- Direct Supabase reads replace the simplest `apiClient` calls
- `apps/web` depends less on `NEXT_PUBLIC_API_URL`

### Phase 2A: Direct Classroom Loop

Goal:

- Make the core tutor-to-student assignment flow work without `apps/api`.

Scope introduced by `20260421130000_phase7_direct_dashboard_assignment_flow.sql`:

- `public.sync_current_user_membership()`
- `public.create_tutor_assignment(...)`
- `public.submit_student_assignment(...)`
- `public.grade_student_submission(...)`
- `public.classes.grade_level_id`

What this phase connects:

1. Tutor publishes an assignment for a specific subject and grade.
2. Supabase auto-creates or reuses the matching class.
3. Matching students are enrolled into that class.
4. Student dashboards read the assignment directly from Supabase.
5. Students submit work directly to Supabase.
6. Tutor grading queue reads and grades those submissions directly from Supabase.

Current limitation:

- Google Meet provisioning is not part of this phase yet.

Exit criteria:

- Tutor-created assignments appear on matching student dashboards
- Student submissions appear in the tutor grading queue
- Tutor grading is reflected back on the student side

### Phase 3: Storage Hardening

Goal:

- Add missing object policies for non-avatar buckets before production use.

What Phase 8 adds:

- `storage_assignment_assets_select_authorized`
- `storage_assignment_assets_insert_tutor`
- `storage_student_work_select_authorized`
- `storage_student_work_insert_authorized`
- `public.attach_assignment_asset(...)`
- `public.attach_submission_file(...)`

What still remains after Phase 8:

- lesson resource library uploads in `lesson-resources`
- richer submission file listing and download surfaces on tutor pages

Exit criteria:

- Object access rules are explicit for each production bucket used by live dashboards

### Phase 3A: Direct Live Sessions

Goal:

- Make the live session scheduling and listing flow work without `apps/api`.

Scope introduced by `20260422113000_phase9_direct_live_sessions.sql`:

- `public.create_tutor_live_slot(...)`
- `public.list_tutor_live_schedule()`
- `public.list_student_live_lessons()`

Exit criteria:

- Tutor can schedule live sessions directly via Supabase RPC
- Students can see upcoming live sessions directly from Supabase
- Google Meet links travel through Supabase

### Phase 4: Workflow Migration

Goal:

- Move privileged workflows out of NestJS.

Move into:

- Next.js route handlers / server actions
- Supabase Edge Functions

Target features:
- billing (✅ Done: Summary read + webhooks moved to Next.js route handlers)
- notifications delivery orchestration (✅ Done: Resend webhooks moved to Next.js route handlers)
- webhook receivers (✅ Done: Paystack and Resend webhooks migrated to Next.js route handlers)
- live session provider integration (✅ Done: Direct Supabase client reads/writes)
- admin actions (✅ Done: Tutor queue approvals moved to Next.js server actions)

Exit criteria: ✅ MET — Critical user flows no longer require `apps/api`

### Phase 5: API Removal ✅

Goal:

- Remove remaining `apps/api` dependency from `apps/web`.

Checklist:

1. ✅ Remove `apiClient` runtime dependency from all dashboard components.
2. ✅ All profile, billing, admin, parent, chat, and live content flows use direct Supabase.
3. ✅ Build passes with zero `apiClient` imports.
4. ✅ Remove `NEXT_PUBLIC_API_URL` from `.env.local` / `.env.example`.
5. ✅ Delete `api-client.ts` file.

Exit criteria: ✅ MET — Deployment is truly `Vercel + Supabase only`

## Immediate Minimum Setup

If you want the database and storage side ready now:

1. Create a Supabase project.
2. Apply the seven migration files in order.
3. Verify the four buckets exist.
4. Set the Vercel env vars for `apps/web`.
5. Deploy `apps/web` only.

## Remaining Refactor Scope

Before the app is fully functional with live sessions:

- We need to implement a mechanism for live session integration directly from `apps/web` (or via Supabase Edge Functions), bypassing the old `academics/live-session.service.ts` from `apps/api`.
- The `apps/api` folder can now be deleted completely from the repository, as the frontend no longer depends on it and all essential workflows (billing webhooks, notification webhooks, tutor approvals) have been migrated to Next.js route handlers and server actions.
