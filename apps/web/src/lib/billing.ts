import { createClient } from '@/utils/supabase/server';
import { createBillingPlanSchema, CreateBillingPlanDto, createSubscriptionSchema, CreateSubscriptionDto, subscriptionStatusSchema } from '@edvoura/contracts';

export async function createNotification(recipientUserId: string, kind: string, title: string, body: string, data?: Record<string, unknown>) {
  const supabase = await createClient();
  const { error } = await supabase.from('notifications').insert({
    recipient_user_id: recipientUserId,
    kind,
    title,
    body,
    data: data || null,
  });
  if (error) throw new Error(`Notification creation failed: ${error.message}`);
}

export class BillingService {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async listPlans() {
    const { data, error } = await this.supabase.from('billing.plans').select('*').eq('is_active', true).order('amount_minor');
    if (error) throw error;
    return data;
  }

  async createPlan(plan: CreateBillingPlanDto) {
    const validated = createBillingPlanSchema.parse(plan);
    const { data, error } = await this.supabase.from('billing.plans').insert(validated).select().single();
    if (error) throw error;
    return data;
  }

  async createSubscription(dto: CreateSubscriptionDto, userId: string) {
    const validated = createSubscriptionSchema.parse(dto);
    // TODO: Integrate Paystack API call (needs PAYSTACK_SECRET_KEY)
    // For now, create local row as 'trialing'
    const { data, error } = await this.supabase.from('billing.subscriptions').insert({
      ...validated,
      account_owner_user_id: userId,
      status: 'trialing' as any,
      paystack_subscription_code: `stub_${Date.now()}`,
    }).select().single();
    if (error) throw error;

    // Notify
    await createNotification(userId, 'billing_issue', 'Subscription Created', `Started ${validated.planId} trial.`);
    return data;
  }

  async getSubscriptionStatus(userId: string) {
    const { data } = await this.supabase.from('billing.subscriptions').select('status').eq('account_owner_user_id', userId).eq('status', subscriptionStatusSchema.options.join(',')).single();
    return data?.status || null;
  }
}

// Client helper
export async function getSubscriptionStatusForUser(userId: string) {
  const supabase = await createClient();
  const service = new BillingService(supabase);
  return service.getSubscriptionStatus(userId);
}
