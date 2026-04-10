# AGENT.md

This repository is designed for long-lived human and AI collaboration. Treat this file as an operating contract for anyone making changes.

## Mission

Build EDVOURA Learning Hub as a premium K-12 tutoring platform with a clean backend spine, durable documentation, and production-oriented engineering discipline.

## Last Session Handoff (2026-04-10)

Phase 3 was completed. The Academic Core is now fully operational:

- `academics`: Lesson creation now provisions Zoom/Google Meet live sessions automatically. List assignments and attendance endpoints added.
- `submissions`: Full assignment submission lifecycle — students submit work, tutors grade it, students get notified. Late submission detection included.
- `quiz-attempts`: Full quiz lifecycle — add questions, start attempt, submit with auto-scoring (JSON equality), get results.
- `attendance`: Batch attendance recording and retrieval for lessons.
- `live-session.service`: Zoom Server-to-Server OAuth integration for meeting provisioning. Google Meet stubbed pending OAuth flow.
- `billing`: Paystack customer creation API added. Customer code synced on parent profile completion.
- `parents`: Profile completion now creates a Paystack customer and stores `paystack_customer_code` on `parent_profiles`.
- `apps/worker`: Progress snapshot processor added — runs daily to compute attendance rate, assignment completion rate, and average score per student-subject pair.
- Schema migration: Renamed all `stripe_*` billing columns to `paystack_*` equivalents. Added `paystack_customer_code` to `parent_profiles`.

Payment gateway is **Paystack** (not Stripe). All Stripe references replaced.

TypeScript typecheck passes with 0 errors.

Next session: Phase 4 — Zoom/Meet OAuth improvements, notification orchestration for lesson reminders, email delivery webhooks, parent alerting workflows.


## Working Rules

- Read `README.md`, `PROJECT_RULES.md`, `PROJECT_STRUCTURE.md`, and `ARCHITECTURE_DECISIONS.md` before major changes.
- Keep one canonical architecture. Do not introduce alternate API servers, duplicate auth flows, or overlapping service layers.
- Update project memory files whenever architecture, schema, workflows, routing, roles, or deployment assumptions change.
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
