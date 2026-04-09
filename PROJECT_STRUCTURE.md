# PROJECT_STRUCTURE.md

## Overview

This repository uses a minimal workspace layout that supports long-term scale without introducing unnecessary day-one complexity.

## Top-Level Structure

```text
.
|-- apps/
|   `-- api/                  # Canonical privileged backend service
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

## `apps/api`

Purpose:

- Owns authentication verification, authorization decisions, domain orchestration, integrations, webhooks, and privileged mutations.

Sub-areas:

- `src/common`: reusable infrastructure such as config, auth guards, database clients, error handling, logging, and validation
- `src/modules`: domain modules grouped by bounded responsibility
- `test`: API-specific tests

## `packages/contracts`

Purpose:

- Holds shared enums, payload schemas, and response contracts that should be reusable by backend and future frontend code.

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
