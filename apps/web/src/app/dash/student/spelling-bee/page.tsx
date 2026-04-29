import { createClient } from '@/utils/supabase/server';
import { SpellingBeeClient } from './SpellingBeeClient';
import type { SpellingBee } from '@/lib/ai';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ChallengeRow = {
  id: string;
  raw_output: SpellingBee | null;
};

export default async function SpellingBeePage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('ai_generated_content')
    .select('id, content_json')
    .in('task_type', ['GENERATE_SPELLING'])
    .in('status', ['published', 'PUBLISHED'])
    .order('created_at', { ascending: false });

  const challenges = ((data ?? []) as any[])
    .filter((entry) => entry.content_json && Array.isArray(entry.content_json.words))
    .map((entry) => ({
      id: entry.id,
      title: entry.content_json!.title,
      instructions: entry.content_json!.instructions,
      theme: entry.content_json!.theme,
      words: entry.content_json!.words,
    }));

  return <SpellingBeeClient challenges={challenges} />;
}
