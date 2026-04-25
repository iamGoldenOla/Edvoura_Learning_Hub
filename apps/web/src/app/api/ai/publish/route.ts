import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body?.contentId) {
    return NextResponse.json({ error: 'Missing contentId' }, { status: 400 });
  }

  // Update status to published
  const { data, error } = await supabase
    .from('ai_generated_content')
    .update({ status: 'published' })
    .eq('id', body.contentId)
    .eq('generated_by_user_id', user.id) // Ensure only the generator can publish
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Content published to students successfully', data });
}
