# CHANGELOG_INTERNAL.md

## 2026-04-10 (Phase 3)

### Phase 3: Academic Core — Submissions, Quiz Attempts, Live Sessions, Progress

- Created `live-session.service.ts`: Zoom Server-to-Server OAuth meeting provisioning, Google Meet stub, automatic insertion into `private.lesson_live_sessions`.
- Expanded `academics.service.ts` and `academics.controller.ts`: lesson creation now auto-provisions live sessions, added `GET /v1/academics/classes/:classId/assignments`, `GET /v1/academics/lessons/:lessonId/session`, `POST /v1/academics/lessons/:lessonId/attendance`, `GET /v1/academics/lessons/:lessonId/attendance`.
- Created Submissions module (`modules/submissions/`):
  - `POST /v1/academics/assignments/:id/submissions` — student submits work (late detection)
  - `GET /v1/academics/assignments/:id/submissions` — tutor/admin lists submissions
  - `GET /v1/academics/assignments/:id/submissions/me` — student's own submission
  - `POST /v1/academics/submissions/:id/grade` — tutor grades with score + feedback, auto-notifies student
- Created Quiz Attempts module (`modules/quiz-attempts/`):
  - `POST /v1/academics/quizzes/:id/questions` — add questions batch
  - `GET /v1/academics/quizzes/:id/questions` — list questions (answer hidden for students)
  - `POST /v1/academics/quizzes/:id/attempts` — start attempt (resume if in_progress)
  - `POST /v1/academics/quiz-attempts/:id/submit` — submit with auto-scoring (JSON equality)
  - `GET /v1/academics/quiz-attempts/:id` — get attempt result with responses
- Added `createPaystackCustomer` to `billing.service.ts` — calls `POST /customer` on Paystack API.
- Updated `parents.service.ts`: profile completion now creates Paystack customer and stores `paystack_customer_code` on `parent_profiles`.
- Created `progress-snapshot.processor.ts` in worker: daily snapshot generation computing attendance rate, assignment completion rate, and average score per student-subject pair.
- Schema migration `20260410100000`: renamed all `stripe_*` billing columns to `paystack_*`, added `paystack_customer_code` to `parent_profiles`.
- Expanded `@edvoura/contracts` with SubmissionStatus, QuizAttemptStatus, AttendanceStatus enums, and all submission/grading/quiz/attendance DTOs.
- Expanded Kysely `Database` type to cover all Phase 3 tables (submissions, quiz attempts, attendance, live sessions, progress snapshots).
- Added Zoom and Google Meet env vars to environment config.
- Updated `apps/worker` with progress snapshot processor in poll loop.
- Registered `SubmissionsModule` and `QuizAttemptsModule` in app module.

## 2026-04-10 (Phase 2)

### Phase 2: Onboarding, Identity, Academics, Billing, Worker

- Expanded `@edvoura/contracts` with all Phase 2 DTOs: parent/student/tutor onboarding, admin role assignment, tutor approval, academic CRUD, subscription and quiz types.
- Expanded Kysely `Database` type to cover all 20+ schema tables across public, billing, and audit schemas.
- Implemented Parents module: `PATCH /v1/parents/me/profile`, `POST /v1/parents/me/children`, `GET /v1/parents/me/children`.
- Implemented Students module: `PATCH /v1/students/me/profile`, `GET /v1/students/me`.
- Implemented Tutors module: `PATCH /v1/tutors/me/profile`, `GET /v1/tutors/me`.
- Implemented Admin module: role assignment, role revocation, tutor approval/rejection, pending tutor list.
- Implemented Academics module: class creation and listing, lesson creation, assignment creation, quiz creation.
- Implemented Billing module: Paystack webhook controller with HMAC-SHA512 signature verification. Handles subscription lifecycle, charge success, and invoice updates. Replaced Stripe references throughout.
- Implemented Notifications service: in-app notification creation, Resend email delivery with console-log fallback when no API key is present.
- Created `apps/worker`: standalone NestJS application context (no HTTP server) with 5-second polling loop for notification email delivery and billing event processing.
- Updated environment config with Paystack and Resend vars.
- Updated `.env.example` to replace Stripe with Paystack.

## 2026-04-09

### Foundation Reset

- Established the clean rebuild repository for EDVOURA Learning Hub.
- Selected the canonical backend stack around Supabase, NestJS, PostgreSQL, and TypeScript.
- Created permanent project memory and governance files.
- Defined bounded product modules and initial delivery roadmap.
- Initialized Supabase local configuration and migration strategy.
- Started the backend service skeleton and schema foundation.
