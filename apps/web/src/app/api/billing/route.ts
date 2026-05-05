import { NextRequest, NextResponse } from 'next/server';
import { BillingService, createNotification } from '@/lib/billing';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { createBillingPlanSchema } from '@edvoura/contracts';
import { AppRole } from '@edvoura/contracts';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('roles').eq('id', user.id).single();
  if (!profile?.roles?.includes('admin' as AppRole) && !profile?.roles?.includes('super_admin' as AppRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const service = new BillingService(supabase);
  const plans = await service.listPlans();
  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('roles').eq('id', user.id).single();
  if (!profile?.roles?.includes('super_admin' as AppRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const validated = createBillingPlanSchema.parse(body);

  const service = new BillingService(supabase);
  const plan = await service.createPlan(validated);

  return NextResponse.json(plan, { status: 201 });
}

