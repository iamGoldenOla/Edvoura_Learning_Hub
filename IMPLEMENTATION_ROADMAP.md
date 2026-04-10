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

Status: Complete ✅

- Parent signup and child onboarding
- Student onboarding by grade band
- Tutor onboarding profile and approval pipeline
- Admin role assignment workflows
- Current user context and dashboard bootstrap APIs

### Phase 3: Academic Core

Status: Complete ✅

- Subject and grade taxonomy APIs
- Class creation and enrollment
- Lesson scheduling with live session provisioning (Zoom / Google Meet)
- Attendance capture and recording
- Assignment lifecycle with submission and grading flows
- Quiz and test lifecycle with auto-scoring
- Progress snapshot generation (daily worker job)
- Paystack customer creation on parent onboarding

### Phase 4: Live Learning and Communication

Status: Planned (Next)

- Zoom integration improvements (OAuth refresh, webhook for meeting events)
- Google Meet OAuth flow implementation
- Notification orchestration for lesson reminders
- Email delivery webhook reconciliation
- Parent alerting and tutor operational reminders

### Phase 5: Billing and Entitlements

Status: Planned

- Paystack customer and subscription lifecycle
- Plans, invoices, and payment reconciliation
- Family entitlements and access gating
- Coupon and referral support

### Phase 6: Engagement and Progress

Status: Planned

- Progress snapshots enhancements
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

## Immediate Next Build Targets (Phase 4)

1. Zoom OAuth token refresh and meeting event webhooks.
2. Google Meet full OAuth integration (service account or user consent flow).
3. Lesson reminder notification scheduling via `pg_cron`.
4. Email delivery webhook reconciliation with Resend.
5. Parent alert workflows for upcoming lessons and late assignments.
6. Tutor operational reminders for ungraded submissions and upcoming classes.
