# Dashboard Interaction Matrix

This file is the working contract for cross-dashboard delivery behavior. The current reusable code artifact lives in:

- `apps/web/src/lib/dashboard/interactionMatrix.ts`
- `apps/web/src/lib/dashboard/feedRules.ts`
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

### Parent and Tutor Workflow Alerts

- `parent_support_request`
  - Targets: `tutor`
  - Tutor surfaces: `messages`, `notifications`

- `tutor_parent_update`
  - Targets: `parent`
  - Parent surfaces: `messages`, `notifications`

## Feed Rules

- Role feed rules now live in `apps/web/src/lib/dashboard/feedRules.ts`.
- They define the intended inbox/feed buckets per role, including:
  - student: `learning_content`, `practice_and_assessment`, `classroom_resources`, `platform_announcements`
  - parent: `child_progress_alerts`, `family_communication`, `platform_announcements`
  - tutor: `ai_review_queue`, `review_feedback`, `family_communication`, `workflow_alerts`
- Notifications sent through the shared delivery layer should carry route, surface, and feed-key hints for downstream UI rendering.

## Delivery Principles

- Delivery must be audience-scoped, not globally published to all learners.
- Student AI content must be filtered by grade and enrolled subject.
- Parent alerts should be delivered to the parent account and then mapped to the relevant child context in the UI.
- New publish/review flows should extend `distribution.ts` instead of creating route-local side effects.
- Broader broadcasts should use `POST /api/dashboard/notifications/broadcast` so the same cross-role delivery layer is used.

## Next Expansion

1. Connect admin notification UI actions to the broadcast API route.
2. Add dedicated inbox/feed rendering widgets that use the feed rules instead of generic alert lists.
3. Add regression coverage for:
   - tutor -> student
   - tutor -> super_admin
   - super_admin -> tutor
   - tutor -> parent
