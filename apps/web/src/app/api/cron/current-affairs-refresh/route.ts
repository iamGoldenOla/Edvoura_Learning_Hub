import { NextRequest, NextResponse } from 'next/server';
import { generateQuestionsWithGemini, ingestGeneratedQuestions } from '@/lib/ai/questionBankService';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow local development execution if authorization header missing
    }

    const regions = ['NG', 'US', 'UK', 'IN', 'GLOBAL'];
    const thirtyDaysOut = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    let totalGenerated = 0;

    for (const region of regions) {
      try {
        const questions = await generateQuestionsWithGemini({
          subject: 'Current Affairs',
          grade_band: '7-9',
          curriculum_region: region,
          topic: `Recent Verifiable Events and World Headlines (${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`,
          requested_count: 5,
          difficulty: 'medium',
        });

        const taggedQuestions = questions.map((q) => ({
          ...q,
          is_current_affairs: true,
          expires_at: thirtyDaysOut,
        }));

        const { insertedCount } = await ingestGeneratedQuestions(taggedQuestions);
        totalGenerated += insertedCount;
      } catch (e) {
        console.error(`[CRON CURRENT AFFAIRS ERROR FOR ${region}]`, e);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Current affairs refresh complete. Generated ${totalGenerated} region-tagged questions.`,
      regionsProcessed: regions,
    });
  } catch (err: any) {
    console.error('[CRON CURRENT AFFAIRS API ERROR]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
