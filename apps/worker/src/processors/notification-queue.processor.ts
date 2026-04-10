import { Inject, Injectable, Logger } from '@nestjs/common';

import { ENVIRONMENT } from '../../../api/src/common/config/environment.constants.js';
import type { Environment } from '../../../api/src/common/config/environment.js';
import { DatabaseService } from '../../../api/src/common/database/database.service.js';

@Injectable()
export class NotificationQueueProcessor {
  private readonly logger = new Logger(NotificationQueueProcessor.name);

  constructor(
    @Inject(ENVIRONMENT) private readonly env: Environment,
    private readonly databaseService: DatabaseService,
  ) {}

  async process(): Promise<void> {
    // Poll notification_deliveries table for queued items
    const queued = await this.databaseService.db
      .selectFrom('notification_deliveries as nd')
      .innerJoin('notifications as n', 'n.id', 'nd.notification_id')
      .innerJoin('profiles as p', 'p.id', 'n.recipient_user_id')
      .select([
        'nd.id as deliveryId',
        'nd.notification_id as notificationId',
        'n.title',
        'n.body',
        'p.email as recipientEmail',
      ])
      .where('nd.delivery_status', '=', 'queued')
      .where('nd.channel', '=', 'email')
      .limit(20)
      .execute();

    if (queued.length === 0) return;

    this.logger.log(`Processing ${queued.length} queued email notification(s)`);

    for (const delivery of queued) {
      await this.attemptEmailDelivery(delivery);
    }
  }

  private async attemptEmailDelivery(delivery: {
    deliveryId: string;
    notificationId: string;
    title: string;
    body: string;
    recipientEmail: string;
  }): Promise<void> {
    try {
      if (!this.env.RESEND_API_KEY) {
        this.logger.log(`[DEV stub] Would send email to ${delivery.recipientEmail}: "${delivery.title}"`);

        await this.databaseService.db
          .updateTable('notification_deliveries')
          .set({
            delivery_status: 'sent',
            attempted_at: new Date().toISOString(),
            error_message: 'Dev stub — no RESEND_API_KEY set',
            updated_at: new Date().toISOString(),
          })
          .where('id', '=', delivery.deliveryId)
          .execute();

        return;
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.env.RESEND_FROM_EMAIL,
          to: [delivery.recipientEmail],
          subject: delivery.title,
          text: delivery.body,
        }),
      });

      if (!response.ok) {
        throw new Error(`Resend API responded with ${response.status}`);
      }

      const result = (await response.json()) as { id?: string };

      await this.databaseService.db
        .updateTable('notification_deliveries')
        .set({
          delivery_status: 'sent',
          external_delivery_id: result.id ?? null,
          attempted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .where('id', '=', delivery.deliveryId)
        .execute();

      this.logger.log(`Email sent to ${delivery.recipientEmail}: "${delivery.title}"`);
    } catch (err) {
      this.logger.error(`Email delivery failed for ${delivery.deliveryId}`, err);

      await this.databaseService.db
        .updateTable('notification_deliveries')
        .set({
          delivery_status: 'failed',
          attempted_at: new Date().toISOString(),
          error_message: String(err),
          updated_at: new Date().toISOString(),
        })
        .where('id', '=', delivery.deliveryId)
        .execute();
    }
  }
}
