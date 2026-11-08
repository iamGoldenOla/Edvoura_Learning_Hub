import wordsDataRaw from './data/word-atlas.json';

export interface WordSense {
  pos: string;
  en: string;
  zh?: string;
}

export interface WordExample {
  en: string;
  zh?: string;
}

export interface VocabularyWord {
  id: string;
  w: string;
  uk: string;
  us: string;
  senses: WordSense[];
  ex: WordExample[];
  col?: string[];
  fam?: string[];
  syn?: string[];
  ant?: string[];
  cefr: string;
  topic: string;
  illustrationUrl: string;
  thumbnailUrl: string;
}

const rawList: any[] = wordsDataRaw as any[];

const wordsList: VocabularyWord[] = rawList.map((item) => ({
  id: item.id,
  w: item.w,
  uk: item.uk || '',
  us: item.us || '',
  senses: item.senses || [],
  ex: item.ex || [],
  col: item.col || [],
  fam: item.fam || [],
  syn: item.syn || [],
  ant: item.ant || [],
  cefr: item.cefr || 'B1',
  topic: item.topic || 'general',
  illustrationUrl: `https://cdn.jsdelivr.net/gh/designfuchen/word-atlas@main/public/atlas/img/${item.id}.webp`,
  thumbnailUrl: `https://cdn.jsdelivr.net/gh/designfuchen/word-atlas@main/public/atlas/thumb/${item.id}.webp`,
}));

// Quick lookup map by id and lower-cased word
const wordMapById = new Map<string, VocabularyWord>();
const wordMapByWord = new Map<string, VocabularyWord>();
const topicsSet = new Set<string>();
const cefrSet = new Set<string>();

wordsList.forEach((word) => {
  wordMapById.set(word.id, word);
  wordMapByWord.set(word.w.toLowerCase(), word);
  if (word.topic) topicsSet.add(word.topic);
  if (word.cefr) cefrSet.add(word.cefr);
});

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function getAllVocabularyTopics(): string[] {
  return Array.from(topicsSet).sort();
}

export function getWordById(id: string): VocabularyWord | undefined {
  return wordMapById.get(id);
}

export function getWordByName(name: string): VocabularyWord | undefined {
  return wordMapByWord.get(name.toLowerCase().trim());
}

export function getVocabularyWords(filters?: {
  topic?: string;
  cefr?: string;
  query?: string;
  page?: number;
  limit?: number;
}): {
  words: VocabularyWord[];
  total: number;
  page: number;
  totalPages: number;
} {
  let results = wordsList;

  if (filters?.topic && filters.topic !== 'all') {
    results = results.filter((w) => w.topic.toLowerCase() === filters.topic!.toLowerCase());
  }

  if (filters?.cefr && filters.cefr !== 'all') {
    results = results.filter((w) => w.cefr.toUpperCase() === filters.cefr!.toUpperCase());
  }

  if (filters?.query && filters.query.trim()) {
    const q = filters.query.trim().toLowerCase();
    results = results.filter(
      (w) =>
        w.w.toLowerCase().includes(q) ||
        w.senses.some((s) => s.en.toLowerCase().includes(q)) ||
        (w.col && w.col.some((c) => c.toLowerCase().includes(q)))
    );
  }

  const page = Math.max(1, filters?.page || 1);
  const limit = Math.max(1, Math.min(100, filters?.limit || 24));
  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginated = results.slice(start, start + limit);

  return {
    words: paginated,
    total,
    page,
    totalPages,
  };
}

/**
 * Returns a deterministic daily word based on the day of the year
 */
export function getDailyWord(): VocabularyWord {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const index = Math.abs(dayOfYear) % wordsList.length;
  return wordsList[index];
}

/**
 * Get a set of random words for Spelling Bee or Flashcards practice
 */
export function getRandomPracticeWords(count = 10, cefr?: string): VocabularyWord[] {
  let pool = wordsList;
  if (cefr && cefr !== 'all') {
    pool = pool.filter((w) => w.cefr.toUpperCase() === cefr.toUpperCase());
  }
  if (pool.length === 0) pool = wordsList;

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
