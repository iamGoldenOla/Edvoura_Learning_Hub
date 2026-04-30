# AGENT.md

This repository is designed for long-lived human and AI collaboration. Treat this file as an operating contract for anyone making changes.

## Mission

Build EDVOURA Learning Hub as a premium K-12 tutoring platform with a clean backend spine, a vibrant Neo-Brutalist frontend, durable documentation, and production-oriented engineering discipline.

## Last Session Handoff (2026-04-30)

### Current Status: Profile Date-of-Birth Feature + Build Fix (2026-04-30)

- Added `date_of_birth` column to the `profiles` table via migration `supabase/migrations/20260430120000_add_date_of_birth.sql`.
  - This is a shared column — it applies to **all roles** (Tutor, Student, Admin, Parent).
  - **Migration must be run manually** in Supabase SQL Editor: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth date;`
- Refactored `ProfileSettingsClient.tsx` to use a shared `basicForm` state for `fullName` and `dateOfBirth`, decoupled from role-specific profile types (`TutorProfileContext`, `StudentProfileContext`).
- All three save actions (`saveTutorProfileAction`, `saveStudentProfileAction`, `saveGeneralProfileAction`) in `apps/web/src/app/dash/profile/actions.ts` now persist `date_of_birth` to the `profiles` table.
- `app-context.ts` now fetches `date_of_birth` from `profiles` and exposes it as `dateOfBirth` on the viewer's profile object.
- **Build fix (2026-04-30):** Resolved TypeScript build error where `fullName` and `dateOfBirth` were incorrectly passed inside the `tutorProfile` and `studentProfile` props in:
  - `apps/web/src/app/dash/profile/page.tsx`
  - `apps/web/src/app/dash/tutor/profile/page.tsx`
  - These fields don't exist on `TutorProfileContext` or `StudentProfileContext`; they are handled by `basicForm` which reads from `viewer.currentUser.profile` directly.
- Build passes cleanly (98/98 pages, exit code 0). Pushed to `main`.

### Current Status: Parent & Admin Mobile Shell Hardening (2026-04-29)

- Fixed mobile layout for Parent and Admin dashboards.
- Added horizontally scrollable bottom navigation bars for Parent and Admin roles, similar to Student and Tutor dashboards, to prevent content obscuration and improve mobile UX.
- Ensured proper left and right padding (`p-4 sm:p-8`) and container constraints (`min-w-0`, `break-words`) across Parent and Admin views.
- Fixed an `Unterminated string literal` syntax error in `TutorAIWorkspaceClient.tsx`.

### Current Status: Cross-Dashboard Delivery Contract + Mobile Shell Hardening (2026-04-29)

- Dashboard publishing and review side effects are now being consolidated around a shared interaction contract instead of scattered route-specific behavior.
- New shared delivery helpers now live in `apps/web/src/lib/dashboard/`:
  - `distribution.ts`
    - centralizes AI workflow notifications to super admins, tutors, and parents
    - centralizes AI publish fan-out into student-facing class/event delivery
    - creates in-app `notifications` plus queued `notification_deliveries` rows
  - `studentAudience.ts`
    - filters published AI content by the learner's actual grade and enrolled subjects before rendering it on student pages
- AI workflow route updates:
  - `POST /api/ai/dashboard/content`
    - `SUBMIT_FOR_REVIEW` now notifies super admins
    - `APPROVE`, `REJECT`, and `REQUEST_CHANGES` now notify the generating tutor
    - `PUBLISH_DIRECTLY` and `PUBLISH` now use the shared publish-and-distribute helper so class creation, enrollment sync, parent notifications, and student delivery stay aligned
  - `POST /api/ai/publish`
    - now delegates to the same shared publish-and-distribute helper instead of maintaining a separate publish implementation
- Tutor builder publication flow improvements:
  - manual quiz, spelling, and resource publishing now also notifies parents through the same dashboard notification pipeline
- Student visibility hardening:
  - `/dash/student/subjects`
  - `/dash/student/notes`
  - `/dash/student/quiz`
  - `/dash/student/spelling-bee`
  now filter published AI content to the student's grade and enrolled subject audience instead of exposing all globally published AI rows
- Parent dashboard alert wiring fix:
  - parent notifications are parent-recipient notifications, not child-recipient notifications
  - parent summary alerts now read the correct notification target and map alerts back onto the relevant linked child records
- Shared mobile-shell fixes started:
  - mobile sidebar width is constrained more safely
  - Grade 1-3 bottom navigation now uses a wrapped grid instead of a width-forcing row
  - main dashboard content adds extra bottom padding when that mobile nav is active
- Important operating rule going forward:
  - treat cross-dashboard delivery as a first-class backend contract
  - do not add new publish/review surfaces that bypass `apps/web/src/lib/dashboard/distribution.ts`

### Current Status: Mobile-First Role Surface Hardening (2026-04-29)

- The shared shell fix was followed by a page-level mobile pass across the highest-traffic dashboards:
  - `apps/web/src/components/dashboards/StudentBandClientWrapper.tsx`
  - `apps/web/src/app/dash/tutor/page.tsx`
  - `apps/web/src/app/dash/admin/page.tsx`
  - `apps/web/src/components/dashboards/ParentDashboardClient.tsx`
- Mobile-first improvements applied:
  - reduced oversized desktop padding on narrow screens
  - stacked header CTA rows into single-column mobile actions where needed
  - tightened card radii, shadows, and section spacing for small viewports
  - made schedule, summary, and navigation rows wrap instead of overflowing
  - added a mobile card presentation for `Recent Signups` instead of forcing a wide table
  - improved narrow-screen readability for student quick links, tutor schedule cards, and admin summary blocks
- Verification status:
  - targeted `eslint` completed with warnings only in the student band wrapper for legacy unused helper state
  - `tsc --noEmit` passed
- Remaining follow-up for mobile phase:
  - continue the same narrow-screen cleanup across secondary subpages like notes, quiz, parent notifications, admin section pages, and tutor tools until all role dashboards behave consistently below `360px`

### Current Status: Secondary Dashboard Mobile Sweep + Interaction Matrix Scaffold (2026-04-29)

- Mobile-first cleanup has now been extended into secondary role surfaces:
  - `apps/web/src/app/dash/student/notes/StudentNotesWorkspace.tsx`
  - `apps/web/src/app/dash/student/quiz/page.tsx`
  - `apps/web/src/app/dash/student/quiz/PracticeQuizClient.tsx`
  - `apps/web/src/app/dash/student/spelling-bee/SpellingBeeClient.tsx`
  - `apps/web/src/app/dash/admin/notifications/page.tsx`
  - `apps/web/src/app/dash/parent/notifications/page.tsx`
  - `apps/web/src/components/dashboards/ai/TutorAIWorkspaceClient.tsx`
- Improvements in this slice:
  - reduced oversized paddings and card radii on mobile
  - stacked action/button rows for narrow screens
  - improved quiz and spelling interaction layouts for handheld use
  - tightened tutor AI draft action layouts so publish/review buttons do not overflow on mobile
  - hardened student notes plus admin/parent notification surfaces for smaller widths
- Interaction matrix scaffolding is now explicit:
  - code artifact: `apps/web/src/lib/dashboard/interactionMatrix.ts`
  - working contract doc: `DASHBOARD_INTERACTION_MATRIX.md`
- Regression foothold added:
  - `apps/web/e2e/dashboard-actions.spec.ts` now includes narrow-screen checks for student navigation and the student subjects landing page
- Current architectural rule:
  - when a new dashboard-to-dashboard delivery flow is introduced, define it in the interaction matrix and implement its side effects through the shared dashboard delivery layer rather than page-local mutations

### Current Status: Role Feed Rules + Broader Notification Distribution (2026-04-30)

- The dashboard interaction contract has now been extended beyond AI-only publishing:
  - new role feed rule map: `apps/web/src/lib/dashboard/feedRules.ts`
  - expanded interaction matrix entries in `apps/web/src/lib/dashboard/interactionMatrix.ts`
  - contract doc updated in `DASHBOARD_INTERACTION_MATRIX.md`
- Shared delivery layer upgrades in `apps/web/src/lib/dashboard/distribution.ts`:
  - notifications can now carry explicit `surfaceTargets` and `feedKeys`
  - parent weekly report notifications now use the shared delivery layer instead of route-local inserts
  - broader cross-role broadcast helper now exists for admin/super_admin initiated announcements
- New route added:
  - `POST /api/dashboard/notifications/broadcast`
  - queues role-targeted dashboard broadcasts through the shared distribution layer
- Mobile-first cleanup continued on secondary communication/support pages:
  - `apps/web/src/app/dash/parent/messages/page.tsx`
  - `apps/web/src/app/dash/tutor/messages/page.tsx`
  - `apps/web/src/components/dashboards/RoleChatBox.tsx`
  - `apps/web/src/app/dash/admin/notifications/page.tsx`
  - `apps/web/src/app/dash/admin/support/page.tsx`
  - `apps/web/src/app/dash/tutor/schedule/page.tsx`
- Regression coverage expanded in `apps/web/e2e/dashboard-actions.spec.ts` to include narrow-screen checks for:
  - admin notification center
  - parent notifications
  - tutor messages

### Current Status: Puter Dashboard AI Workflow (2026-04-27)

- Puter.js integration is now architected as **dashboard-only** generation tooling:
  - Tutor AI workspace: `/dash/tutor/ai`
  - Super Admin AI control center: `/dash/admin/ai`
  - Puter CDN script is loaded only in those two pages via `next/script`.
- New Edvoura AI module set added in `apps/web/src/lib/ai/`:
  - `puterClient.ts` (safe Puter wrapper, browser guard, optional streaming helper)
  - `edvouraPromptBuilder.ts` (master Edvoura prompt composer + task contracts)
  - `aiContentValidator.ts` (task-specific JSON validation)
  - `antiRepetitionService.ts` (extract/hash prior items to reduce repetition)
  - `aiContentRepository.ts` (dashboard API client)
  - `contentGenerationService.ts` (end-to-end Puter generation + validation + draft save)
- New dashboard UI components added:
  - `AIContentGeneratorForm`
  - `AIContentPreview`
  - `PendingReviewList`
  - `AIContentReviewActions`
  - `AIStatusBadge`
- New role-protected API routes added:
  - `GET/POST /api/ai/dashboard/content`
    - tutor/admin/super_admin can save draft + submit review
    - super_admin can approve/reject/request_changes/publish
  - `GET /api/ai/dashboard/previous-items` for anti-repetition memory injection.
- New migration added:
  - `supabase/migrations/20260427190000_puter_dashboard_ai_workflow.sql`
  - Extends `ai_generated_content` with richer workflow fields and status model.
  - Adds `anti_repetition_items` table with RLS + indexes.
  - Expands RLS so super_admin can manage all AI content rows.
- Navigation updated:
  - Tutor sidebar AI link now points to `/dash/tutor/ai`.
  - Admin sidebar AI link now points to `/dash/admin/ai`.
- Workflow rule now enforced in API:
  - Publish requires super_admin and prior `APPROVED` status.
- Follow-up completion:
  - Tutor draft cards now support direct `Improve with AI` and `Regenerate` actions.
  - Super Admin review lists now include `Improve with AI` per item.
  - Legacy `builder?tool=ai-generator` entry now forwards to `/dash/tutor/ai` to keep all Puter generation in the dedicated protected workspace.

### Current Status: Main Branch Synced + Mobile Hardening + Tutor UX Fixes

- `main` is now the deployment source of truth and has been fast-forwarded with the full AI/dashboard branch history.
- Assignment RPC reliability was hardened in `supabase/migrations/20260426224500_harden_assignment_rpc_ambiguity.sql` to prevent ambiguous `class_id`/`assignment_id` runtime failures during dashboard uploads/submissions.
- Marketing pages were hardened for ultra-small screens (down to `253px` width class) by tightening typography minimums and container spacing.
- Tutor workflow fixes were applied:
  - Roster KPI now uses real counts (`lesson_attendance`, `progress_snapshots`) instead of placeholder labels.
  - AI Generator reliability improved:
    - increased orchestrator retries,
    - reduced schema over-strictness that caused unnecessary validation failures,
    - route now returns generated content even when draft save fails,
    - builder now shows inline AI status/error messages in the generator panel.
  - Tutor Messages UI was redesigned to a modern threaded chat layout while keeping role/channel safety constraints.
  - Tutor message scroll behavior was stabilized so periodic refresh no longer snaps the page while typing/sending.
  - AI orchestrator fallback was hardened:
    - rotates across OpenRouter key pool and model fallback list,
    - rotates across Gemini key pool (`GEMINI_API_KEY`, `GEMINI_API_KEY_n`),
    - returns combined provider failure diagnostics instead of a single misleading Gemini-only error.
  - AI Generator layout was expanded in the tutor builder; compact right-rail assistant is now absorbed into a larger in-flow assistant workspace when `AI Generator` is active.
- Marketing navbar branding was adjusted so `EDVOURA` renders fully (no clipped `RA`) and slogan visibility/contrast is preserved.

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

#### AI Engine (New — 2026-04-24)
- **Database**: Migration `20260424194000_ai_orchestration_engine.sql` creates four new tables:
  - `curriculum_maps` — Ground-truth curriculum data (WAEC/NECO/British/Hybrid), topics, objectives, difficulty weights, and prerequisite chains.
  - `ai_generated_content` — Validated AI output (lesson notes, stories, comprehensions, quizzes) with draft/approved/published workflow.
  - `student_learning_profiles` — Personalization engine data (learning pace, strong/weak subjects, AI-recommended interventions).
  - `ai_action_logs` — Audit trail for all automated AI actions (weekly reports, intervention alerts).
- **Library**: `apps/web/src/lib/ai/` contains:
  - `schemas.ts` — Zod validators for every content type (LessonNote, Story, Comprehension, Quiz, StudentAnalysis, ParentReport). Enforces min-length, structural depth, and format compliance.
  - `prompts.ts` — Curated system prompts with Nigerian/African educational context, curriculum alignment, and professional depth requirements.
  - `orchestrator.ts` — LLM-agnostic generation engine (Vercel AI SDK + OpenAI GPT-4o) with retry logic and Zod validation firewall.
- **API Routes**: Three new Next.js Route Handlers:
  - `POST /api/ai/generate` — Content generation (auth-guarded for tutors/admins).
  - `POST /api/ai/analyze-student` — Personalization engine (analyzes performance, updates learning profiles, logs interventions).
  - `POST /api/ai/parent-report` — Auto-generates warm weekly parent reports and sends notifications.
- **Dependencies**: `ai`, `@ai-sdk/openai`, `zod` added to `apps/web`.
- **Env requirement**: `OPENAI_API_KEY` must be set in Vercel environment variables.

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
5. Enforce dashboard quality gates in `apps/web`:
   - `pnpm --dir apps/web run qa:dashboard-copy` (blocks banned placeholder KPI copy),
   - `pnpm --dir apps/web run qa:smoke:prod` (mobile/public route smoke against production),
   - `pnpm --dir apps/web run qa:smoke:auth:prod` (role-authenticated dashboard smoke),
   - `pnpm --dir apps/web run qa:ai:matrix:prod` (fixed-prompt AI structural regression checks).

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
