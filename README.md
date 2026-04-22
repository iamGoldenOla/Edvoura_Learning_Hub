# EDVOURA Learning Hub

Where Learners' Dreams Come True

EDVOURA Learning Hub is a premium K-12 online tutoring platform for learners in Grades 1-12. This repository is the clean rebuild of the product after the previous codebase was abandoned for fragmentation and instability. The new build is backend-first, modular, Supabase-centered, and designed for premium product quality from day one.

## Product Vision

EDVOURA must feel premium, modern, trustworthy, child-safe, parent-trustworthy, and academically credible. It serves four role families:

- Students
- Parents
- Tutors
- Super Admins

The student experience is divided into three learner bands:

- Grades 1-3
- Grades 4-6
- Grades 7-12

Core product capabilities:

- Live lessons
- Assignments and submissions
- Quizzes and tests
- Games and gamification
- Spelling bee
- Progress tracking
- Parent oversight
- Tutor operations
- Super admin control
- Subscriptions and billing
- Notifications and alerts

## Recommended Backend Stack

EDVOURA uses a strong opinionated stack, not a menu of alternatives:

- Language: TypeScript on Node.js 22 LTS
- Backend framework: NestJS with Fastify
- Auth: Supabase Auth with JWT verification in the API
- Database: Supabase PostgreSQL
- Query strategy: SQL-first schema via Supabase migrations plus Kysely and the PostgreSQL driver for backend queries
- API style: REST JSON with OpenAPI, versioned under `/v1`
- Queue and jobs: Supabase Queues (`pgmq`) plus dedicated worker process from the same codebase
- Scheduling: Supabase Cron (`pg_cron`) for scheduled jobs and enqueue triggers
- File storage: Supabase Storage private buckets with signed URL access
- Notifications: in-app notifications table plus Resend for transactional email
- Analytics: first-party domain events in Postgres, curated product telemetry mirrored to PostHog later
- Billing: Paystack Billing for subscriptions and payments, with local tables ready for tutor payouts later
- Frontend framework: Next.js App Router on Vercel
- Runtime: Vercel for Next.js frontend, containerized API and workers on Google Cloud Run
- Testing: Vitest, Supertest, migration validation, and CI database reset checks
- Observability: structured logs, OpenTelemetry, Sentry, audit tables, and health checks

## Canonical Architecture

EDVOURA has one canonical backend architecture:

1. Supabase is the backend core for Auth, PostgreSQL, Storage, Realtime, Queues, and Cron.
2. The `apps/web` application is the single frontend for all users (Admin, Parent, Student, Tutor) and talks directly to Supabase and uses Next.js server actions.
3. `apps/web` uses `@supabase/ssr` to implement direct data reads on the server for performance.
4. All complex mutations, cross-aggregate workflows, billing, webhooks, admin operations, and integrations are handled via Next.js Route Handlers or Server Actions using the Supabase Service Role key.
5. Business logic lives in TypeScript services, not scattered across multiple API layers or opaque database procedures.
6. PostgreSQL enforces integrity, RLS, constraints, and a narrow set of security-definer helper functions.

## Active Cutover

The repository is currently being prepared for a phased `Vercel + Supabase only` transition.

Current status:

- `apps/web` is the Vercel deployment target
- `supabase/cutover_all.sql` contains the ordered Supabase schema bootstrap SQL
- `VERCEL_SUPABASE_CUTOVER.md` contains the phased cutover plan
- The application is a pure `Vercel + Supabase only` deployment. All dashboard data is read directly using Supabase clients, and mutations are handled via Next.js server actions and route handlers.

## Module Map

The product is organized into bounded backend modules. Each module below lists its purpose, core entities, primary actions, dependencies, and build priority.

### Core Platform

| Module | Responsibility | Main Entities | Main Actions | Dependencies | Build |
| --- | --- | --- | --- | --- | --- |
| Identity and Auth | Session trust, JWT verification, onboarding entrypoints, auth-linked profile bootstrap | `auth.users`, `public.profiles`, `public.user_roles` | Sign up, sign in, token verification, current user context | Supabase Auth, Users | Now |
| Users and Roles | Unified user context and role assignment | `public.profiles`, `public.user_roles` | Assign role, revoke role, fetch context, role lookup | Identity | Now |
| Parent Relationships | Parent-child linking and permissions | `public.parent_profiles`, `public.parent_student_links` | Link child, approve link, set guardian permissions | Users, Students | Now |
| Student Profiles | Student academic identity and learner placement | `public.student_profiles`, `public.grade_levels`, `public.grade_bands` | Create student profile, update grade, fetch learner context | Users, Parent Relationships | Now |
| Tutor Profiles | Tutor identity, approval readiness, payout readiness | `public.tutor_profiles` | Create tutor profile, update expertise, set approval state | Users | Now |
| Admin Controls | Global operational access and moderation hooks | `public.admin_profiles` | Grant admin rights, review actions, moderate entities | Users, Audit | Now |

### Academic Operations

