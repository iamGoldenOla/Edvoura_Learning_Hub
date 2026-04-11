# ARCHITECTURE_DECISIONS.md

## ADR-001: TypeScript on Node.js 22 LTS

Decision:

- Use TypeScript on Node.js 22 LTS for all backend application code.

Why:

- It provides a consistent language across backend, future frontend, shared contracts, and automation.
- It offers strong typing for a multi-role product with high workflow complexity.

Consequences:

- Strict typing is mandatory.
- Shared package contracts are first-class.

## ADR-002: NestJS with Fastify for the Canonical Backend App

Decision:

- Use NestJS with the Fastify adapter for `apps/api`.

Why:

- EDVOURA needs explicit modules, dependency boundaries, guards, interceptors, testing support, and long-term maintainability.
- Fastify keeps the HTTP layer efficient without sacrificing the Nest module system.

Consequences:

- The codebase will favor explicit module boundaries over lightweight ad hoc routing.

## ADR-003: Supabase Is the Backend Core

Decision:

- Use Supabase for Auth, PostgreSQL, Storage, Realtime, Queues, and Cron.

Why:

- It fits the product direction, keeps infrastructure compact, and supports both direct RLS-safe reads and service-layer orchestration.

Consequences:

- Schema history must remain SQL-first.
- Auth, RLS, and storage path design are foundational concerns, not afterthoughts.

## ADR-004: SQL-First Schema, Kysely for Server Queries

Decision:

- Manage schema through Supabase SQL migrations. Use Kysely with the PostgreSQL driver in the API for typed queries.

Why:

- This avoids ORM migration drift while preserving typed backend query ergonomics.
- It keeps Supabase-native features such as RLS, views, and helper functions first-class.

Consequences:

- Do not introduce a second schema authority such as Prisma migrations.

## ADR-005: One Canonical Privileged API Surface

Decision:

- `apps/api` is the single privileged backend and frontend-facing BFF.

Why:

- Avoids duplicate logic between direct Supabase calls, Next.js route handlers, edge functions, and separate backend apps.

Consequences:

- Frontend direct database access is limited to an allowlist of RLS-safe reads.
- All complex writes and integrations go through the API.

## ADR-006: Roles Plus Relationships for Authorization

Decision:

- Authorization combines RBAC and relationship-aware access control.

Why:

- EDVOURA must support parents linked to children, tutors linked to classes, and admins with audited powers.

Consequences:

- Role checks alone are insufficient.
- Helper functions and service authorization checks must consider relationship tables.

## ADR-007: `auth.users` and `public.profiles` Have Distinct Responsibilities

Decision:

- Keep authentication identity in `auth.users` and application identity in `public.profiles`.

Why:

- This prevents the common mistake of mixing auth and domain concerns.

Consequences:

- Domain profile tables extend `public.profiles` through `user_id`.
- Backend code should not treat `auth.users` as the main application user table.

## ADR-008: Supabase Queues and Cron First

Decision:

- Start with `pgmq` and `pg_cron` rather than Redis-based queues or heavyweight workflow engines.

Why:

- It keeps operational complexity low while fitting the Postgres-centered architecture.

Consequences:

- A dedicated worker runtime will process queued jobs from the same codebase.
- Revisit only if throughput or workflow complexity materially outgrows this model.

## ADR-009: Paystack for Billing

Decision:

- Use Paystack for subscriptions, invoices, and payment processing, with local tables ready for future tutor payout flows.

Why:

- Paystack provides the best regional coverage for the target market and supports recurring billing and customer management.

Consequences:

- Local billing tables mirror Paystack objects but do not replace Paystack as payment executor.
- Webhook verification uses HMAC-SHA512 with the Paystack secret key.
- All `stripe_*` columns have been renamed to `paystack_*` in the schema.

## ADR-010: Private Storage by Default

Decision:

- Use private Supabase Storage buckets and signed URLs by default.

Why:

- Student work, tutor materials, and family-related documents must not be public by default.

Consequences:

- File paths and access rules must be modeled intentionally.

## ADR-011: Next.js on Vercel, Cloud Run Backend Runtime

Decision:

- Deploy the Next.js frontend (`apps/web`) to Vercel and the backend API and worker containers to Google Cloud Run.

Why:

- Next.js App Router provides server components, streaming, and optimal Vercel integration for the marketing and dashboard frontend.
- This separates frontend delivery concerns from backend runtime reliability while keeping the operating model compact.

Consequences:

- The backend is not optimized around Vercel serverless constraints.
- Webhooks and workers remain in a stable container runtime.
- Frontend uses App Router with `src/app/` directory convention.

## ADR-012: Product Analytics Are Curated Mirrors, Not the Source of Truth

Decision:

- Store canonical domain events in Postgres and mirror only curated product analytics events to external analytics tooling.

Why:

- This improves privacy control, supports future BI, and keeps sensitive learner data out of generic analytics streams.

Consequences:

- Event naming and classification need governance.

## ADR-013: Aggressive Neo-Brutalist 3D Design System

Decision:

- Adopt an aggressive Neo-Brutalist 3D visual language as the core design system for all Edvoura frontend surfaces.

Why:

- The design must feel premium, distinctive, and memorable — not generic or template-like.
- High-contrast accessibility pairs well with the K-12 audience across age bands.
- Bold 3D offset shadows and thick borders create tactile depth that differentiates the product.

Consequences:

- All dashboard and marketing components use brutalist utility classes (`brutalist-card`, `brutalist-3d`, `brutalist-header`).
- Grade-band-specific themes layer on top of the base system (Adventure Park, Explorer Hub, Professional Cockpit).
- CSS complexity is higher but encapsulated in `globals.css` utility classes.

## ADR-014: Next.js App Router with Monorepo Integration

Decision:

- Use Next.js App Router (`src/app/` directory) within the pnpm monorepo for all frontend surfaces.

Why:

- App Router provides server components, parallel routes, and streaming that support the complex dashboard layouts.
- Monorepo integration allows sharing `@edvoura/contracts` between frontend and backend.

Consequences:

- Route organization follows Next.js file-system conventions.
- Dashboard routes are nested under `dash/` with role sub-routes.
- Components are organized by domain (marketing, dashboards, ui).
