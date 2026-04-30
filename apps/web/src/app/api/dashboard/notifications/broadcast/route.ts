import { NextRequest, NextResponse } from 'next/server';

import { sendDashboardBroadcast } from '@/lib/dashboard/distribution';
import { createClient } from '@/utils/supabase/server';
import type { DashboardRole } from '@/lib/dashboard/interactionMatrix';

const ALLOWED_TARGET_ROLES: DashboardRole[] = ['student', 'parent', 'tutor', 'admin', 'super_admin'];

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  const isAllowed = (roles ?? []).some((entry) => entry.role === 'super_admin' || entry.role === 'admin');
  if (!isAllowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const message = typeof body?.body === 'string' ? body.body.trim() : '';
  const targetRoles = Array.isArray(body?.targetRoles)
    ? body.targetRoles.filter((entry: unknown): entry is DashboardRole =>
        typeof entry === 'string' && ALLOWED_TARGET_ROLES.includes(entry as DashboardRole),
      )
    : [];

  if (!title || !message || targetRoles.length === 0) {
    return NextResponse.json(
      { error: 'title, body, and at least one valid targetRoles entry are required.' },
      { status: 400 },
    );
  }

  try {
    const result = await sendDashboardBroadcast({
      actorUserId: user.id,
      title,
      body: message,
      targetRoles,
      route: '/dash/admin/notifications',
      audienceKey: typeof body?.audienceKey === 'string' ? body.audienceKey : undefined,
    });

    return NextResponse.json({
      message: 'Broadcast queued successfully.',
      recipientCount: result.recipientCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to queue broadcast.' },
      { status: 500 },
    );
  }
}
