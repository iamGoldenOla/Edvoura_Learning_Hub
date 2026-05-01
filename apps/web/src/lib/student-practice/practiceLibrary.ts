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

export type PracticeFlashcardTopicSuggestion = {
  subject: string;
  topic: string;
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

const GRADE_SURPRISE_SUBJECT_ORDER: Record<GradeBandKey, string[]> = {
  grades_1_3: ['English Language', 'Mathematics', 'Basic Science', 'Social Studies'],
  grades_4_6: ['Mathematics', 'English Language', 'Basic Science', 'Social Studies'],
  grades_7_12: ['Mathematics', 'English Language', 'Biology', 'Physics', 'Chemistry'],
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
  const band = getPracticeGradeBand(gradeLevel);
  const available = Object.keys(getFlashcardSubjectsForGrade(gradeLevel));
  const prioritized = GRADE_SURPRISE_SUBJECT_ORDER[band].filter((entry) => available.includes(entry));
  const remaining = available.filter((entry) => !prioritized.includes(entry)).sort();
  return [...prioritized, ...remaining];
}

export function getFlashcardTopicSuggestions(gradeLevel: string, subject?: string) {
  const subjects = getFlashcardSubjectsForGrade(gradeLevel) as Record<string, FlashcardSubjectRecord>;
  const normalizedSubject = normalizeSubjectName(subject?.trim() || '');

  if (normalizedSubject && subjects[normalizedSubject]) {
    return subjects[normalizedSubject].topics.map<PracticeFlashcardTopicSuggestion>((entry) => ({
      subject: normalizedSubject,
      topic: entry.topic,
    }));
  }

  const prioritizedSubjects = getFlashcardSubjectSuggestions(gradeLevel);
  return prioritizedSubjects.flatMap<PracticeFlashcardTopicSuggestion>((subjectName) =>
    (subjects[subjectName]?.topics ?? []).map((entry) => ({
      subject: subjectName,
      topic: entry.topic,
    })),
  );
}

function findFlashcardDeck(params: {
  gradeLevel: string;
  subject?: string;
  topic?: string;
  surprise?: boolean;
}) {
  const subjects = getFlashcardSubjectsForGrade(params.gradeLevel) as Record<string, FlashcardSubjectRecord>;
  const requestedSubject = normalizeSubjectName(params.subject?.trim() || '');
  const requestedTopic = (params.topic?.trim() || '').toLowerCase();
  const gradeBand = getPracticeGradeBand(params.gradeLevel);

  if (requestedSubject && subjects[requestedSubject]) {
    const subjectDeck = subjects[requestedSubject];

    // Only return a local deck if the topic actually matches what the user asked for.
    // Do NOT fall back to topics[0] — that would show wrong content (e.g. "Air" when user asked "Magnet").
    const matchedTopic =
      subjectDeck.topics.find((entry) => entry.topic.toLowerCase() === requestedTopic) ??
      subjectDeck.topics.find((entry) => entry.topic.toLowerCase().includes(requestedTopic) || requestedTopic.includes(entry.topic.toLowerCase()));

    if (matchedTopic) {
      return {
        subject: requestedSubject,
        topic: matchedTopic.topic,
        cards: matchedTopic.cards,
      };
    }

    // If topic was provided but doesn't match any local deck, return null
    // so the caller generates cards about the actual requested topic.
    if (requestedTopic) {
      return null;
    }

    // Only if no topic was requested at all, pick the first available one.
    if (subjectDeck.topics[0]) {
      return {
        subject: requestedSubject,
        topic: subjectDeck.topics[0].topic,
        cards: subjectDeck.topics[0].cards,
      };
    }

    return null;
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

  if (params.surprise) {
    const prioritizedSubjects = getFlashcardSubjectSuggestions(params.gradeLevel)
      .map((subjectName) => ({
        subjectName,
        subjectEntry: subjects[subjectName],
      }))
      .filter((entry) => entry.subjectEntry && entry.subjectEntry.topics.length > 0);

    if (prioritizedSubjects.length > 0) {
      const subjectIndex = stableSeed(`${params.gradeLevel}:${requestedSubject || 'surprise-subject'}:${gradeBand}`) % prioritizedSubjects.length;
      const selectedSubject = prioritizedSubjects[subjectIndex];
      const topicIndex = stableSeed(`${params.gradeLevel}:${selectedSubject.subjectName}:${requestedTopic || 'surprise-topic'}`) % selectedSubject.subjectEntry.topics.length;
      const selectedTopic = selectedSubject.subjectEntry.topics[topicIndex];

      return {
        subject: selectedSubject.subjectName,
        topic: selectedTopic.topic,
        cards: selectedTopic.cards,
      };
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
  surprise?: boolean;
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
