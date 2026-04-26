import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body?.contentId) {
    return NextResponse.json({ error: 'Missing contentId' }, { status: 400 });
  }

  // 1. Fetch the content and join with curriculum_map to get subject/grade
  const { data: content, error: fetchError } = await supabase
    .from('ai_generated_content')
    .select(`
      id,
      content_type,
      raw_output,
      curriculum_map:curriculum_map_id (
        subject_id,
        grade_level_id
      )
    `)
    .eq('id', body.contentId)
    .single();

  if (fetchError || !content) {
    return NextResponse.json({ error: fetchError?.message || 'Content not found' }, { status: 404 });
  }

  const { curriculum_map: cmap } = content as any;
  if (!cmap?.subject_id || !cmap?.grade_level_id) {
    return NextResponse.json({ error: 'Content is not linked to a valid curriculum map (missing subject/grade)' }, { status: 400 });
  }

  // 2. Find or Create Class (standard robust logic)
  let { data: tutorClass } = await supabase
    .from('classes')
    .select('id')
    .eq('primary_tutor_user_id', user.id)
    .eq('subject_id', cmap.subject_id)
    .eq('grade_level_id', cmap.grade_level_id)
    .in('status', ['draft', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!tutorClass) {
    const { data: grade } = await supabase.from('grade_levels').select('display_name, band_id').eq('id', cmap.grade_level_id).single();
    const { data: subject } = await supabase.from('subjects').select('name').eq('id', cmap.subject_id).single();

    const { data: newClass, error: classError } = await supabase
      .from('classes')
      .insert({
        subject_id: cmap.subject_id,
        grade_band_id: grade?.band_id,
        grade_level_id: cmap.grade_level_id,
        title: `${grade?.display_name || 'Grade'} ${subject?.name || 'Subject'}`,
        status: 'active',
        primary_tutor_user_id: user.id,
        created_by_user_id: user.id,
        starts_on: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (classError) return NextResponse.json({ error: classError.message }, { status: 500 });
    tutorClass = newClass;
  }

  // 3. Ensure Enrollment (Sync)
  const { data: students } = await supabase.from('student_profiles').select('user_id').eq('grade_level_id', cmap.grade_level_id);
  if (students && students.length > 0) {
    const enrollments = students.map(s => ({
      class_id: tutorClass!.id,
      student_user_id: s.user_id,
      status: 'active'
    }));
    await supabase.from('class_enrollments').upsert(enrollments, {
      onConflict: 'class_id,student_user_id'
    });
  }

  // 4. Create actual student-facing record
  const raw = content.raw_output as any;
  const title = raw.title || raw.topic || `AI ${content.content_type}`;
  const instructions = raw.instructions || raw.summary || raw.description || `Please review this AI-generated ${content.content_type}.`;

  if (content.content_type === 'quiz' || content.content_type === 'spelling_bee') {
    // Push as Assignment
    const { data: assignment, error: assignError } = await supabase
      .from('assignments')
      .insert({
        class_id: tutorClass!.id,
        title: content.content_type === 'spelling_bee' ? `Spelling Bee: ${title}` : title,
        instructions,
        status: 'published',
        points_possible: 100,
        created_by_user_id: user.id,
        due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select('id, title')
      .single();

    if (assignError) return NextResponse.json({ error: assignError.message }, { status: 500 });

    // Also log as event for the Library
    await supabase.from('learning_activity_events').insert({
      event_type: content.content_type === 'spelling_bee' ? 'spelling_bee_created' : 'lesson_resource_uploaded',
      actor_user_id: user.id,
      class_id: tutorClass!.id,
      payload: {
        assignment_id: assignment.id,
        title: assignment.title,
        description: instructions,
        ai_content_id: content.id
      }
    });
  } else {
    // Push as Resource only
    await supabase.from('learning_activity_events').insert({
      event_type: 'lesson_resource_uploaded',
      actor_user_id: user.id,
      class_id: tutorClass!.id,
      payload: {
        title,
        description: instructions,
        ai_content_id: content.id,
        content_type: content.content_type
      }
    });
  }

  // 5. Update AI status to published
  const { data, error } = await supabase
    .from('ai_generated_content')
    .update({ status: 'published' })
    .eq('id', body.contentId)
    .eq('generated_by_user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Content pushed to students successfully', data });
}
