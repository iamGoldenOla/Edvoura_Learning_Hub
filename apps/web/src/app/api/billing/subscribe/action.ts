'use server';

import { BillingService } from '@/lib/billing';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { createSubscriptionSchema, CreateSubscriptionDto } from '@edvoura/contracts';
import { redirect } from 'next/navigation';

export async function createSubscription(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const planId = formData.get('planId') as string;
  const couponCode = formData.get('couponCode') as string | null;

  const dto: CreateSubscriptionDto = { planId, couponCode: couponCode || undefined };
  const validated = createSubscriptionSchema.parse(dto);

  const service = new BillingService(supabase);
  const subscription = await service.createSubscription(validated, user.id);

  // TODO: Integrate real Paystack checkout redirect
  redirect(`/dash?subCreated=true&code=${subscription.paystack_subscription_code}`);
}

