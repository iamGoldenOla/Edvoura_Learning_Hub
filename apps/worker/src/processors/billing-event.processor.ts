import { Inject, Injectable, Logger } from '@nestjs/common';

import { ENVIRONMENT } from '../../../api/src/common/config/environment.constants.js';
import type { Environment } from '../../../api/src/common/config/environment.js';
import { DatabaseService } from '../../../api/src/common/database/database.service.js';

/**
 * BillingEventProcessor polls for billing-related follow-up work:
 * - Subscriptions in 'past_due' state that need email alerts
 * - Payments in 'failed' state that require parent notification
 *
 * This is intentionally kept simple in Phase 2.
 * Full pgmq integration can be layered in once Docker-backed Supabase is validated.
 */
@Injectable()
export class BillingEventProcessor {
  private readonly logger = new Logger(BillingEventProcessor.name);

  constructor(
    @Inject(ENVIRONMENT) private readonly _env: Environment,
    private readonly databaseService: DatabaseService,
  ) {}

  async process(): Promise<void> {
    await this.alertPastDueSubscriptions();
  }

  private async alertPastDueSubscriptions(): Promise<void> {
    const pastDue = await this.databaseService.db
      .selectFrom('billing.subscriptions as bs')
      .innerJoin('profiles as p', 'p.id', 'bs.account_owner_user_id')
      .select([
        'bs.id as subscriptionId',
        'bs.paystack_subscription_code as subscriptionCode',
        'p.id as ownerId',
        'p.email as ownerEmail',
      ])
      .where('bs.status', '=', 'past_due')
      .limit(10)
      .execute();

    if (pastDue.length === 0) return;

    this.logger.log(`Found ${pastDue.length} past-due subscription(s) — notifications would be emitted here`);

    // TODO: call NotificationsService.create() for each — wired in Phase 3
    // Keeping this as a stub scaffold so the worker loop is exercised
  }
}
