import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gradeBand = searchParams.get('gradeBand') || '1-3';

  try {
    // We join biography_questions with notable_figures
    const { data, error } = await supabaseAdmin
      .from('biography_questions')
      .select(`
        id,
        grade_band,
        question_text,
        question_type,
        options,
        correct_answer,
        explanation,
        status,
        notable_figures!inner (
          id,
          name,
          birth_year,
          death_year,
          nationality,
          field,
          notable_achievement,
          image_url
        )
      `)
      .eq('status', 'approved')
      .eq('grade_band', gradeBand);

    if (error) {
      console.error('Error fetching do-you-know questions:', error);
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ questions: [] });
    }

    // Shuffle and pick 10
    const shuffled = data.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);

    return NextResponse.json({ questions: selected });
  } catch (err: any) {
    console.error('Unexpected error fetching do-you-know questions:', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
