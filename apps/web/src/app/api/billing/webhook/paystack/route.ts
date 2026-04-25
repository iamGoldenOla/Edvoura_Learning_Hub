import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const supabase = await createClient();

    switch (event.event) {
      case 'subscription.create':
      case 'subscription.enable':
        await handleSubscriptionUpdate(supabase, event.data, 'active');
        break;
      case 'subscription.disable':
        await handleSubscriptionUpdate(supabase, event.data, 'inactive');
        break;
      case 'charge.success':
        await handleChargeSuccess(supabase, event.data);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Paystack Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleSubscriptionUpdate(supabase: any, data: any, status: string) {
  const { error } = await supabase
    .schema('billing')
    .from('subscriptions')
    .update({
      status,
      paystack_subscription_code: data.subscription_code,
      updated_at: new Date().toISOString(),
    })
    .eq('paystack_customer_code', data.customer.customer_code);

  if (error) console.error('Error updating subscription:', error);
}

async function handleChargeSuccess(supabase: any, data: any) {
  // Logic to record invoice payment
  const { error } = await supabase
    .schema('billing')
    .from('invoices')
    .update({
      status: 'paid',
      amount_paid_minor: data.amount,
      updated_at: new Date().toISOString(),
    })
    .eq('paystack_reference', data.reference);

  if (error) console.error('Error recording payment:', error);
}
