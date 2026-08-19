import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get('region') || 'ALL';
    const subject = searchParams.get('subject') || 'ALL';
    const status = searchParams.get('status') || 'pending_review';

    let query = supabaseAdmin
      .from('question_bank')
      .select('id, subject, grade_band, curriculum_region, topic, question_text, question_type, options, correct_answer, explanation, difficulty, status')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(50);

    if (region !== 'ALL') {
      query = query.eq('curriculum_region', region);
    }

    if (subject !== 'ALL') {
      query = query.ilike('subject', `%${subject}%`);
    }

    const { data: questions, error } = await query;

    if (error) {
      console.error('[REVIEW LIST ERROR]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch matching review queue rows for duplicate flags
    const questionIds = (questions || []).map((q) => q.id);
    let reviewQueueMap = new Map<string, any>();

    if (questionIds.length > 0) {
      const { data: queueRows } = await supabaseAdmin
        .from('educator_review_queue')
        .select('*')
        .in('question_id', questionIds);

      if (queueRows) {
        queueRows.forEach((r) => reviewQueueMap.set(r.question_id, r));
      }
    }

    const items = (questions || []).map((q) => {
      const queueItem = reviewQueueMap.get(q.id);
      return {
        id: queueItem?.id || q.id,
        question_id: q.id,
        is_possible_duplicate: queueItem?.is_possible_duplicate || false,
        duplicate_similarity: queueItem?.duplicate_similarity || null,
        question: q,
      };
    });

    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    console.error('[REVIEW LIST API ERROR]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
