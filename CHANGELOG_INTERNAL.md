# CHANGELOG_INTERNAL.md

## 2026-04-10

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
