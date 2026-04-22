import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { supabaseAdmin } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  if (!process.env.RESEND_WEBHOOK_SECRET) {
    console.warn('RESEND_WEBHOOK_SECRET not set, ignoring webhook');
    return NextResponse.json({ status: 'ignored' });
  }

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 });
  }

  const payload = await request.text();

  let event: any;
  try {
    const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET);
    event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`Received Resend webhook event: ${event.type}`);

  try {
    const emailId = event.data?.email_id;
    if (!emailId) {
      return NextResponse.json({ status: 'skipped_no_email_id' });
    }

    if (event.type === 'email.delivered') {
      await supabaseAdmin
        .from('notification_deliveries')
        .update({
          delivery_status: 'delivered',
          delivered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('external_delivery_id', emailId)
        .eq('channel', 'email');
    } else if (event.type === 'email.bounced' || event.type === 'email.complained') {
      const errorReason = event.data?.reason || event.type;
      await supabaseAdmin
        .from('notification_deliveries')
        .update({
          delivery_status: 'failed',
          error_message: errorReason,
          updated_at: new Date().toISOString(),
        })
        .eq('external_delivery_id', emailId)
        .eq('channel', 'email');
    }
  } catch (err) {
    console.error('Failed to process webhook event', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ status: 'ok' });
}
