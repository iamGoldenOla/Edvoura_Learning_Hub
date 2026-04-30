import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { generateFlashcards } from '@/lib/ai';
import { buildLocalFlashcardDeck } from '@/lib/student-practice/practiceLibrary';

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

    if (!gradeLevel) {
      return NextResponse.json({ error: 'Missing gradeLevel' }, { status: 400 });
    }

    const localDeck = buildLocalFlashcardDeck({ gradeLevel, subject, topic });

    if (!subject || !topic) {
      return NextResponse.json({
        flashcards: localDeck.flashcards,
        provider: localDeck.provider,
        subject: localDeck.subject,
        topic: localDeck.topic,
        deckTitle: localDeck.deckTitle,
        attempts: 1,
      });
    }

    const result = await generateFlashcards({ subject, topic, gradeLevel });

    if (!result.success) {
      return NextResponse.json(
        {
          flashcards: localDeck.flashcards,
          provider: localDeck.provider,
          subject: localDeck.subject,
          topic: localDeck.topic,
          deckTitle: localDeck.deckTitle,
          fallbackReason: result.error,
          attempts: result.attempts,
        },
      );
    }

    return NextResponse.json({
      flashcards: result.data,
      attempts: result.attempts,
      provider: result.provider,
      subject,
      topic,
      deckTitle: `${subject}: ${topic}`,
    });
  } catch (error: unknown) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Flashcard generation failed' },
      { status: 500 },
    );
  }
}
