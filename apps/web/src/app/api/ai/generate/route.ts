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

  const allowedRoles = ['tutor', 'admin', 'super_admin', 'student'];
  const hasAccess = roles?.some((r) => allowedRoles.includes(r.role));

  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Forbidden — only students, tutors and admins may generate content' },
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
    return NextResponse.json(
      {
        error: 'Content generation failed validation after all retries',
        detail: result.error,
        attempts: result.attempts,
      },
      { status: 422 },
    );
  }

  // 5. Store validated content in the database
  const { data: savedContent, error: saveError } = await supabase
    .from('ai_generated_content')
    .insert({
      content_type: body.contentType,
      curriculum_map_id: body.curriculumMapId ?? null,
      generated_by_user_id: user.id,
      raw_output: result.data,
      status: 'draft',
    })
    .select('id, content_type, status, created_at')
    .single();

  if (saveError) {
    return NextResponse.json(
      { error: 'Content generated but failed to save', detail: saveError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: 'Content generated and saved successfully',
    content: result.data,
    record: savedContent,
    attempts: result.attempts,
  });
}
