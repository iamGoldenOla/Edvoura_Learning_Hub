import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature');

  if (!process.env.PAYSTACK_WEBHOOK_SECRET) {
    console.warn('PAYSTACK_WEBHOOK_SECRET not set — skipping signature verification in dev mode');
  } else {
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      console.warn('Paystack webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  console.log(`Paystack event received: ${event.event}`);

  try {
    switch (event.event) {
      case 'subscription.create':
        await handleSubscriptionCreate(event.data);
        break;
      case 'subscription.disable':
        await handleSubscriptionDisable(event.data);
        break;
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;
      case 'invoice.update':
        await handleInvoiceUpdate(event.data);
        break;
      default:
        console.log(`Unhandled Paystack event: ${event.event}`);
    }
  } catch (error) {
    console.error('Error handling Paystack event', error);
  }

  return NextResponse.json({ received: true });
}

function mapPaystackStatus(paystackStatus: string): string {
  const map: Record<string, string> = {
    active: 'active',
    cancelled: 'cancelled',
    non_renewing: 'cancelled',
    attention: 'past_due',
    complete: 'cancelled',
  };
  return map[paystackStatus] ?? 'incomplete';
}

async function handleSubscriptionCreate(data: any) {
  const subscriptionCode = data.subscription_code;
  const customerCode = typeof data.customer === 'string' ? data.customer : (data.customer?.customer_code ?? null);
  const status = data.status;
  const nextPaymentDate = data.next_payment_date;

  if (!subscriptionCode) {
    console.warn('subscription.create: missing subscription_code');
    return;
  }

  const now = new Date().toISOString();

  let ownerUserId: string | null = null;
  if (customerCode) {
    const { data: profile } = await supabaseAdmin
      .from('parent_profiles')
      .select('user_id')
      .eq('paystack_customer_code', customerCode)
      .single();
    if (profile) {
      ownerUserId = profile.user_id;
    }
  }

  // Try to find existing by subscription code
  let { data: existing } = await supabaseAdmin.schema('billing').from('subscriptions')
    .select('id')
    .eq('paystack_subscription_code', subscriptionCode)
    .maybeSingle();

  // Or by customer code if not found
  if (!existing && customerCode) {
    const { data: existingByCustomer } = await supabaseAdmin.schema('billing').from('subscriptions')
      .select('id')
      .eq('paystack_customer_code', customerCode)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    existing = existingByCustomer;
  }

  if (existing) {
    await supabaseAdmin.schema('billing').from('subscriptions')
      .update({
        paystack_customer_code: customerCode,
        paystack_subscription_code: subscriptionCode,
        status: mapPaystackStatus(status ?? ''),
        current_period_end: nextPaymentDate ?? null,
        updated_at: now,
      })
      .eq('id', existing.id);
  } else {
    if (!ownerUserId) {
      console.warn(`subscription.create: could not resolve account owner for customer ${customerCode}`);
      return;
    }

    await supabaseAdmin.schema('billing').from('subscriptions').insert({
      account_owner_user_id: ownerUserId,
      plan_id: null,
      paystack_customer_code: customerCode,
      paystack_subscription_code: subscriptionCode,
      status: mapPaystackStatus(status ?? ''),
      current_period_start: now,
      current_period_end: nextPaymentDate ?? null,
      cancel_at_period_end: false,
      created_at: now,
      updated_at: now,
    });
  }

  console.log(`Subscription created/updated: ${subscriptionCode}`);
}

async function handleSubscriptionDisable(data: any) {
  const subscriptionCode = data.subscription_code;
  if (!subscriptionCode) return;

  await supabaseAdmin.schema('billing').from('subscriptions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('paystack_subscription_code', subscriptionCode);

  console.log(`Subscription disabled: ${subscriptionCode}`);
}

async function handleChargeSuccess(data: any) {
  const reference = data.reference;
  if (!reference) return;

  const now = new Date().toISOString();

  // Upsert using raw SQL since Supabase JS doesn't support ON CONFLICT well with custom constraints without knowing the PK,
  // but let's just use select and then insert/update.
  const { data: existing } = await supabaseAdmin.schema('billing').from('payments')
    .select('id')
    .eq('paystack_payment_reference', reference)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin.schema('billing').from('payments')
      .update({
        status: 'succeeded',
        paid_at: data.paid_at ?? now,
        updated_at: now,
      })
      .eq('id', existing.id);
  } else {
    await supabaseAdmin.schema('billing').from('payments').insert({
      paystack_payment_reference: reference,
      status: 'succeeded',
      amount_minor: data.amount ?? 0,
      currency_code: data.currency ?? 'NGN',
      paid_at: data.paid_at ?? now,
      failure_reason: null,
      created_at: now,
      updated_at: now,
    });
  }

  console.log(`Payment succeeded: ${reference}`);
}

async function handleInvoiceUpdate(data: any) {
  const reference = data.transaction?.reference;
  const status = data.status;

  if (!reference) return;

  await supabaseAdmin.schema('billing').from('invoices')
    .update({
      status: status === 'success' ? 'paid' : 'open',
      paid_at: status === 'success' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('paystack_reference', reference);

  console.log(`Invoice updated: ${reference}`);
}
