import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { generateFlashcards } from '@/lib/ai';
import { buildLocalFlashcardDeck, findExactLocalFlashcardDeck } from '@/lib/student-practice/practiceLibrary';

function normalizeForMatch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

function isRelevantFlashcardDeck(cards: Array<{ front: string; back: string }>, subject: string, topic: string) {
  const searchable = normalizeForMatch(cards.flatMap((card) => [card.front, card.back]).join(' '));
  const topicTokens = normalizeForMatch(topic)
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !['about', 'with', 'into', 'from'].includes(token));
  const subjectTokens = normalizeForMatch(subject)
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !['science', 'studies', 'language'].includes(token));

  const topicMatched = topicTokens.length === 0 || topicTokens.some((token) => searchable.includes(token));
  const subjectMatched = subjectTokens.length === 0 || subjectTokens.some((token) => searchable.includes(token));

  return topicMatched && subjectMatched;
}

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

    if (surprise || (!subject && !topic)) {
      const localDeck = buildLocalFlashcardDeck({ gradeLevel, subject, topic, surprise: Boolean(surprise) });
      return NextResponse.json({
        flashcards: localDeck.flashcards,
        provider: localDeck.provider,
        subject: localDeck.subject,
        topic: localDeck.topic,
        deckTitle: localDeck.deckTitle,
        attempts: 1,
      });
    }

    const exactLocalDeck = findExactLocalFlashcardDeck({ gradeLevel, subject, topic });
    if (exactLocalDeck) {
      return NextResponse.json({
        flashcards: exactLocalDeck.cards,
        provider: 'local_practice_library',
        subject: exactLocalDeck.subject,
        topic: exactLocalDeck.topic,
        deckTitle: `${exactLocalDeck.subject}: ${exactLocalDeck.topic}`,
        attempts: 1,
      });
    }

    const result = await generateFlashcards({ subject, topic, gradeLevel });

    if (result.success && isRelevantFlashcardDeck(result.data, String(subject ?? ''), String(topic ?? ''))) {
      return NextResponse.json({
        flashcards: result.data,
        attempts: result.attempts,
        provider: result.provider,
        subject,
        topic,
        deckTitle: `${subject}: ${topic}`,
      });
    }

    const localDeck = buildLocalFlashcardDeck({ gradeLevel, subject, topic });
    const requestedTopic = (topic || '').trim().toLowerCase();
    const localTopicLower = localDeck.topic.toLowerCase();
    const localTopicMatches =
      requestedTopic &&
      (localTopicLower.includes(requestedTopic) || requestedTopic.includes(localTopicLower));
    const fallbackReason = result.success ? 'AI returned cards that did not match the requested topic.' : result.error;

    if (localTopicMatches) {
      return NextResponse.json({
        flashcards: localDeck.flashcards,
        provider: localDeck.provider,
        subject: localDeck.subject,
        topic: localDeck.topic,
        deckTitle: localDeck.deckTitle,
        fallbackReason,
        attempts: result.attempts,
      });
    }

    const requestedSubject = subject || 'General Studies';
    const displayTopic = topic || 'Core Principles';
    const placeholderCards = [
      {
        front: `What is the definition and practical application of ${displayTopic}?`,
        back: `📖 Definition: ${displayTopic} in ${requestedSubject} describes the fundamental rules, properties, and procedures governing how concepts operate.\n\n✏️ Worked Example: In practice, applying ${displayTopic} involves identifying the input parameters, substituting into the core formula/rule, and calculating step 1 through step 3.\n\n💡 Memory Tip: Remember the sequence: Define -> Identify Given Values -> Solve!`,
      },
      {
        front: `How is ${displayTopic} applied in real-life problem solving?`,
        back: `📖 Definition: It provides structured solutions for real-world scenarios in health, technology, society, or nature.\n\n✏️ Worked Example: E.g. when measuring or calculating values in ${requestedSubject}, ${displayTopic} helps verify accuracy and eliminate errors.\n\n💡 Memory Tip: Always double-check your steps against standard guidelines.`,
      },
      {
        front: `What is the key formula / rule for ${displayTopic}?`,
        back: `📖 Definition: The governing equation or grammatical rule for ${displayTopic}.\n\n✏️ Worked Example: E.g., apply standard order of operations or grammatical subject-verb agreement to arrive at the solution.\n\n💡 Memory Tip: Master the core formula first before solving complex exam questions.`,
      },
      {
        front: `Step-by-Step Breakdown for ${displayTopic}`,
        back: `📖 Definition: A multi-step method to solve problems on ${displayTopic}.\n\n✏️ Worked Example: Step 1: Read the problem carefully. Step 2: Extract key data. Step 3: Compute final result with units.\n\n💡 Memory Tip: Practice 3 sample problems every day for exam confidence!`,
      },
    ];

    return NextResponse.json({
      flashcards: placeholderCards,
      provider: 'local_smart_fallback',
      subject: requestedSubject,
      topic: displayTopic,
      deckTitle: `${requestedSubject}: ${displayTopic}`,
      fallbackReason,
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
