import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { publishAiContentAndDistribute } from '@/lib/dashboard/distribution';

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

  const isSuperAdmin = (roles ?? []).some((entry) => entry.role === 'super_admin');
  if (!isSuperAdmin) {
    return NextResponse.json(
      { error: 'Only super admins can publish AI content to students.' },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body?.contentId) {
    return NextResponse.json({ error: 'Missing contentId' }, { status: 400 });
  }

  try {
    const result = await publishAiContentAndDistribute(String(body.contentId), {
      actorUserId: user.id,
      allowedStatuses: ['APPROVED'],
    });

    return NextResponse.json({
      message: 'Content pushed to learners and parents successfully',
      data: result.record,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to publish content.' },
      { status: 500 },
    );
  }
}
