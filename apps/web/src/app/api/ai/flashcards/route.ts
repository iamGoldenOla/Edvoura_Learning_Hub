import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { generateFlashcards } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject, topic, gradeLevel } = await request.json();

    if (!subject || !topic || !gradeLevel) {
      return NextResponse.json({ error: 'Missing subject, topic or gradeLevel' }, { status: 400 });
    }

    const result = await generateFlashcards({ subject, topic, gradeLevel });

    if (!result.success) {
      const status =
        result.error.includes('No valid AI provider keys found') ||
        result.error.includes('No valid OpenRouter keys configured') ||
        result.error.includes('GEMINI_API_KEY is not configured')
          ? 503
          : 422;

      return NextResponse.json(
        {
          error: 'Flashcard generation failed',
          detail: result.error,
          attempts: result.attempts,
        },
        { status },
      );
    }

    return NextResponse.json({ flashcards: result.data, attempts: result.attempts, provider: result.provider });
  } catch (error: unknown) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Flashcard generation failed' },
      { status: 500 },
    );
  }
}
