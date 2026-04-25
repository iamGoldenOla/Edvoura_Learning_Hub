import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await request.json();

    // 1. Fetch Plan details from DB
    const { data: plan, error: planError } = await supabase
      .schema('billing')
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // 2. Initialize Paystack Transaction
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session.user.email,
        amount: plan.amount_minor,
        plan: plan.paystack_plan_code,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dash/parent/billing/success`,
        metadata: {
          userId: session.user.id,
          planId: plan.id,
        },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      throw new Error(paystackData.message);
    }

    // 3. Create a pending invoice/subscription in our DB
    // (Optional: Wait for webhook for final confirmation)

    return NextResponse.json({ authorization_url: paystackData.data.authorization_url });
  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
