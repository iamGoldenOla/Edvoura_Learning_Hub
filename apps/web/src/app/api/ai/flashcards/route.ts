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
        front: `What is the core definition of ${displayTopic}?`,
        back: `${displayTopic} in ${requestedSubject} refers to the systematic process and principles governing how concepts, structures, or natural/social phenomena operate. Key focus areas include primary functions, standard rules, and real-world applications.`,
      },
      {
        front: `What are the main components and key features of ${displayTopic}?`,
        back: `1. Key Definition & Scope: Defines the boundary of the topic.\n2. Fundamental Rules / Formulas: Core equations or legal/logical frameworks.\n3. Real-World Applications: Practical uses in daily life, industry, or governance in Nigeria and globally.`,
      },
      {
        front: `Why is ${displayTopic} important for WAEC / BECE / Exam Success in ${requestedSubject}?`,
        back: `Understanding ${displayTopic} enables students to solve multi-step problems, explain cause-and-effect relationships, and accurately answer theory and objective questions in ${requestedSubject}.`,
      },
      {
        front: `What is a step-by-step example or practical application of ${displayTopic}?`,
        back: `Step 1: Identify the given values or core terms.\nStep 2: Apply the relevant formula, rule, or grammatical principle.\nStep 3: Verify the answer against standard subject guidelines.`,
      },
      {
        front: `What are common mistakes to avoid when studying ${displayTopic}?`,
        back: `Avoid confusing basic terminology, omitting units/steps in calculations, or failing to connect theoretical principles to real-life practical examples.`,
      },
      {
        front: `Summary & Key Memory Hook for ${displayTopic}`,
        back: `Memory Tip: Associate ${displayTopic} with its primary function. Focus on definitions, core steps, and 3 key examples during revision sessions.`,
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
