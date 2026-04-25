import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subjectName, topic, score, totalQuestions } = body;

    if (!subjectName || !topic || score === undefined || !totalQuestions) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabase.from('student_ai_practice_scores').insert({
      student_id: session.user.id,
      subject_name: subjectName,
      topic,
      score,
      total_questions: totalQuestions,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving practice score:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
