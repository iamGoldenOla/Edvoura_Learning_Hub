import { Inject, Injectable, Logger } from '@nestjs/common';
import type { NotificationKind } from '@edvoura/contracts';

import { ENVIRONMENT } from '../../common/config/environment.constants.js';
import type { Environment } from '../../common/config/environment.js';
import { DatabaseService } from '../../common/database/database.service.js';

export interface CreateNotificationInput {
  recipientUserId: string;
  actorUserId?: string;
  kind: NotificationKind;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

type ResendEmailResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<{ id?: string }>;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(ENVIRONMENT) private readonly env: Environment,
    private readonly databaseService: DatabaseService,
  ) {}

  async create(input: CreateNotificationInput): Promise<string> {
    const inserted = await this.databaseService.db
      .insertInto('notifications')
      .values({
        recipient_user_id: input.recipientUserId,
        actor_user_id: input.actorUserId ?? null,
        kind: input.kind,
        title: input.title,
        body: input.body,
        status: 'unread',
        data: input.data ?? {},
        read_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    // Queue for email delivery
    await this.queueEmailDelivery(inserted.id!, input.recipientUserId, input.title, input.body);

    return inserted.id!;
  }

  async listForUser(userId: string) {
    return this.databaseService.db
      .selectFrom('notifications')
      .select([
        'id',
        'kind',
        'title',
        'body',
        'status',
        'data',
        'read_at as readAt',
        'created_at as createdAt',
      ])
      .where('recipient_user_id', '=', userId)
      .orderBy('created_at', 'desc')
      .limit(50)
      .execute();
  }

  async markRead(notificationId: string, userId: string): Promise<void> {
    await this.databaseService.db
      .updateTable('notifications')
      .set({
        status: 'read',
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', notificationId)
      .where('recipient_user_id', '=', userId)
      .execute();
  }

  private async queueEmailDelivery(
    notificationId: string,
    recipientUserId: string,
    title: string,
    body: string,
  ): Promise<void> {
    try {
      await this.databaseService.db
        .insertInto('notification_deliveries')
        .values({
          notification_id: notificationId,
          channel: 'email',
          delivery_status: 'queued',
          provider: 'resend',
          external_delivery_id: null,
          attempted_at: null,
          delivered_at: null,
          error_message: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .execute();

      // If Resend key available, attempt immediate delivery
      if (this.env.RESEND_API_KEY) {
        await this.sendEmail(notificationId, recipientUserId, title, body);
      } else {
        this.logger.log(`[DEV] Email queued for ${recipientUserId}: "${title}"`);
      }
    } catch (err) {
      this.logger.error('Failed to queue email delivery', err);
    }
  }

  private async sendEmail(
    notificationId: string,
    recipientUserId: string,
    title: string,
    body: string,
  ): Promise<void> {
    // Get recipient email address
    const profile = await this.databaseService.db
      .selectFrom('profiles')
      .select('email')
      .where('id', '=', recipientUserId)
      .executeTakeFirst();

    if (!profile) return;

    try {
      const response = (await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.env.RESEND_FROM_EMAIL,
          to: [profile.email],
          subject: title,
          text: body,
        }),
      })) as ResendEmailResponse;

      if (!response.ok) {
        throw new Error(`Resend API error: ${response.status}`);
      }

      const result = await response.json();

      await this.databaseService.db
        .updateTable('notification_deliveries')
        .set({
          delivery_status: 'sent',
          external_delivery_id: result.id ?? null,
          attempted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .where('notification_id', '=', notificationId)
        .where('channel', '=', 'email')
        .execute();
    } catch (err) {
      this.logger.error(`Email delivery failed for notification ${notificationId}`, err);

      await this.databaseService.db
        .updateTable('notification_deliveries')
        .set({
          delivery_status: 'failed',
          attempted_at: new Date().toISOString(),
          error_message: String(err),
          updated_at: new Date().toISOString(),
        })
        .where('notification_id', '=', notificationId)
        .where('channel', '=', 'email')
        .execute();
    }
  }
}
