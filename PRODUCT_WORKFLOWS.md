# PRODUCT_WORKFLOWS.md

## Purpose

This file documents the canonical product workflows that the backend must support. If a workflow changes materially, update this file.

## Role Surfaces

- Student Dashboard
- Parent Dashboard
- Tutor Dashboard
- Super Admin Dashboard

## Student Learner Bands

- Grades 1-3
- Grades 4-6
- Grades 7-12

## Canonical Workflows

### Parent Signup and Child Onboarding

1. Parent creates an account through Supabase Auth.
2. The system provisions `public.profiles`.
3. Parent completes parent profile details.
4. Parent creates or links one or more child learner records.
5. Each child is assigned a grade level and learner band.
6. Parent subscription and access entitlements are evaluated.
7. Parent dashboard shows linked learners, billing state, and academic summaries.

### Student Onboarding

1. Student account is created directly or through parent-managed onboarding.
2. Student profile is created with grade level, grade band, timezone, and learning metadata.
3. The system associates the student with a parent or guardian when applicable.
4. Student dashboard is shaped by learner band.
5. Student receives only permitted class, lesson, assignment, and quiz data.

### Tutor Onboarding and Approval

1. Tutor signs up and creates a tutor profile.
2. Tutor provides expertise, bio, subject coverage, and availability metadata.
3. Admin reviews and approves the tutor.
4. Approved tutors can be assigned to classes and lessons.
5. Future payout onboarding connects to billing data without changing the core identity model.

### Live Lesson Scheduling and Joining

1. Admin or tutor creates a class.
2. A lesson is scheduled under the class.
3. The system provisions live-session metadata through Zoom first, Google Meet second.
4. Authorized students and linked parents can view lesson schedules.
5. Authorized users receive controlled join access through the backend.
6. Attendance and lesson outcomes are recorded.

### Assignment Lifecycle

1. Tutor creates an assignment under a class or lesson.
2. Assignment resources are uploaded to controlled storage.
3. Students submit responses and files.
4. Tutors grade submissions and return feedback.
5. Progress and notification events are emitted.

### Quiz and Test Lifecycle

1. Tutor creates a quiz or test.
2. Questions are stored with explicit scoring metadata.
3. Students start attempts.
4. Objective questions can auto-score.
5. Results feed progress tracking and parent visibility.

### Subscription and Billing Lifecycle

1. A parent or account owner starts a paid plan.
2. Paystack owns payment execution and invoice state.
3. Paystack webhooks (HMAC-SHA512 verified) synchronize local subscription and invoice tables.
4. Entitlements determine access to classes, lessons, and premium features.
5. Failed payment states are surfaced to the parent and admin dashboards.
6. Paystack customer is auto-created during parent profile completion.

### Notifications and Alerts

1. Domain actions emit notification intents.
2. Notification rows are created in the database.
3. Delivery workers fan out email and future channels.
4. Delivery state and retries are tracked.
5. Users can mark in-app notifications as read.

### Admin Oversight and Reporting

1. Admins review tutors, subscriptions, classes, learner progress, and operational issues.
2. High-risk actions are audited.
3. Reporting hooks emit curated events for future dashboards.
4. Moderation tooling can be layered in without changing the core architecture.

### Marketing and Discovery

1. Visitors land on the marketing homepage with animated hero and feature showcases.
2. Inner pages (About, Services, Pricing, Blog, Careers, Contact) provide product context.
3. Pricing page displays plan tiers with comparison.
4. CTA sections direct visitors to signup.
5. Responsive Navbar and Footer provide consistent navigation.

### Dashboard Navigation and Grade-Band Experience

1. Authenticated users are routed to their role-specific dashboard (Student, Parent, Tutor, Admin).
2. Student dashboards detect the student's grade band and personalize the sidebar navigation.
3. Grade-band themes adapt visual language: Adventure Park (1-3), Explorer Hub (4-6), Professional Cockpit (7-12).
4. Each dashboard provides feature routes appropriate to the user's role and permissions.
5. `DashboardClientShell` provides consistent layout with deep navy sidebar and high-contrast top bar.

## Workflow Guardrails

- Parent visibility must respect parent-child relationships.
- Tutor visibility must respect class and lesson assignments.
- Student access must respect grade band, enrollments, and entitlements.
- Super admin actions must be auditable.
- Billing and entitlement changes must be webhook-safe and idempotent.
