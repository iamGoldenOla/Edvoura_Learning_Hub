/**
 * POST /api/ai/generate
 *
 * Generates curriculum-aligned educational content (lesson notes, stories,
 * comprehensions, quizzes).  Only authenticated Tutors and Admins may call it.
 *
 * The response is validated by the Zod schema before being stored.  If
 * validation fails after all retries the request returns 422.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateEducationalContent, CONTENT_TYPES, type ContentType } from '@/lib/ai';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // 1. Auth guard — only tutors / admins
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  const allowedRoles = ['tutor', 'admin', 'super_admin'];
  const hasAccess = roles?.some((r) => allowedRoles.includes(r.role));

  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Forbidden - only tutors and admins may generate content' },
      { status: 403 },
    );
  }

  // 2. Parse request body
  const body = await request.json().catch(() => null);

  if (!body || !body.contentType || !body.topic || !body.subject || !body.gradeLevel) {
    return NextResponse.json(
      { error: 'Missing required fields: contentType, topic, subject, gradeLevel' },
      { status: 400 },
    );
  }

  if (!CONTENT_TYPES.includes(body.contentType as ContentType)) {
    return NextResponse.json(
      { error: `Invalid contentType. Must be one of: ${CONTENT_TYPES.join(', ')}` },
      { status: 400 },
    );
  }

  // 3. Optionally pull curriculum context from curriculum_maps
  let objectives: string[] | undefined;

  if (body.curriculumMapId) {
    const { data: curriculumMap } = await supabase
      .from('curriculum_maps')
      .select('learning_objectives, difficulty_weight')
      .eq('id', body.curriculumMapId)
      .single();

    if (curriculumMap) {
      objectives = curriculumMap.learning_objectives as string[];
      body.difficulty = body.difficulty ?? curriculumMap.difficulty_weight;
    }
  }

  // 4. Generate content via the orchestrator
  const result = await generateEducationalContent({
    contentType: body.contentType,
    topic: body.topic,
    subject: body.subject,
    gradeLevel: body.gradeLevel,
    curriculumSystem: body.curriculumSystem ?? 'WAEC',
    objectives: objectives ?? body.objectives,
    difficulty: body.difficulty,
    studentContext: body.studentContext,
  });

  if (!result.success) {
    const isProviderAvailabilityIssue =
      /openrouter|gemini|provider|api key|user not found|unauthorized|no valid/i.test(result.error ?? '');
    const status =
      isProviderAvailabilityIssue
        ? 503
        : 422;

    return NextResponse.json(
      {
        error: 'Content generation failed validation after all retries',
        detail: result.error,
        attempts: result.attempts,
      },
      { status },
    );
  }

  if (body.skipSave === true) {
    return NextResponse.json({
      message: 'Content generated successfully',
      content: result.data,
      record: null,
      attempts: result.attempts,
      provider: result.provider ?? null,
    });
  }

  // 5. Store validated content in the database
  const { data: savedContent, error: saveError } = await supabase
    .from('ai_generated_content')
    .insert({
      content_type: body.contentType,
      curriculum_map_id: body.curriculumMapId ?? null,
      title: result.data && typeof result.data === 'object' && 'title' in result.data ? (result.data as { title?: string }).title ?? `${body.subject} - ${body.topic}` : `${body.subject} - ${body.topic}`,
      subject: body.subject,
      topic: body.topic,
      grade: body.gradeLevel,
      skill_type: body.subject,
      task_type: body.contentType === 'lesson_note' ? 'GENERATE_LESSON_NOTE' : body.contentType === 'quiz' ? 'GENERATE_QUIZ' : body.contentType === 'spelling_bee' ? 'GENERATE_SPELLING' : 'IMPROVE_CONTENT',
      content_json: result.data,
      content_text: JSON.stringify(result.data, null, 2),
      generated_by_user_id: user.id,
      generated_by_role: roles?.[0]?.role ?? 'tutor',
      raw_output: result.data,
      status: 'DRAFT',
      ai_provider: result.provider?.split(':')?.[0] ?? 'legacy',
      model_used: result.provider ?? 'legacy',
    })
    .select('id, content_type, status, created_at')
    .single();

  if (saveError) {
    return NextResponse.json({
      message: 'Content generated successfully, but draft save failed',
      warning: `Draft save failed: ${saveError.message}`,
      content: result.data,
      record: null,
      attempts: result.attempts,
      provider: result.provider ?? null,
    });
  }

  return NextResponse.json({
    message: 'Content generated and saved successfully',
    content: result.data,
    record: savedContent,
    attempts: result.attempts,
    provider: result.provider ?? null,
  });
}
