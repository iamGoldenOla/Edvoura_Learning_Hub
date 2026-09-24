import { NextResponse } from 'next/server';
import { ingestGeneratedQuestions } from '@/lib/ai/questionBankService';
import { 
  fetchFromALOC, 
  fetchFromOpenTriviaDB, 
  fetchFromSdashAPI, 
  fetchFromMyQuest, 
  fetchFromMMLU, 
  fetchFromARC 
} from '@/lib/ai/externalQuestionSources';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { source, params } = body;

    if (!source || !params) {
      return NextResponse.json({ error: 'Missing source or params' }, { status: 400 });
    }

    let questions = [];

    switch (source) {
      case 'aloc':
        questions = await fetchFromALOC(params.subject, params.examType, params.year);
        break;
      case 'opentdb':
        questions = await fetchFromOpenTriviaDB(params.amount, params.category, params.difficulty);
        break;
      case 'sdashapi':
        questions = await fetchFromSdashAPI(params.subject, params.examType, params.year);
        break;
      case 'myquest':
        questions = await fetchFromMyQuest(params.subject, params.examType);
        break;
      case 'mmlu':
        questions = await fetchFromMMLU(params.subject, params.split);
        break;
      case 'arc':
        questions = await fetchFromARC(params.difficulty);
        break;
      default:
        return NextResponse.json({ error: 'Unknown source' }, { status: 400 });
    }

    if (questions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        source, 
        insertedCount: 0, 
        duplicateCount: 0, 
        message: 'No questions fetched.' 
      });
    }

    const { insertedCount, duplicateCount } = await ingestGeneratedQuestions(questions);

    return NextResponse.json({
      success: true,
      source,
      insertedCount,
      duplicateCount
    });

  } catch (error: any) {
    console.error('Error in ingest-external route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
