# PROJECT_RULES.md

## Purpose

This file defines the non-negotiable engineering, architecture, schema, security, and documentation rules for EDVOURA Learning Hub.

## Architecture Rules

- Use one canonical backend architecture.
- `apps/api` is the single privileged backend and BFF surface.
- Do not add a second backend, parallel API layer, or duplicate workflow engine.
- Keep business logic in TypeScript modules and services.
- Keep database logic narrow and explicit: constraints, indexes, views, helper functions, triggers, and RLS only.
- Avoid feature sprawl inside one module. Add module boundaries before complexity accumulates.

## Supabase Rules

- Supabase Auth is the only identity provider of record unless an explicit architecture decision says otherwise.
- Supabase PostgreSQL is the system of record.
- Supabase Storage is the default file store.
- Supabase Queues and Cron are the default async backbone until scaling data proves otherwise.
- Supabase migrations are the canonical schema history. Do not let ORM-generated migrations compete with them.
- RLS must be enabled on all application tables in exposed schemas unless a deliberate exception is documented.

## Schema Rules

- Naming style is `snake_case`.
- Table names are plural.
- Primary keys are `uuid` unless the table is purely internal and explicitly documented otherwise.
- Standard timestamps are `created_at` and `updated_at`.
- Foreign keys use `<entity>_id` or `<role>_user_id` for user-bound relationships.
- Do not mix identity concepts:
  - `auth.users` stores authentication identity
  - `public.profiles` stores application identity
  - domain-specific tables extend `public.profiles` through `user_id`
- Never store role meaning in multiple conflicting places.
- Any new table must have documented ownership and access rules before frontend exposure.

## API Rules

- Public API is REST under `/v1`.
- APIs must be versioned explicitly.
- Complex writes belong in the API, not in direct browser SQL or RPC calls.
- Direct frontend Supabase access is read-oriented and restricted to RLS-safe tables and views.
- Webhooks must be idempotent and verified.

## Auth and RBAC Rules

- Roles are additive, not mutually exclusive.
- Current authorization is based on both role and relationship.
- JWTs provide identity proof. Database lookups remain the source of truth for privileged authorization.
- Super admin powers must never depend on client-supplied claims alone.
- Any role change must be audited.

## Storage Rules

- Default bucket posture is private.
- Access to files must happen through signed URLs or controlled API flows.
- File paths must encode tenant context clearly, for example `student-work/<student_user_id>/<submission_id>/...`.
- Do not expose raw provider URLs directly to clients when access should be controlled.

## Billing Rules

- Stripe is the only billing source of truth for payment execution.
- Local billing tables mirror Stripe state for product logic, entitlements, and reporting.
- Never trust the client to confirm payment success.
- Subscription and invoice changes from Stripe must flow through verified webhooks.

## Notification Rules

- Notifications are event-driven.
- The app writes canonical notification intents to the database first.
- Delivery workers fan out to email and future channels.
- Delivery status must be traceable.

## Analytics Rules

- First-party domain events are stored in Postgres.
- Product analytics tools receive curated, privacy-safe mirrors only.
- Avoid storing unnecessary child-sensitive PII in analytics payloads.
- Use immutable event names once public dashboards depend on them.

## Security Rules

- Use least privilege everywhere.
- Service-role keys stay server-only.
- Secrets do not belong in code, migrations, or committed config files.
- Every external webhook must validate signature and support replay-safe idempotency.
- Audit privileged actions.

## Documentation Rules

- If architecture changes, update `README.md` and `ARCHITECTURE_DECISIONS.md`.
- If file or module layout changes, update `PROJECT_STRUCTURE.md`.
- If workflows change, update `PRODUCT_WORKFLOWS.md`.
- If build sequence changes, update `IMPLEMENTATION_ROADMAP.md`.
- If any milestone lands, add an entry to `CHANGELOG_INTERNAL.md`.

## Product Rules

- EDVOURA is a premium tutoring platform, not a commodity LMS.
- Parent trust, learner safety, and tutor accountability are first-order concerns.
- Student experiences must remain grade-band aware.
- Avoid shortcuts that make future parent oversight or academic reporting harder.
