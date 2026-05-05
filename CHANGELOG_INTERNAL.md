# CHANGELOG_INTERNAL.md

## [1.0.0] - 2026-05-01

### Phase 5: Billing and Entitlements

- Paystack plan CRUD APIs.
- Subscription lifecycle/gating.
- Worker billing alerts.
- Dashboard status integration.

## [0.9.1] - 2026-04-11


### Neo-Brutalist Dashboard Intensification

- **Design Overhaul**: Intensified all student dashboards to Aggressive Neo-Brutalist 3D design with high-contrast white backgrounds, navy blue command sidebars, and bold 3px/4px borders with solid 12px-16px 3D offset shadows.
- **Grade-Specific Themes**:
  - Grades 1-3 (Adventure Park): Playful billboard headers, rounded geometry, cartoon-friendly iconography.
  - Grades 4-6 (Explorer Hub): Energy-focused mission layouts with vibrant squad leaderboards.
  - Grades 7-12 (Professional Cockpit): Geometric precision and sophisticated data visualization.
- **Shell Evolution**: Re-skinned `DashboardClientShell` with deep navy anchor, high-contrast top bar, search vault, and active connection telemetry.
- **Component System**: Overhauled MockupComponents (Growth Telemetry, Retention Sync, Live Stream) with semantic neon accent shadows.
- **Utility Classes**: Defined `brutalist-card`, `brutalist-3d`, `brutalist-header` in `globals.css`.
- **Texture**: Integrated Eddy dot-pattern at 5% opacity as premium background texture.

## [0.9.0] - 2026-04-10

### Phase 9.1: Inner Marketing Pages

- **About Page**: Company story, mission, team section with premium layout.
- **Services Page**: Service offerings with feature cards and detailed descriptions.
- **Pricing Page**: Tiered pricing plans with comparison table and CTA.
- **Blog Page**: Blog listing with featured post and card grid.
- **Careers Page**: Open positions, culture section, and application flow.
- **Contact Page**: Contact form, office information, and map integration.

### Phase 9: Premium Marketing Website

- **Landing Page**: Animated hero section, feature showcases, testimonials carousel, statistics counter, and CTA sections.
- **Navbar**: Responsive navigation with mobile drawer, brand logo, and auth CTAs.
- **Footer**: Site map, social links, newsletter signup, and legal links.
- **Auth Pages**: Login and Signup pages with form validation and brand styling.
- **Design System**: Navy blue and gold brand palette, neo-brutalist accents, Inter/Outfit typography.

## [0.7.0] - 2026-04-10

### Phase 7: High-Fidelity Role Dashboards

- **Student Dashboard**: 27 route pages including analytics, assignments, badges, classes, exam-prep, flashcards, games, garden, leaderboard, library, live lessons, messages, mock-exams, notes, past-questions, planner, quizzes, reading, rewards, stickers, stories, streaks, subjects, tracker, tutor, tutor-chat, and videos.
- **Parent Dashboard**: Child overview, academic tracking, billing management.
- **Tutor Dashboard**: Class management, grading queue, schedule overview.
- **Admin Dashboard**: Platform operations, user management, analytics.
- **Grade-Band Navigation**: Dynamic sidebar navigation adapting to Grades 1-3, 4-6, and 7-12 with band-specific styling and iconography.
- **Shell Architecture**: `DashboardClientShell` layout with `StudentSidebarNav`, `StudentBandClientWrapper`, and `BandContext` for runtime grade-band switching.
- **Scaffolded 38 Dynamic Route Pages** across all student sub-features.


## [0.4.0] - 2026-04-10

### Phase 4: Live Learning & Communication

- **Zoom/Meet Integrations**: Implemented Zoom S2S token caching and Google Calendar Service Account JWT generation for automated Meet links.
- **Webhooks**: Added `ResendWebhookController` to capture `email.delivered` and `email.bounced` events using Svix signature verification.
- **Proactive Alerts**: Added `ParentAlertProcessor` for late assignments and `TutorReminderProcessor` for ungraded submissions.
- **Lesson Reminders**: Implemented `LessonReminderProcessor` that polls for lessons starting in 1 hour and cues notifications for enrolled students and parents.
- **Contracts**: Added `assignment_overdue`, `tutor_ungraded_reminder`, and `lesson_upcoming_tutor` to `NotificationKind` enum.
- **Config**: Added Support for `experimentalDecorators` and `emitDecoratorMetadata` to worker `tsconfig.json` to process injection successfully.

## [0.3.1] - 2026-04-10

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
