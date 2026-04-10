# IMPLEMENTATION_ROADMAP.md

## Current State

EDVOURA is in the clean rebuild stage. The priority is a stable backend foundation that can support premium product growth without repeating the instability of the previous codebase.

## Delivery Sequence

### Phase 1: Foundation

Status: Complete ✅

- Establish workspace structure
- Define canonical architecture
- Create governance and project memory files
- Set up Supabase configuration and migration strategy
- Implement auth, RBAC, and core API skeleton
- Establish initial schema and RLS foundation

### Phase 2: Onboarding and Identity

Status: Active ✅ (in progress — see CHANGELOG_INTERNAL for completed items)

- Parent signup and child onboarding
- Student onboarding by grade band
- Tutor onboarding profile and approval pipeline
- Admin role assignment workflows
- Current user context and dashboard bootstrap APIs

### Phase 3: Academic Core

Status: Planned

- Subject and grade taxonomy APIs
- Class creation and enrollment
- Lesson scheduling
- Attendance capture
- Assignment lifecycle
- Submission and grading flows
- Quiz and test lifecycle

### Phase 4: Live Learning and Communication

Status: Planned

- Zoom integration as primary live class provider
- Google Meet integration as secondary provider
- Notification orchestration
- Email delivery and webhook reconciliation
- Parent alerting and tutor operational reminders

### Phase 5: Billing and Entitlements

Status: Planned

- Stripe customer and subscription lifecycle
- Plans, invoices, and payment reconciliation
- Family entitlements and access gating
- Coupon and referral support

### Phase 6: Engagement and Progress

Status: Planned

- Progress snapshots
- Rewards, badges, and streaks
- Games metadata
- Spelling bee events

### Phase 7: Admin Intelligence and Scale

Status: Planned

- Reporting hooks and curated operational dashboards
- Moderation tools
- Data retention policies
- Performance hardening
- Background job scaling

## Build Principles

- Foundation before feature sprawl
- Database integrity before UI shortcuts
- Explicit module contracts before integration proliferation
- Auditability before convenience for privileged operations
- Documentation updates in the same change as architecture updates

## Immediate Next Build Targets (Phase 3)

1. Zoom and Google Meet lesson provisioning (live session metadata on lesson create).
2. Assignment submission endpoints and grade write-back.
3. Quiz attempt start, answer submission, and auto-scoring for objective questions.
4. Progress snapshot generation job in the worker.
5. Paystack customer creation on parent profile completion (sync `paystack_customer_code`).
6. Local Supabase migration validation with Docker Desktop.
