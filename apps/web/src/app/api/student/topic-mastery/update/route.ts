import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, subject, topic, isCorrect } = body;

    if (!studentId || !subject || !topic) {
      return NextResponse.json({ error: 'Missing required parameters: studentId, subject, topic' }, { status: 400 });
    }

    // 1. Fetch existing topic mastery record for student
    const { data: existing } = await supabaseAdmin
      .from('topic_mastery')
      .select('*')
      .eq('student_id', studentId)
      .eq('subject', subject)
      .eq('topic', topic)
      .maybeSingle();

    const currentAttempt = (existing?.attempt_count || 0) + 1;
    const currentCorrect = (existing?.correct_count || 0) + (isCorrect ? 1 : 0);
    const computedScore = parseFloat(((currentCorrect / currentAttempt) * 100).toFixed(2));

    // 2. Upsert into topic_mastery
    const { data: updated, error: upsertErr } = await supabaseAdmin
      .from('topic_mastery')
      .upsert(
        {
          student_id: studentId,
          subject,
          topic,
          correct_count: currentCorrect,
          attempt_count: currentAttempt,
          mastery_score: computedScore,
          last_attempted_at: new Date().toISOString(),
        },
        { onConflict: 'student_id,subject,topic' }
      )
      .select('*')
      .single();

    if (upsertErr) {
      console.error('[TOPIC MASTERY UPSERT ERROR]', upsertErr);
      return NextResponse.json({ error: upsertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Topic mastery updated successfully.',
      mastery: updated,
    });
  } catch (err: any) {
    console.error('[TOPIC MASTERY UPDATE API ERROR]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