| Module | Responsibility | Main Entities | Main Actions | Dependencies | Build |
| --- | --- | --- | --- | --- | --- |
| Subjects | Shared academic catalog | `public.subjects` | Seed subjects, list subjects, retire subjects | None | Now |
| Grade Bands | Learner band and grade taxonomy | `public.grade_bands`, `public.grade_levels` | List bands, map students to levels | None | Now |
| Classes | Teaching container for enrollments and lesson series | `public.classes`, `public.class_enrollments` | Create class, enroll student, assign tutor | Students, Tutors, Subjects | Now |
| Lessons | Scheduled teaching sessions and live meeting metadata | `public.lessons`, `private.lesson_live_sessions` | Schedule lesson, join lesson, reschedule lesson | Classes, Tutors | Now |
| Attendance | Learner presence tracking | `public.lesson_attendance` | Mark attendance, reconcile presence | Lessons | Now |
| Assignments | Homework and coursework management | `public.assignments`, `public.assignment_files` | Create assignment, attach files, publish assignment | Classes, Lessons | Now |
| Submissions | Student work submission lifecycle | `public.assignment_submissions`, `public.submission_files`, `public.submission_grades` | Submit work, grade work, return feedback | Assignments, Students | Now |
| Quizzes and Tests | Objective assessment engine | `public.quizzes`, `public.quiz_questions`, `public.quiz_attempts`, `public.quiz_responses` | Publish quiz, start attempt, submit attempt, score attempt | Classes, Lessons | Now |
| Progress Tracking | Learner performance summaries | `public.progress_snapshots` | Generate snapshot, display progress, compare trends | Attendance, Submissions, Quizzes | Later |

### Engagement

| Module | Responsibility | Main Entities | Main Actions | Dependencies | Build |
| --- | --- | --- | --- | --- | --- |
| Rewards | Track points and reward transactions | `public.reward_transactions` | Grant reward, debit reward, view balance | Students, Progress | Later |
| Badges | Achievement metadata and awards | `public.badges`, `public.student_badges` | Create badge, award badge | Students, Rewards | Later |
| Streaks | Habit and continuity tracking | `public.student_streaks` | Increment streak, reset streak | Lessons, Assignments | Later |
| Games Metadata | Catalog and entitlement metadata for educational games | `public.games_catalog` | List games, assign game access | Students | Later |
| Spelling Bee | Event-based language competition | `public.spelling_bee_events`, `public.spelling_bee_entries` | Schedule event, enroll participant, score rounds | Students, Tutors | Later |

### Business

| Module | Responsibility | Main Entities | Main Actions | Dependencies | Build |
| --- | --- | --- | --- | --- | --- |
| Plans and Subscriptions | Paid access and entitlement state | `billing.plans`, `billing.subscriptions` | Create plan, attach family subscription, cancel or renew | Users | Now |
| Invoices and Payments | Money movement ledger | `billing.invoices`, `billing.payments` | Record invoice, reconcile payment, refund | Plans and Subscriptions | Now |
| Coupons and Referrals | Promotional acquisition controls | `billing.coupons`, `billing.referrals` | Apply coupon, issue referral credit | Billing | Later |
| Tutor Payouts | Future-ready payout tracking | `billing.tutor_payout_accounts`, `billing.tutor_payouts` | Onboard payout account, create payout batch | Tutors, Billing | Later |

### Communication

| Module | Responsibility | Main Entities | Main Actions | Dependencies | Build |
| --- | --- | --- | --- | --- | --- |
| Notifications | In-app and email notification orchestration | `public.notifications`, `public.notification_deliveries` | Enqueue notification, mark read, dispatch email | Users, Jobs | Now |
| In-App Alerts | User-visible alert feed and banners | `public.notifications` | Display unread alerts, mark resolved | Notifications | Now |
| Email Hooks | Transactional email dispatch and delivery tracking | `public.notification_deliveries` | Send email, track webhook, retry failed sends | Notifications, Resend | Now |
| Support Tickets | Operational support communication | `public.support_tickets`, `public.support_ticket_messages` | Open ticket, reply, resolve | Users, Admin | Later |

### Admin and Operations

| Module | Responsibility | Main Entities | Main Actions | Dependencies | Build |
| --- | --- | --- | --- | --- | --- |
| Audit Logs | Immutable operational trace | `audit.audit_logs` | Append audit entry, inspect audit trail | All privileged modules | Now |
| Moderation Controls | Safety and platform intervention tools | `public.moderation_cases` | Flag content, review accounts, resolve cases | Audit, Admin | Later |
| Reporting Hooks | BI and operational reporting feed | `analytics.domain_events` | Export events, aggregate metrics | All core modules | Later |
| Operational Dashboards | Internal admin summaries and KPIs | materialized views later | Surface business and ops metrics | Reporting, Billing, Academics | Later |

## Project Memory

The following files are part of the permanent project memory and must be kept current when architecture, workflows, schema, routing, or operating assumptions change:

- `README.md`
- `AGENT.md`
- `PROJECT_RULES.md`
- `PROJECT_STRUCTURE.md`
- `IMPLEMENTATION_ROADMAP.md`
- `PRODUCT_WORKFLOWS.md`
- `ARCHITECTURE_DECISIONS.md`
- `CHANGELOG_INTERNAL.md`

## Local Development

1. Copy `.env.example` to `.env`.
2. Fill in Supabase, Stripe, Resend, Zoom, and Google credentials.
3. Install dependencies with `pnpm install`.
4. Start local Supabase with `pnpm supabase:start`.
5. Reset and seed the database with `pnpm supabase:db:reset`.
6. Start the API with `pnpm dev:api`.

## Brand Direction

Frontend implementation is not the first milestone, but the backend should preserve these product cues:

- Navy blue with gold or yellow accents
- Premium modern academic tone
- Neo-brutalist accents used sparingly
- Polished, trustworthy, non-generic product language

## Non-Negotiables

- No duplicate API surfaces with overlapping business logic.
- No silent architecture drift.
- No schema changes without migration files and memory updates.
- No direct frontend writes for cross-aggregate business workflows.
- No child-sensitive analytics payloads with unnecessary PII.
