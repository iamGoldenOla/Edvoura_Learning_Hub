import library from './practiceLibrary.json';
import { normalizeSubjectName } from '@/lib/ai/lessonNoteBlueprints';

type Difficulty = 'easy' | 'medium' | 'hard';

export type PracticeSpellingWord = {
  word: string;
  pronunciation: string;
  syllables: number;
  definition: string;
  exampleSentence: string;
  hint: string;
  difficulty: Difficulty;
};

export type PracticeSpellingChallenge = {
  id: string;
  title: string;
  instructions: string;
  theme: string;
  words: PracticeSpellingWord[];
  source: 'local_practice';
};

export type PracticeFlashcard = {
  front: string;
  back: string;
};

type PracticeFlashcardDeck = {
  subject: string;
  topic: string;
  cards: PracticeFlashcard[];
};

type GradeBandKey = 'grades_1_3' | 'grades_4_6' | 'grades_7_12';

type SpellingDeckRecord = {
  id: string;
  title: string;
  theme: string;
  instructions: string;
  words: PracticeSpellingWord[];
};

type FlashcardTopicRecord = {
  topic: string;
  cards: PracticeFlashcard[];
};

type FlashcardSubjectRecord = {
  display_name: string;
  topics: FlashcardTopicRecord[];
};

function gradeNumberFromLabel(value: string) {
  const match = value.toLowerCase().match(/grade\s*(\d{1,2})|^(\d{1,2})$/);
  return Number(match?.[1] ?? match?.[2] ?? 7);
}

export function getPracticeGradeBand(gradeLevel: string): GradeBandKey {
  const grade = gradeNumberFromLabel(gradeLevel);
  if (grade <= 3) return 'grades_1_3';
  if (grade <= 6) return 'grades_4_6';
  return 'grades_7_12';
}

function rotate<T>(items: T[], count: number) {
  if (items.length === 0) return [];
  const start = count % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
}

function stableSeed(input: string) {
  return Array.from(input).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function getSpellingDecksForGrade(gradeLevel: string) {
  const band = getPracticeGradeBand(gradeLevel);
  return (library.spellingBee[band]?.decks ?? []) as SpellingDeckRecord[];
}

function getFlashcardSubjectsForGrade(gradeLevel: string) {
  const band = getPracticeGradeBand(gradeLevel);
  return library.flashcards[band]?.subjects ?? {};
}

export function getSpellingPracticeChallenges(gradeLevel: string) {
  const decks = getSpellingDecksForGrade(gradeLevel);
  return decks.map<PracticeSpellingChallenge>((deck) => ({
    id: `practice-${deck.id}`,
    title: deck.title,
    instructions: deck.instructions,
    theme: deck.theme,
    words: rotate(deck.words, stableSeed(`${gradeLevel}:${deck.id}`) % Math.max(deck.words.length, 1)),
    source: 'local_practice',
  }));
}

export function getFlashcardSubjectSuggestions(gradeLevel: string) {
  return Object.keys(getFlashcardSubjectsForGrade(gradeLevel)).sort();
}

function findFlashcardDeck(params: {
  gradeLevel: string;
  subject?: string;
  topic?: string;
}) {
  const subjects = getFlashcardSubjectsForGrade(params.gradeLevel) as Record<string, FlashcardSubjectRecord>;
  const requestedSubject = normalizeSubjectName(params.subject?.trim() || '');
  const requestedTopic = (params.topic?.trim() || '').toLowerCase();

  if (requestedSubject && subjects[requestedSubject]) {
    const subjectDeck = subjects[requestedSubject];
    const matchedTopic =
      subjectDeck.topics.find((entry) => entry.topic.toLowerCase() === requestedTopic) ??
      subjectDeck.topics.find((entry) => entry.topic.toLowerCase().includes(requestedTopic) || requestedTopic.includes(entry.topic.toLowerCase())) ??
      subjectDeck.topics[0];

    return matchedTopic
      ? {
          subject: requestedSubject,
          topic: matchedTopic.topic,
          cards: matchedTopic.cards,
        }
      : null;
  }

  if (requestedTopic) {
    for (const [subjectName, subjectEntry] of Object.entries(subjects)) {
      const match =
        subjectEntry.topics.find((entry) => entry.topic.toLowerCase() === requestedTopic) ??
        subjectEntry.topics.find((entry) => entry.topic.toLowerCase().includes(requestedTopic) || requestedTopic.includes(entry.topic.toLowerCase()));

      if (match) {
        return {
          subject: subjectName,
          topic: match.topic,
          cards: match.cards,
        };
      }
    }
  }

  const allDecks: PracticeFlashcardDeck[] = Object.entries(subjects).flatMap(([subjectName, subjectEntry]) =>
    subjectEntry.topics.map((topicEntry) => ({
      subject: subjectName,
      topic: topicEntry.topic,
      cards: topicEntry.cards,
    })),
  );

  if (allDecks.length === 0) {
    return null;
  }

  return allDecks[stableSeed(`${params.gradeLevel}:${params.subject ?? ''}:${params.topic ?? ''}`) % allDecks.length];
}

export function buildLocalFlashcardDeck(params: {
  gradeLevel: string;
  subject?: string;
  topic?: string;
}) {
  const deck = findFlashcardDeck(params);

  if (deck) {
    return {
      flashcards: deck.cards,
      deckTitle: `${deck.subject}: ${deck.topic}`,
      subject: deck.subject,
      topic: deck.topic,
      provider: 'local_practice_library',
    };
  }

  const subject = normalizeSubjectName(params.subject?.trim() || 'General Studies');
  const topic = params.topic?.trim() || 'Core Ideas';

  const fallbackCards: PracticeFlashcard[] = [
    {
      front: `What is ${topic}?`,
      back: `${topic} is an important idea in ${subject}. Start by learning the meaning, key features, and simple examples.`,
    },
    {
      front: `Why is ${topic} important?`,
      back: `${topic} is important because it helps students connect classroom learning to real life and build stronger understanding.`,
    },
    {
      front: `Name one example of ${topic}.`,
      back: `A strong answer gives one clear example of ${topic} and explains why it fits.`,
    },
    {
      front: `How can you remember ${topic} better?`,
      back: `Use short notes, examples, and repeated practice to remember ${topic} better.`,
    },
    {
      front: `What should a learner know about ${topic}?`,
      back: `A learner should know the meaning, important facts, uses, and simple explanations of ${topic}.`,
    },
    {
      front: `How does ${topic} connect to daily life?`,
      back: `Think about where ${topic} appears at home, in school, or in the wider community.`,
    }
  ];

  return {
    flashcards: fallbackCards,
    deckTitle: `${subject}: ${topic}`,
    subject,
    topic,
    provider: 'local_practice_template',
  };
}
