import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';
import { explainLessonContent } from '@/lib/ai';

const MODES = ['simple', 'harder_examples', 'checks_for_understanding', 'revision_notes'] as const;

function buildLessonTextFromStoredContent(rawOutput: unknown) {
  if (!rawOutput || typeof rawOutput !== 'object') {
    return null;
  }

  const record = rawOutput as {
    topic?: string;
    explanation?: string;
    objectives?: string[];
    examples?: Array<{ context?: string; solution?: string }>;
  };

  const objectives = Array.isArray(record.objectives) ? record.objectives.join('; ') : '';
  const examples = Array.isArray(record.examples)
    ? record.examples
        .map((example) => `${example.context ?? ''} ${example.solution ?? ''}`.trim())
        .filter(Boolean)
        .join('\n')
    : '';

  return [record.topic, objectives, record.explanation, examples].filter(Boolean).join('\n\n');
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.mode || !body?.topic || !body?.subject || !body?.gradeLevel) {
    return NextResponse.json(
      { error: 'Missing required fields: mode, topic, subject, gradeLevel' },
      { status: 400 },
    );
  }

  if (!MODES.includes(body.mode)) {
    return NextResponse.json(
      { error: `Invalid mode. Must be one of: ${MODES.join(', ')}` },
      { status: 400 },
    );
  }

  let lessonText = typeof body.lessonText === 'string' ? body.lessonText.trim() : '';

  if (!lessonText && body.sourceContentId) {
    const { data: contentRecord } = await supabase
      .from('ai_generated_content')
      .select('raw_output, status, content_type')
      .eq('id', body.sourceContentId)
      .single();

    if (contentRecord?.raw_output) {
      lessonText = buildLessonTextFromStoredContent(contentRecord.raw_output) ?? '';
    }
  }

  if (!lessonText) {
    return NextResponse.json(
      { error: 'Provide lessonText or a valid sourceContentId with stored lesson content' },
      { status: 400 },
    );
  }

  const result = await explainLessonContent({
    mode: body.mode,
    topic: body.topic,
    subject: body.subject,
    gradeLevel: body.gradeLevel,
    lessonText,
  });

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Lesson explanation failed',
        detail: result.error,
        attempts: result.attempts,
      },
      { status: 422 },
    );
  }

  return NextResponse.json({
    explanation: result.data,
    attempts: result.attempts,
    provider: result.provider,
  });
}
