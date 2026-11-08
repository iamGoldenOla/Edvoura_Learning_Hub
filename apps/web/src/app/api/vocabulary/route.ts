import { NextRequest, NextResponse } from 'next/server';
import {
  getVocabularyWords,
  getWordById,
  getDailyWord,
  getRandomPracticeWords,
  getAllVocabularyTopics,
  CEFR_LEVELS,
} from '@/lib/curriculum/vocabulary/vocabularyEngine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // 1. Single Word Deep-Dive
    const id = searchParams.get('id');
    if (id) {
      const word = getWordById(id);
      if (!word) {
        return NextResponse.json({ error: 'Word not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: word });
    }

    // 2. Word of the Day
    if (searchParams.get('daily') === 'true') {
      return NextResponse.json({ success: true, data: getDailyWord() });
    }

    // 3. Practice / Spelling Bee / Flashcard Batch
    if (searchParams.get('practice') === 'true') {
      const count = parseInt(searchParams.get('count') || '10', 10);
      const cefr = searchParams.get('cefr') || undefined;
      const batch = getRandomPracticeWords(count, cefr);
      return NextResponse.json({ success: true, data: batch });
    }

    // 4. Topics & CEFR Levels Catalog
    if (searchParams.get('catalog') === 'true') {
      return NextResponse.json({
        success: true,
        data: {
          topics: getAllVocabularyTopics(),
          levels: CEFR_LEVELS,
        },
      });
    }

    // 5. Paginated & Filtered Vocabulary Query
    const topic = searchParams.get('topic') || undefined;
    const cefr = searchParams.get('cefr') || undefined;
    const query = searchParams.get('q') || searchParams.get('query') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '24', 10);

    const result = getVocabularyWords({
      topic,
      cefr,
      query,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('[VOCABULARY API ERROR]', err);
    return NextResponse.json(
      { error: 'Failed to retrieve vocabulary data' },
      { status: 500 }
    );
  }
}
