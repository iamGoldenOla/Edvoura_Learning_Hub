# PROJECT_STRUCTURE.md

## Overview

This repository uses a monorepo workspace layout managed by pnpm. It supports backend services, a frontend web application, shared contracts, and database infrastructure.

## Top-Level Structure

```text
.
|-- apps/
|   |-- web/                  # Frontend web application (Next.js)
|   `-- worker/               # Background job processor (NestJS application context)
|-- packages/
|   `-- contracts/            # Shared domain contracts, enums, schemas, DTO shapes
|-- supabase/
|   |-- config.toml           # Supabase local configuration
|   |-- migrations/           # Canonical SQL schema history
|   |-- seed.sql              # Deterministic local reset seed
|   `-- seeds/                # Optional future additional seed inputs
|-- tests/
|   |-- integration/          # Cross-module and database-oriented tests
|   `-- e2e/                  # End-to-end test assets and scenarios
|-- README.md
|-- AGENT.md
|-- PROJECT_RULES.md
|-- PROJECT_STRUCTURE.md
|-- IMPLEMENTATION_ROADMAP.md
|-- PRODUCT_WORKFLOWS.md
|-- ARCHITECTURE_DECISIONS.md
|-- CHANGELOG_INTERNAL.md
|-- .env.example
|-- package.json
|-- pnpm-workspace.yaml
`-- tsconfig.base.json
```


## `apps/web`

Purpose:

- The premium Next.js frontend serving marketing pages, auth flows, and role-specific dashboards.

Sub-areas:

- `src/app/`: Next.js App Router pages
  - Root marketing pages: landing (`page.tsx`), about, services, pricing, blog, careers, contact
  - Auth pages: `login/`, `signup/`
  - Dashboards: `dash/` with sub-routes for `student/`, `parent/`, `tutor/`, `admin/`, `profile/`
  - Student dashboard: 27 feature routes (analytics, assignments, badges, classes, exam-prep, flashcards, games, garden, leaderboard, library, live, message, mock-exams, notes, past-questions, planner, quiz, read, rewards, stickers, stories, streak, subjects, tracker, tutor, tutor-chat, videos)
- `src/components/`:
  - `marketing/`: Navbar, Footer
  - `dashboards/`: DashboardClientShell, StudentSidebarNav, StudentBandClientWrapper, BandContext, and grade-band-specific components (grades-1-3, grades-4-6, grades-7-12, shared)
  - `ui/`: Reusable UI primitives
- `src/app/globals.css`: Design system with brutalist utility classes

## `apps/worker`

Purpose:

- Standalone NestJS application context (no HTTP server) with polling loop for background job processing.

Responsibilities:

- Notification email delivery via Resend
- Billing event processing
- Progress snapshot generation
- Lesson reminder processing
- Parent alert and tutor reminder processing

## `packages/contracts`

Purpose:

- Holds shared enums, payload schemas, and response contracts that should be reusable by backend and frontend code.

Rules:

- Keep the package dependency-light.
- Prefer schema and type contracts over implementation logic.

## `supabase`

Purpose:

- Holds the canonical database history and local platform configuration.

Rules:

- All schema changes go through `supabase/migrations`.
- Seed data must be deterministic and safe for local reset.
- Internal helper functions and RLS policy changes belong in migrations, not ad hoc SQL snippets elsewhere.

## `tests`

Purpose:

- Stores cross-cutting integration assets that should not live inside one module.

Expected future contents:

- database fixtures
- webhook payload fixtures
- RBAC scenario tests
- subscription lifecycle scenarios

## Memory Files

These root files are part of the permanent operating memory of the project:

- `README.md`
- `AGENT.md`
- `PROJECT_RULES.md`
- `PROJECT_STRUCTURE.md`
- `IMPLEMENTATION_ROADMAP.md`
- `PRODUCT_WORKFLOWS.md`
- `ARCHITECTURE_DECISIONS.md`
- `CHANGELOG_INTERNAL.md`

Whenever a major decision changes, update the relevant memory file in the same change.
