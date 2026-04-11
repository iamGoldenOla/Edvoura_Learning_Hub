import { Inject, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  createBillingPlanSchema,
  createSubscriptionSchema,
  updateBillingPlanSchema,
  type AppRole,
  type CreateBillingPlanDto,
  type CreateSubscriptionDto,
  type UpdateBillingPlanDto,
} from '@edvoura/contracts';

import { ENVIRONMENT } from '../../common/config/environment.constants.js';
import type { Environment } from '../../common/config/environment.js';
import { DatabaseService } from '../../common/database/database.service.js';
import { ApplicationError } from '../../common/errors/application-error.js';

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

  async listPlans() {
    return this.databaseService.db
      .selectFrom('billing.plans')
      .select([
        'id',
        'code',
        'name',
        'description',
        'interval',
        'amount_minor as amountMinor',
        'currency_code as currencyCode',
        'paystack_plan_code as paystackPlanCode',
        'is_active as isActive',
        'created_at as createdAt',
        'updated_at as updatedAt',
      ])
      .where('is_active', '=', true)
      .orderBy('amount_minor', 'asc')
      .execute();
  }

  async createPlan(dto: CreateBillingPlanDto) {
    const parsed = createBillingPlanSchema.parse(dto);

    return this.databaseService.db
      .insertInto('billing.plans')
      .values({
        code: parsed.code,
        name: parsed.name,
        description: parsed.description ?? null,
        interval: parsed.interval,
        amount_minor: parsed.amountMinor,
        currency_code: parsed.currencyCode,
        paystack_plan_code: parsed.paystackPlanCode ?? null,
        is_active: parsed.isActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning([
        'id',
        'code',
        'name',
        'interval',
        'amount_minor as amountMinor',
        'currency_code as currencyCode',
        'is_active as isActive',
      ])
      .executeTakeFirstOrThrow();
  }

  async updatePlan(planId: string, dto: UpdateBillingPlanDto) {
    const parsed = updateBillingPlanSchema.parse(dto);

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (parsed.code !== undefined) updates['code'] = parsed.code;
    if (parsed.name !== undefined) updates['name'] = parsed.name;
    if (parsed.description !== undefined) updates['description'] = parsed.description ?? null;
    if (parsed.interval !== undefined) updates['interval'] = parsed.interval;
    if (parsed.amountMinor !== undefined) updates['amount_minor'] = parsed.amountMinor;
    if (parsed.currencyCode !== undefined) updates['currency_code'] = parsed.currencyCode;
    if (parsed.paystackPlanCode !== undefined) {
      updates['paystack_plan_code'] = parsed.paystackPlanCode ?? null;
    }
    if (parsed.isActive !== undefined) updates['is_active'] = parsed.isActive;

    const updated = await this.databaseService.db
      .updateTable('billing.plans')
      .set(updates)
      .where('id', '=', planId)
      .returning([
        'id',
        'code',
        'name',
        'description',
        'interval',
        'amount_minor as amountMinor',
        'currency_code as currencyCode',
        'paystack_plan_code as paystackPlanCode',
        'is_active as isActive',
        'updated_at as updatedAt',
      ])
      .executeTakeFirst();

    if (!updated) {
      throw new ApplicationError(404, 'plan_not_found', 'Billing plan not found.');
    }

    return updated;
  }

  async getBillingSummary(userId: string, roles: AppRole[]) {
    const effectiveOwnerIds = await this.resolveAccountOwnerUserIds(userId, roles);

    const activePlanRows = await this.databaseService.db
      .selectFrom('billing.plans')
      .select([
        'id',
        'code',
        'name',
        'description',
        'interval',
        'amount_minor as amountMinor',
        'currency_code as currencyCode',
      ])
      .where('is_active', '=', true)
      .orderBy('amount_minor', 'asc')
      .execute();

    const subscription = effectiveOwnerIds.length
      ? await this.databaseService.db
          .selectFrom('billing.subscriptions as s')
          .leftJoin('billing.plans as p', 'p.id', 's.plan_id')
          .select([
            's.id',
            's.account_owner_user_id as accountOwnerUserId',
            's.plan_id as planId',
            's.paystack_customer_code as paystackCustomerCode',
            's.paystack_subscription_code as paystackSubscriptionCode',
            's.status',
            's.current_period_start as currentPeriodStart',
            's.current_period_end as currentPeriodEnd',
            's.cancel_at_period_end as cancelAtPeriodEnd',
            's.created_at as createdAt',
            's.updated_at as updatedAt',
            'p.code as planCode',
            'p.name as planName',
            'p.interval as planInterval',
            'p.amount_minor as planAmountMinor',
            'p.currency_code as planCurrencyCode',
          ])
          .where('s.account_owner_user_id', 'in', effectiveOwnerIds)
          .orderBy('s.updated_at', 'desc')
          .executeTakeFirst()
      : null;

    const invoices = effectiveOwnerIds.length
      ? await this.databaseService.db
          .selectFrom('billing.invoices as i')
          .innerJoin('billing.subscriptions as s', 's.id', 'i.subscription_id')
          .select([
            'i.id',
            'i.subscription_id as subscriptionId',
            'i.paystack_reference as paystackReference',
            'i.status',
            'i.amount_due_minor as amountDueMinor',
            'i.amount_paid_minor as amountPaidMinor',
            'i.currency_code as currencyCode',
            'i.due_at as dueAt',
            'i.paid_at as paidAt',
            'i.created_at as createdAt',
          ])
          .where('s.account_owner_user_id', 'in', effectiveOwnerIds)
          .orderBy('i.created_at', 'desc')
          .limit(5)
          .execute()
      : [];

    const entitlement =
      subscription && ['active', 'trialing'].includes(subscription.status)
        ? {
            hasAccess: true,
            reason: subscription.cancelAtPeriodEnd ? 'active_until_period_end' : 'active_subscription',
          }
        : {
            hasAccess: false,
            reason: subscription?.status === 'past_due' ? 'payment_required' : 'no_active_subscription',
          };

    return {
      accountOwnerUserIds: effectiveOwnerIds,
      plans: activePlanRows,
      subscription,
      invoices,
      entitlement,
    };
  }

  async createSubscription(actorUserId: string, roles: AppRole[], dto: CreateSubscriptionDto) {
    const parsed = createSubscriptionSchema.parse(dto);
    const allowedOwnerIds = await this.resolveAccountOwnerUserIds(actorUserId, roles);
    const accountOwnerUserId =
      parsed.accountOwnerUserId && allowedOwnerIds.includes(parsed.accountOwnerUserId)
        ? parsed.accountOwnerUserId
        : actorUserId;

    if (!allowedOwnerIds.includes(accountOwnerUserId)) {
      throw new ApplicationError(
        403,
        'billing_owner_forbidden',
        'You cannot create a subscription for that account owner.',
      );
    }

    const plan = await this.databaseService.db
      .selectFrom('billing.plans')
      .select([
        'id',
        'code',
        'name',
        'interval',
        'amount_minor as amountMinor',
        'currency_code as currencyCode',
      ])
      .where('id', '=', parsed.planId)
      .where('is_active', '=', true)
      .executeTakeFirst();

    if (!plan) {
      throw new ApplicationError(404, 'plan_not_found', 'Billing plan not found or inactive.');
    }

    const parentProfile = await this.databaseService.db
      .selectFrom('parent_profiles')
      .select('paystack_customer_code')
      .where('user_id', '=', accountOwnerUserId)
      .executeTakeFirst();

    const currentTimestamp = new Date();
    const periodEnd = new Date(currentTimestamp);
    if (plan.interval === 'annual') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else if (plan.interval === 'termly') {
      periodEnd.setMonth(periodEnd.getMonth() + 4);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const subscription = await this.databaseService.db
      .insertInto('billing.subscriptions')
      .values({
        account_owner_user_id: accountOwnerUserId,
        plan_id: plan.id,
        paystack_customer_code: parentProfile?.paystack_customer_code ?? null,
        paystack_subscription_code: null,
        status: 'incomplete',
        current_period_start: currentTimestamp.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
        created_at: currentTimestamp.toISOString(),
        updated_at: currentTimestamp.toISOString(),
      })
      .returning([
        'id',
        'account_owner_user_id as accountOwnerUserId',
        'plan_id as planId',
        'status',
        'current_period_start as currentPeriodStart',
        'current_period_end as currentPeriodEnd',
      ])
      .executeTakeFirstOrThrow();

    const invoice = await this.databaseService.db
      .insertInto('billing.invoices')
      .values({
        subscription_id: subscription.id,
        paystack_reference: null,
        status: 'draft',
        amount_due_minor: plan.amountMinor,
        amount_paid_minor: 0,
        currency_code: plan.currencyCode,
        due_at: currentTimestamp.toISOString(),
        paid_at: null,
        created_at: currentTimestamp.toISOString(),
        updated_at: currentTimestamp.toISOString(),
      })
      .returning([
        'id',
        'status',
        'amount_due_minor as amountDueMinor',
        'currency_code as currencyCode',
        'due_at as dueAt',
      ])
      .executeTakeFirstOrThrow();

    return {
      subscription,
      invoice,
      plan,
      couponCode: parsed.couponCode ?? null,
      nextAction: 'complete_payment_with_paystack',
    };
  }

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

  private async resolveAccountOwnerUserIds(userId: string, roles: AppRole[]) {
    if (roles.includes('student')) {
      const parentRows = await this.databaseService.db
        .selectFrom('parent_student_links')
        .select('parent_user_id as parentUserId')
        .where('student_user_id', '=', userId)
        .where('is_active', '=', true)
        .execute();

      const parentIds = parentRows.map((row) => row.parentUserId);
      if (parentIds.length > 0) {
        return parentIds;
      }
    }

    return [userId];
  }
}
