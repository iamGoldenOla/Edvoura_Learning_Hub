import { createClient } from '@/utils/supabase/server';
import { SpellingBeeClient } from './SpellingBeeClient';
import type { SpellingBee } from '@/lib/ai';

type ChallengeRow = {
  id: string;
  raw_output: SpellingBee | null;
};

export default async function SpellingBeePage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('ai_generated_content')
    .select('id, raw_output')
    .eq('content_type', 'spelling_bee')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const challenges = ((data ?? []) as ChallengeRow[])
    .filter((entry) => entry.raw_output && Array.isArray(entry.raw_output.words))
    .map((entry) => ({
      id: entry.id,
      title: entry.raw_output!.title,
      instructions: entry.raw_output!.instructions,
      theme: entry.raw_output!.theme,
      words: entry.raw_output!.words,
    }));

  return <SpellingBeeClient challenges={challenges} />;
}
