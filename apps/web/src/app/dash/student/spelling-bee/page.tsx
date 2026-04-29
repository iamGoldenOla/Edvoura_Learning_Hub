import { supabaseAdmin } from '@/utils/supabase/admin';
import { requireAppViewer } from '@/lib/app-context';
import { SpellingBeeClient } from './SpellingBeeClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SpellingWord = {
  word?: string;
  meaning?: string;
  example_sentence?: string;
};

type LegacySpellingPayload = {
  title?: string;
  instructions?: string;
  theme?: string;
  words?: Array<{
    word?: string;
    pronunciation?: string;
    syllables?: number;
    definition?: string;
    exampleSentence?: string;
    hint?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  }>;
};

type NewSpellingPayload = {
  exercise?: string;
  easy?: SpellingWord[];
  medium?: SpellingWord[];
  difficult?: SpellingWord[];
};

type StudentSpellingBeeWord = {
  word: string;
  pronunciation: string;
  syllables: number;
  definition: string;
  exampleSentence: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

type StudentSpellingBeeChallenge = {
  id: string;
  title: string;
  instructions: string;
  theme: string;
  words: StudentSpellingBeeWord[];
};

export default async function SpellingBeePage() {
  await requireAppViewer();

  const { data } = await supabaseAdmin
    .from('ai_generated_content')
    .select('id, content_json')
    .in('task_type', ['GENERATE_SPELLING'])
    .eq('status', 'PUBLISHED')
    .order('created_at', { ascending: false });

  const challenges: StudentSpellingBeeChallenge[] = ((data ?? []) as Array<{ id: string; content_json: Record<string, unknown> | null }>)
    .map((entry) => {
      const payload = entry.content_json;
      if (!payload || typeof payload !== 'object') return null;

      const legacyPayload = payload as LegacySpellingPayload;
      if (Array.isArray(legacyPayload.words)) {
        return {
          id: entry.id,
          title: String(legacyPayload.title ?? 'Spelling Challenge'),
          instructions: String(legacyPayload.instructions ?? 'Practice these spelling words carefully.'),
          theme: String(legacyPayload.theme ?? 'General'),
          words: legacyPayload.words,
        };
      }

      const newPayload = payload as NewSpellingPayload;
      const easy = Array.isArray(newPayload.easy) ? newPayload.easy : [];
      const medium = Array.isArray(newPayload.medium) ? newPayload.medium : [];
      const difficult = Array.isArray(newPayload.difficult) ? newPayload.difficult : [];
      const allWords: StudentSpellingBeeWord[] = [...easy, ...medium, ...difficult]
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
          word: String(item.word ?? ''),
          pronunciation: String(item.word ?? ''),
          syllables: Math.max(1, String(item.word ?? '').split(/[\s-]+/).filter(Boolean).length),
          definition: String(item.meaning ?? ''),
          exampleSentence: String(item.example_sentence ?? ''),
          hint: `Think about the word ${String(item.word ?? '').slice(0, 1).toUpperCase()}.`,
          difficulty: 'medium' as const,
        }))
        .filter((item) => item.word.length > 0);

      if (allWords.length === 0) return null;

      return {
        id: entry.id,
        title: 'AI Spelling Challenge',
        instructions: String(newPayload.exercise ?? 'Practice these spelling words and use them in sentences.'),
        theme: 'Mixed Difficulty',
        words: allWords,
      };
    })
    .filter((entry): entry is StudentSpellingBeeChallenge => entry !== null);

  return <SpellingBeeClient challenges={challenges} />;
}
