import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionId, flaggedBy, flagReason = 'unclear', notes = '' } = body;

    if (!questionId) {
      return NextResponse.json({ error: 'Missing required parameter: questionId' }, { status: 400 });
    }

    // 1. Insert into question_flags
    const { data: flagRecord, error: flagErr } = await supabaseAdmin
      .from('question_flags')
      .insert({
        question_id: questionId,
        flagged_by: flaggedBy || null,
        flag_reason: flagReason,
        notes: notes,
        status: 'open',
      })
      .select('*')
      .single();

    if (flagErr) {
      console.error('[QUESTION FLAG INSERT ERROR]', flagErr);
      return NextResponse.json({ error: flagErr.message }, { status: 500 });
    }

    // 2. Count total open flags for this question
    const { count: openFlagCount, error: countErr } = await supabaseAdmin
      .from('question_flags')
      .select('*', { count: 'exact', head: true })
      .eq('question_id', questionId)
      .eq('status', 'open');

    let autoPulled = false;
    const threshold = 3;

    // 3. Threshold Auto-Pull Logic (Threshold >= 3 flags)
    if (openFlagCount && openFlagCount >= threshold) {
      autoPulled = true;

      // Update question_bank status to pending_review (pulls from student rotation)
      await supabaseAdmin
        .from('question_bank')
        .update({
          status: 'pending_review',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', questionId);

      // Route into educator_review_queue for priority moderation
      const { data: existingQueue } = await supabaseAdmin
        .from('educator_review_queue')
        .select('id')
        .eq('question_id', questionId)
        .maybeSingle();

      if (existingQueue) {
        await supabaseAdmin
          .from('educator_review_queue')
          .update({
            status: 'pending',
            notes: `[AUTO-PULLED]: Question received ${openFlagCount} student flags (Reason: ${flagReason}).`,
          })
          .eq('id', existingQueue.id);
      } else {
        await supabaseAdmin.from('educator_review_queue').insert({
          question_id: questionId,
          status: 'pending',
          is_possible_duplicate: false,
          notes: `[AUTO-PULLED]: Question received ${openFlagCount} student flags (Reason: ${flagReason}).`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Question flagged successfully.',
      flagRecord,
      openFlagCount: openFlagCount || 1,
      autoPulled,
      threshold,
    });
  } catch (err: any) {
    console.error('[QUESTION FLAG API ERROR]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
