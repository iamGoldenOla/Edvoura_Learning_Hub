import { Inject, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

import { ENVIRONMENT } from '../../common/config/environment.constants.js';
import type { Environment } from '../../common/config/environment.js';
import { DatabaseService } from '../../common/database/database.service.js';

export interface PaystackEvent {
  event: string;
  data: Record<string, unknown>;
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @Inject(ENVIRONMENT) private readonly env: Environment,
    private readonly databaseService: DatabaseService,
  ) {}

  // ─── Webhook signature verification ─────────────────────────────────────

  verifyWebhookSignature(rawBody: Buffer, paystackSignature: string): boolean {
    if (!this.env.PAYSTACK_WEBHOOK_SECRET) {
      this.logger.warn('PAYSTACK_WEBHOOK_SECRET not set — skipping signature verification in dev mode');
      return true;
    }

    const hash = crypto
      .createHmac('sha512', this.env.PAYSTACK_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    return hash === paystackSignature;
  }

  // ─── Event dispatch ───────────────────────────────────────────────────────

  async handleEvent(event: PaystackEvent): Promise<void> {
    this.logger.log(`Paystack event received: ${event.event}`);

    switch (event.event) {
      case 'subscription.create':
        await this.handleSubscriptionCreate(event.data);
        break;
      case 'subscription.disable':
        await this.handleSubscriptionDisable(event.data);
        break;
      case 'charge.success':
        await this.handleChargeSuccess(event.data);
        break;
      case 'invoice.update':
        await this.handleInvoiceUpdate(event.data);
        break;
      default:
        this.logger.log(`Unhandled Paystack event: ${event.event}`);
    }
  }

  // ─── Event handlers ───────────────────────────────────────────────────────

  private async handleSubscriptionCreate(data: Record<string, unknown>): Promise<void> {
    const subscriptionCode = data['subscription_code'] as string | undefined;
    const customerCode = data['customer'] as { customer_code?: string } | undefined;
    const status = data['status'] as string | undefined;
    const nextPaymentDate = data['next_payment_date'] as string | undefined;

    if (!subscriptionCode) {
      this.logger.warn('subscription.create: missing subscription_code');
      return;
    }

    // Upsert subscription by paystack_subscription_code
    await this.databaseService.db
      .insertInto('billing.subscriptions')
      .values({
        account_owner_user_id: '00000000-0000-0000-0000-000000000000', // resolved below if customer identified
        paystack_customer_code: customerCode?.customer_code ?? null,
        paystack_subscription_code: subscriptionCode,
        status: this.mapPaystackStatus(status ?? ''),
        current_period_start: new Date().toISOString(),
        current_period_end: nextPaymentDate ?? null,
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .onConflict((oc) =>
        oc.column('paystack_subscription_code').doUpdateSet({
          status: this.mapPaystackStatus(status ?? ''),
          current_period_end: nextPaymentDate ?? null,
          updated_at: new Date().toISOString(),
        }),
      )
      .execute();

    this.logger.log(`Subscription created/updated: ${subscriptionCode}`);
  }

  private async handleSubscriptionDisable(data: Record<string, unknown>): Promise<void> {
    const subscriptionCode = data['subscription_code'] as string | undefined;

    if (!subscriptionCode) return;

    await this.databaseService.db
      .updateTable('billing.subscriptions')
      .set({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .where('paystack_subscription_code', '=', subscriptionCode)
      .execute();

    this.logger.log(`Subscription disabled: ${subscriptionCode}`);
  }

  private async handleChargeSuccess(data: Record<string, unknown>): Promise<void> {
    const reference = data['reference'] as string | undefined;
    const amount = data['amount'] as number | undefined;
    const currency = data['currency'] as string | undefined;
    const paidAt = data['paid_at'] as string | undefined;

    if (!reference) return;

    // Upsert into billing.payments
    await this.databaseService.db
      .insertInto('billing.payments')
      .values({
        paystack_payment_reference: reference,
        status: 'succeeded',
        amount_minor: amount ?? 0,
        currency_code: currency ?? 'NGN',
        paid_at: paidAt ?? new Date().toISOString(),
        failure_reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .onConflict((oc) =>
        oc.column('paystack_payment_reference').doUpdateSet({
          status: 'succeeded',
          paid_at: paidAt ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      )
      .execute();

    this.logger.log(`Payment succeeded: ${reference}`);
  }

  private async handleInvoiceUpdate(data: Record<string, unknown>): Promise<void> {
    const reference = data['transaction']
      ? (data['transaction'] as Record<string, unknown>)['reference'] as string
      : undefined;
    const status = data['status'] as string | undefined;

    if (!reference) return;

    await this.databaseService.db
      .updateTable('billing.invoices')
      .set({
        status: status === 'success' ? 'paid' : 'open',
        paid_at: status === 'success' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .where('paystack_reference', '=', reference)
      .execute();

    this.logger.log(`Invoice updated: ${reference}`);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private mapPaystackStatus(paystackStatus: string): 'active' | 'cancelled' | 'incomplete' | 'past_due' | 'trialing' | 'paused' {
    const map: Record<string, 'active' | 'cancelled' | 'incomplete' | 'past_due' | 'trialing' | 'paused'> = {
      active: 'active',
      cancelled: 'cancelled',
      non_renewing: 'cancelled',
      attention: 'past_due',
      complete: 'cancelled',
    };
    return map[paystackStatus] ?? 'incomplete';
  }

  // ─── Paystack customer creation ─────────────────────────────────────────

  async createPaystackCustomer(
    email: string,
    fullName: string,
    metadata?: Record<string, unknown>,
  ): Promise<{ customerCode: string } | null> {
    if (!this.env.PAYSTACK_SECRET_KEY) {
      this.logger.warn('PAYSTACK_SECRET_KEY not set — skipping customer creation');
      return null;
    }

    try {
      const response = await fetch('https://api.paystack.co/customer', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          first_name: fullName.split(' ')[0] ?? fullName,
          last_name: fullName.split(' ').slice(1).join(' ') || undefined,
          metadata: metadata ?? {},
        }),
      });

      if (!response.ok) {
        throw new Error(`Paystack customer API responded with ${response.status}`);
      }

      const result = (await response.json()) as {
        status: boolean;
        data: { customer_code: string };
      };

      if (!result.status || !result.data?.customer_code) {
        throw new Error('Paystack customer creation returned unexpected response');
      }

      this.logger.log(`Paystack customer created: ${result.data.customer_code} for ${email}`);
      return { customerCode: result.data.customer_code };
    } catch (err) {
      this.logger.error('Paystack customer creation failed', err);
      return null;
    }
  }
}
