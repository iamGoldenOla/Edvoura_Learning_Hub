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

    const { subject, topic, gradeLevel, surprise } = await request.json();

    if (!gradeLevel) {
      return NextResponse.json({ error: 'Missing gradeLevel' }, { status: 400 });
    }

    // Surprise mode or missing inputs → return a random local deck
    if (surprise || (!subject && !topic)) {
      const localDeck = buildLocalFlashcardDeck({ gradeLevel, subject, topic });
      return NextResponse.json({
        flashcards: localDeck.flashcards,
        provider: localDeck.provider,
        subject: localDeck.subject,
        topic: localDeck.topic,
        deckTitle: localDeck.deckTitle,
        attempts: 1,
      });
    }

    // Try AI generation first (the primary, intelligent path)
    const result = await generateFlashcards({ subject, topic, gradeLevel });

    if (result.success) {
      return NextResponse.json({
        flashcards: result.data,
        attempts: result.attempts,
        provider: result.provider,
        subject,
        topic,
        deckTitle: `${subject}: ${topic}`,
      });
    }

    // AI failed → check if we have a LOCAL deck that actually matches the requested topic
    const localDeck = buildLocalFlashcardDeck({ gradeLevel, subject, topic });
    const requestedTopic = (topic || '').trim().toLowerCase();
    const localTopicLower = localDeck.topic.toLowerCase();
    const localTopicMatches =
      requestedTopic &&
      (localTopicLower.includes(requestedTopic) || requestedTopic.includes(localTopicLower));

    if (localTopicMatches) {
      return NextResponse.json({
        flashcards: localDeck.flashcards,
        provider: localDeck.provider,
        subject: localDeck.subject,
        topic: localDeck.topic,
        deckTitle: localDeck.deckTitle,
        fallbackReason: result.error,
        attempts: result.attempts,
      });
    }

    // AI failed AND no matching local deck → generate smart placeholder cards
    // about the exact topic the student asked for
    const requestedSubject = subject || 'General Studies';
    const displayTopic = topic || 'Core Ideas';
    const placeholderCards = [
      { front: `What is ${displayTopic}?`, back: `${displayTopic} is an important concept in ${requestedSubject}. It involves understanding key ideas, properties, and real-life applications that students explore through observation and practice.` },
      { front: `Why is ${displayTopic} important in ${requestedSubject}?`, back: `${displayTopic} is important because it helps us understand how the world works and connects classroom learning to everyday experiences.` },
      { front: `Name one key feature or property of ${displayTopic}.`, back: `A strong answer identifies one specific characteristic of ${displayTopic} and explains why it matters with a clear example.` },
      { front: `Give a real-life example of ${displayTopic}.`, back: `Think about where you encounter ${displayTopic} at home, at school, or in nature. Describe what happens and why.` },
      { front: `How would you explain ${displayTopic} to a younger student?`, back: `Use simple words, give one clear example, and relate it to something they already know from daily life.` },
      { front: `What happens if ${displayTopic} is absent or removed?`, back: `Consider what changes in the system or environment. This helps you understand why ${displayTopic} is essential.` },
      { front: `How can you test or observe ${displayTopic}?`, back: `Design a simple experiment or observation activity. Describe what you would see, hear, or measure.` },
      { front: `Compare ${displayTopic} with a related concept.`, back: `Find similarities and differences with a closely related idea. Use a table or list to organize your comparison.` },
    ];

    return NextResponse.json({
      flashcards: placeholderCards,
      provider: 'local_smart_fallback',
      subject: requestedSubject,
      topic: displayTopic,
      deckTitle: `${requestedSubject}: ${displayTopic}`,
      fallbackReason: result.error,
      attempts: result.attempts,
    });
  } catch (error: unknown) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Flashcard generation failed' },
      { status: 500 },
    );
  }
}
