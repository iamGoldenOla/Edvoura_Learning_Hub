# IMPLEMENTATION_ROADMAP.md

## Current State

EDVOURA has progressed from the clean rebuild through backend foundation, onboarding, academic core, live learning communication, role dashboards, and a premium marketing website. The platform is now full-stack operational with mock data and ready for API data binding and billing integration.

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
- Paystack billing webhook integration
- Notification service and worker process

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

Status: Complete ✅

- Zoom S2S OAuth token caching and meeting provisioning
- Google Meet service account JWT generation (stub)
- Resend webhook controller for email delivery tracking
- Proactive parent alerts for late assignments
- Tutor reminders for ungraded submissions
- Lesson reminder processor for upcoming sessions

### Phase 7: Role Dashboards

Status: Complete ✅

- High-fidelity Student, Parent, Tutor, and Admin dashboards
- 27 student route pages (analytics, assignments, badges, classes, games, leaderboard, library, live, quizzes, rewards, streaks, etc.)
- Grade-band-aware sidebar navigation (Grades 1-3, 4-6, 7-12)
- `DashboardClientShell` with deep navy anchor and high-contrast top bar
- `StudentBandClientWrapper` for grade-specific personalization
- Aggressive Neo-Brutalist 3D design system with utility classes

### Phase 9: Marketing Website

Status: Complete ✅

- Premium landing page with animated hero, feature showcases, testimonials, and CTA sections
- Responsive Navbar with mobile drawer and Footer with site map
- Login and Signup auth flow pages
- Brand design system (navy/gold, neo-brutalist accents)

### Phase 9.1: Inner Marketing Pages

Status: Complete ✅

- About page
- Services page
- Pricing page with plan tiers
- Blog page
- Careers page
- Contact page

### Phase 5: Billing and Entitlements

Status: In Progress 🛠️


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

### Phase 8: Admin Intelligence and Scale

Status: Planned

- Reporting hooks and curated operational dashboards
- Moderation tools
- Data retention policies
- Performance hardening
- Background job scaling

### Phase 10: Data Binding and Production Readiness

Status: Planned

- Connect all frontend dashboards to live API data
- Wire Supabase Auth into login/signup flows
- End-to-end testing
- Production deployment configuration
- Performance optimization

## Build Principles

- Foundation before feature sprawl
- Database integrity before UI shortcuts
- Explicit module contracts before integration proliferation
- Auditability before convenience for privileged operations
- Documentation updates in the same change as architecture updates

## Immediate Next Build Targets (Phase 5)

1. Paystack subscription plan CRUD and management API
2. Subscription creation and lifecycle management
3. Invoice generation and payment reconciliation
4. Family access gating based on subscription state
5. Dashboard subscription status display
6. Coupon and referral code support
