import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import {
  generateQuestionsWithGemini,
  ingestGeneratedQuestions,
  GenerationJobParams,
} from '@/lib/ai/questionBankService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      subject,
      grade_band,
      curriculum_region = 'GLOBAL',
      regional_grade_label,
      topic,
      requested_count = 5,
      difficulty = 'medium',
    } = body;

    if (!subject || !grade_band || !topic) {
      return NextResponse.json(
        { error: 'Missing required parameters: subject, grade_band, topic' },
        { status: 400 }
      );
    }

    // 1. Create Job Entry
    const { data: job, error: jobErr } = await supabaseAdmin
      .from('question_generation_jobs')
      .insert({
        subject,
        grade_band,
        curriculum_region,
        topic,
        requested_count,
        status: 'running',
        model_used: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      })
      .select('id')
      .single();

    if (jobErr || !job) {
      console.error('[GENERATE JOB ERROR]', jobErr);
      return NextResponse.json({ error: 'Failed to create generation job' }, { status: 500 });
    }

    const jobParams: GenerationJobParams = {
      subject,
      grade_band,
      curriculum_region,
      regional_grade_label,
      topic,
      requested_count,
      difficulty,
    };

    // 2. Generate with Gemini
    const questions = await generateQuestionsWithGemini(jobParams);

    // 3. Ingest into Question Bank & Educator Review Queue (Layer 1 & 2 Dedup)
    const { insertedCount, duplicateCount } = await ingestGeneratedQuestions(questions);

    // 4. Complete Job Entry
    await supabaseAdmin
      .from('question_generation_jobs')
      .update({
        status: 'complete',
        generated_count: insertedCount,
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    return NextResponse.json({
      success: true,
      jobId: job.id,
      requestedCount: requested_count,
      generatedCount: questions.length,
      insertedCount,
      duplicateCount,
    });
  } catch (err: any) {
    console.error('[QUESTION GENERATION API ERROR]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
