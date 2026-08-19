import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') || 'james_jedidiahz';

    const { data: records, error } = await supabaseAdmin
      .from('topic_mastery')
      .select('*')
      .eq('student_id', studentId)
      .order('mastery_score', { ascending: true });

    if (error) {
      console.error('[TOPIC MASTERY LIST ERROR]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const weakTopics = (records || []).filter((r) => r.mastery_score < 70.0);

    return NextResponse.json({
      success: true,
      studentId,
      totalTopics: records ? records.length : 0,
      weakTopicsCount: weakTopics.length,
      topics: records || [],
      weakTopics,
    });
  } catch (err: any) {
    console.error('[TOPIC MASTERY LIST API ERROR]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
