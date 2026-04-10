# AGENT.md

This repository is designed for long-lived human and AI collaboration. Treat this file as an operating contract for anyone making changes.

## Mission

Build EDVOURA Learning Hub as a premium K-12 tutoring platform with a clean backend spine, durable documentation, and production-oriented engineering discipline.

## Last Session Handoff (2026-04-10 — late session)

### Current Status: Phase 7 Maturity · Neo-Brutalist Redesign Complete

We have successfully overhauled the Edvoura Student Experience from a utilitarian dark mode to a **Vibrant Neo-Brutalist 3D** design system. This pivot focuses on high-contrast accessibility, playful energy, and premium tactile feedback.

### Redesign Summary

- **Visual Language**: High-contrast white backgrounds, navy blue command sidebars, and bold 3px/4px borders with solid 12px-16px 3D offset shadows.
- **Grade-Specific Personalization**:
    - **Grades 1-3 (Adventure Park)**: Playful "billboard" headers, rounded geometry, and cartoon-friendly iconography.
    - **Grades 4-6 (Explorer Hub)**: Energy-focused "mission" layouts with vibrant squad leaderboards.
    - **Grades 7-12 (Professional Cockpit)**: Geometric precision and sophisticated data visualization.
- **Shell Evolution**: Re-skinned `DashboardClientShell` with a deep navy anchor and a high-contrast top bar. Removed blurring/opaqueness to ensure the "3D" depth pop as requested by the user.
- **Component System**: Overhauled `MockupComponents` (Growth Telemetry, Retention Sync, Live Stream) with semantic "neon" accent shadows and high-contrast styling.

### Engineering Improvements (this session)

- **Utility Classes**: Defined `brutalist-card`, `brutalist-3d`, and `brutalist-header` in `globals.css` for consistent usage across the monorepo.
- **Pattern Language**: Integrated the "Eddy" dot-pattern (at low 5% opacity) as a premium background texture.
- **Shell Polish**: Added a dedicated top-bar search vault and active connection telemetry for better immersion.


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
