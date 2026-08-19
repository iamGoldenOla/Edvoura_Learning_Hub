import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, questionId, questionText, options, correctAnswer, explanation } = body;

    if (!questionId || !action) {
      return NextResponse.json({ error: 'Missing action or questionId' }, { status: 400 });
    }

    if (action === 'approve') {
      await supabaseAdmin
        .from('question_bank')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', questionId);

      await supabaseAdmin
        .from('educator_review_queue')
        .update({ status: 'approved' })
        .eq('question_id', questionId);

      return NextResponse.json({ success: true, message: 'Question approved and live.' });
    }

    if (action === 'reject') {
      await supabaseAdmin
        .from('question_bank')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
        .eq('id', questionId);

      await supabaseAdmin
        .from('educator_review_queue')
        .update({ status: 'rejected' })
        .eq('question_id', questionId);

      return NextResponse.json({ success: true, message: 'Question rejected.' });
    }

    if (action === 'edit_approve') {
      await supabaseAdmin
        .from('question_bank')
        .update({
          question_text: questionText,
          options,
          correct_answer: correctAnswer,
          explanation,
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', questionId);

      await supabaseAdmin
        .from('educator_review_queue')
        .update({ status: 'edited' })
        .eq('question_id', questionId);

      return NextResponse.json({ success: true, message: 'Question edited & approved.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('[REVIEW ACTION API ERROR]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
