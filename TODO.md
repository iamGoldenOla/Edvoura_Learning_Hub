# Phase 5 Billing Implementation TODO

## Overview
Implement Paystack billing lifecycle per IMPLEMENTATION_ROADMAP.md:
- Plans CRUD/API.
- Subscription creation/gating.
- Invoices/payments.
- Worker alerts.
- Dashboard status/gating.

## Steps
1. [✅] Update docs: ROADMAP.md (Phase 5 🛠️), CHANGELOG_INTERNAL.md.

2. [✅] packages/contracts: Types exist (schemas/DTOs).
3. [✅] apps/web/src/lib/billing.ts: Paystack client, NotificationsService.create().
4. [✅] Edit apps/worker/src/processors/billing-event.processor.ts: Wire NotificationsService.
5. [✅] New apps/web/src/app/api/billing/route.ts: Plan CRUD.
6. [✅] New apps/web/src/app/api/billing/subscribe/action.ts: Create sub/action.
7. [ ] Edit dash layouts: Add sub status/gating (e.g., dash/layout.tsx).
8. [ ] Tests: e2e billing flows (playwright).
9. [ ] CI: .github/workflows/ci.yml (lint/test).
10. [ ] Verify: Local Paystack sandbox, worker emissions.

Progress: Starting Step 1.

