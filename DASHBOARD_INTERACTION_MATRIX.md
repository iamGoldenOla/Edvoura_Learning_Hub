# Dashboard Interaction Matrix

This file is the working contract for cross-dashboard delivery behavior. The current reusable code artifact lives in:

- `apps/web/src/lib/dashboard/interactionMatrix.ts`
- `apps/web/src/lib/dashboard/distribution.ts`

## Current Rules

### Tutor-Originated AI Content

- `ai_lesson_note`
  - Targets: `student`, `parent`, `super_admin`
  - Student surfaces: `subjects`, `notes`
  - Parent surface: `notifications`
  - Super admin surface: `review_queue`

- `ai_quiz`
  - Targets: `student`, `parent`, `super_admin`
  - Student surfaces: `subjects`, `quiz`
  - Parent surface: `notifications`
  - Super admin surface: `review_queue`

- `ai_spelling_bee`
  - Targets: `student`, `parent`, `super_admin`
  - Student surfaces: `subjects`, `spelling_bee`
  - Parent surface: `notifications`
  - Super admin surface: `review_queue`

### Tutor-Originated Manual Publishing

- `manual_resource_or_assignment`
  - Targets: `student`, `parent`
  - Student surface: `library` or assignment-linked learning surface
  - Parent surface: `notifications`

### Super Admin Review Decisions

- `review_decision`
  - Targets: `tutor`
  - Tutor surfaces: `ai_workspace`, `notifications`

### Super Admin Broadcasts

- `broadcast_announcement`
  - Targets: `student`, `parent`, `tutor`, `admin`
  - Surfaces: `notifications`

## Delivery Principles

- Delivery must be audience-scoped, not globally published to all learners.
- Student AI content must be filtered by grade and enrolled subject.
- Parent alerts should be delivered to the parent account and then mapped to the relevant child context in the UI.
- New publish/review flows should extend `distribution.ts` instead of creating route-local side effects.

## Next Expansion

1. Add parent-to-tutor and tutor-to-parent non-chat workflow events.
2. Add surface-specific inbox/feed rules per role.
3. Add regression coverage for:
   - tutor -> student
   - tutor -> super_admin
   - super_admin -> tutor
   - tutor -> parent
