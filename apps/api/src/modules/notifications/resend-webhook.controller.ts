import { Controller, Post, Req, Res, Headers, Inject, Logger } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { Webhook } from 'svix';
import { ENVIRONMENT } from '../../common/config/environment.constants.js';
import type { Environment } from '../../common/config/environment.js';
import { DatabaseService } from '../../common/database/database.service.js';

@Controller('v1/notifications/webhooks/resend')
export class ResendWebhookController {
  private readonly logger = new Logger(ResendWebhookController.name);

  constructor(
    @Inject(ENVIRONMENT) private readonly env: Environment,
    private readonly databaseService: DatabaseService,
  ) {}

  @Post()
  async handleWebhook(
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    if (!this.env.RESEND_WEBHOOK_SECRET) {
      this.logger.warn('RESEND_WEBHOOK_SECRET not set, ignoring webhook');
      return res.status(200).send({ status: 'ignored' });
    }

    if (!svixId || !svixTimestamp || !svixSignature) {
      this.logger.warn('Missing Svix headers');
      return res.status(400).send({ error: 'Missing webhook headers' });
    }

    const payload = (req as any).rawBody || JSON.stringify(req.body);

    let event: any;
    try {
      const wh = new Webhook(this.env.RESEND_WEBHOOK_SECRET);
      event = wh.verify(payload as string, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch (err) {
      this.logger.error('Webhook signature verification failed', err);
      return res.status(400).send({ error: 'Invalid signature' });
    }

    this.logger.log(`Received Resend webhook event: ${event.type}`);

    try {
      const emailId = event.data?.email_id;
      if (!emailId) {
        return res.status(200).send({ status: 'skipped_no_email_id' });
      }

      if (event.type === 'email.delivered') {
        await this.updateDeliveryStatus(emailId, 'delivered');
      } else if (event.type === 'email.bounced' || event.type === 'email.complained') {
        const errorReason = event.data?.reason || event.type;
        await this.updateDeliveryStatus(emailId, 'failed', errorReason);
      }
    } catch (err) {
      this.logger.error('Failed to process webhook event', err);
      return res.status(500).send({ error: 'Internal server error' });
    }

    return res.status(200).send({ status: 'ok' });
  }

  private async updateDeliveryStatus(externalId: string, status: 'delivered' | 'failed', errorMessage?: string): Promise<void> {
    const updateData: any = {
      delivery_status: status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    } else if (status === 'failed') {
      updateData.error_message = errorMessage;
    }

    await this.databaseService.db
      .updateTable('notification_deliveries')
      .set(updateData)
      .where('external_delivery_id', '=', externalId)
      .where('channel', '=', 'email')
      .execute();
  }
}
