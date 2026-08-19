import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contentId, title, itemType } = body;

    if (!contentId && !title) {
      return NextResponse.json({ error: 'Missing contentId or title parameter' }, { status: 400 });
    }

    console.log(`[DELETE CONTENT API] Target contentId: ${contentId}, title: ${title}`);

    // 1. Delete matching rows from ai_generated_content
    if (contentId) {
      const { error: errId } = await supabaseAdmin
        .from('ai_generated_content')
        .delete()
        .or(`id.eq.${contentId},id.eq.official_pub_${contentId}`);

      if (errId) {
        console.error('[DELETE CONTENT DB ERROR id]', errId);
      }
    }

    if (title) {
      const { error: errTitle } = await supabaseAdmin
        .from('ai_generated_content')
        .delete()
        .ilike('title', `%${title}%`);

      if (errTitle) {
        console.error('[DELETE CONTENT DB ERROR title]', errTitle);
      }
    }

    // 2. Delete from quizzes table if applicable
    if (contentId) {
      await supabaseAdmin.from('quizzes').delete().eq('id', contentId);
    }

    // 3. Delete from assignments table if applicable
    if (contentId) {
      await supabaseAdmin.from('assignments').delete().eq('id', contentId);
    }

    // 4. Delete from learning_activity_events table if applicable
    if (contentId) {
      await supabaseAdmin.from('learning_activity_events').delete().eq('id', contentId);
    }

    return NextResponse.json({ success: true, message: 'Content deleted permanently across all student dashboards.' });
  } catch (err) {
    console.error('[DELETE CONTENT API ERROR]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
