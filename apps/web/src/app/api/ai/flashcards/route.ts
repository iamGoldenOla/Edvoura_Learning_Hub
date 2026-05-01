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
    const displayTopic = topic || 'Core Ideas';
    const placeholderCards = [
      {
        front: `What is ${displayTopic}?`,
        back: `${displayTopic} is an important concept in ${requestedSubject}. Start by learning its meaning, its key features, and where it appears in real life.`,
      },
      {
        front: `Why is ${displayTopic} important in ${requestedSubject}?`,
        back: `${displayTopic} matters because it helps learners understand how the topic affects people, work, nature, or daily life within ${requestedSubject}.`,
      },
      {
        front: `Give one example or feature of ${displayTopic}.`,
        back: `A strong answer should name a real example of ${displayTopic} or describe one clear feature that shows what it is and why it matters.`,
      },
      {
        front: `How can learners identify ${displayTopic}?`,
        back: `Learners should look for the main characteristics, where it is found, and how it affects people, crops, animals, or the environment.`,
      },
      {
        front: `How does ${displayTopic} affect daily life or work?`,
        back: `Think about how ${displayTopic} changes farming, health, transport, learning, or the environment depending on the subject and topic.`,
      },
      {
        front: `What is one way to manage, solve, or respond to ${displayTopic}?`,
        back: `A good answer gives one practical action, explains how it works, and connects it to the topic clearly.`,
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
