import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateEducationalContent } from '@/lib/ai';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // 1. Auth guard — only authenticated users
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse request body
  const body = await request.json().catch(() => null);

  if (!body || !body.theme || !body.gradeLevel) {
    return NextResponse.json(
      { error: 'Missing required fields: theme, gradeLevel' },
      { status: 400 },
    );
  }

  // 3. Call generateEducationalContent for a story
  const result = await generateEducationalContent({
    contentType: 'story',
    topic: body.theme,
    subject: 'Reading',
    gradeLevel: body.gradeLevel,
    curriculumSystem: 'WAEC',
  });

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'AI Story generation failed',
        detail: result.error,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    success: true,
    data: result.data,
  });
}
