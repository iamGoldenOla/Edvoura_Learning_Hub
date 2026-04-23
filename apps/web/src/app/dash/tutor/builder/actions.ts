'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createQuizOrResource(formData: FormData) {
  const type = formData.get('type') as string;
  const title = formData.get('title') as string;
  const subjectName = formData.get('subjectName') as string;
  const gradeCode = formData.get('gradeCode') as string;
  const tutorId = formData.get('tutorId') as string;

  if (!title || !subjectName || !gradeCode || !tutorId) {
    throw new Error('Missing required fields');
  }

  // Find or create subject
  let { data: subject } = await supabaseAdmin
    .from('subjects')
    .select('id, name')
    .ilike('name', subjectName.trim())
    .single();

  if (!subject) {
    const { data: newSubject } = await supabaseAdmin
      .from('subjects')
      .insert({
        name: subjectName.trim(),
        slug: subjectName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        is_core: true,
        is_active: true
      })
      .select('id, name')
      .single();
    subject = newSubject;
  }

  // Find grade level
  const { data: grade } = await supabaseAdmin
    .from('grade_levels')
    .select('id, band_id, display_name')
    .eq('code', gradeCode)
    .single();

  if (!grade) {
    throw new Error('Grade level not found');
  }

  // Find or create class
  let { data: tutorClass } = await supabaseAdmin
    .from('classes')
    .select('id')
    .eq('primary_tutor_user_id', tutorId)
    .eq('subject_id', subject!.id)
    .eq('grade_level_id', grade.id)
    .in('status', ['draft', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!tutorClass) {
    const { data: newClass } = await supabaseAdmin
      .from('classes')
      .insert({
        subject_id: subject!.id,
        grade_band_id: grade.band_id,
        grade_level_id: grade.id,
        title: `${grade.display_name} ${subject!.name}`,
        status: 'active',
        primary_tutor_user_id: tutorId,
        created_by_user_id: tutorId,
        starts_on: new Date().toISOString()
      })
      .select('id')
      .single();
    tutorClass = newClass;
    
    // Enroll students in the new class
    const { data: students } = await supabaseAdmin
      .from('student_profiles')
      .select('user_id')
      .eq('grade_level_id', grade.id);
      
    if (students && students.length > 0) {
      const enrollments = students.map(s => ({
        class_id: tutorClass!.id,
        student_user_id: s.user_id,
        status: 'active'
      }));
      await supabaseAdmin.from('class_enrollments').insert(enrollments);
    }
  }

  if (type === 'quiz') {
    // Create quiz
    const instructions = formData.get('instructions') as string;
    const timeLimit = formData.get('timeLimit') as string;

    const { data, error } = await supabaseAdmin
      .from('quizzes')
      .insert({
        class_id: tutorClass!.id,
        title: title.trim(),
        instructions: instructions?.trim() || null,
        time_limit_minutes: timeLimit ? parseInt(timeLimit, 10) : null,
        status: 'published',
        created_by_user_id: tutorId
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return { success: true, id: data.id };
  } else if (type === 'spelling-bee') {
    // Create an actual assignment so it shows up in "Home Work"
    const description = formData.get('description') as string;
    
    const { data, error } = await supabaseAdmin
      .from('assignments')
      .insert({
        class_id: tutorClass!.id,
        title: `Spelling Bee: ${title.trim()}`,
        instructions: description?.trim() || null,
        status: 'published',
        points_possible: 100,
        created_by_user_id: tutorId,
        due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Default 1 week due
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return { success: true, id: data.id };
  } else if (type === 'resource') {
    // Log as a learning activity event for the Resource Library
    const description = formData.get('description') as string;
    
    const { data, error } = await supabaseAdmin
      .from('learning_activity_events')
      .insert({
        event_type: 'lesson_resource_uploaded',
        actor_user_id: tutorId,
        class_id: tutorClass!.id,
        payload: {
          title: title.trim(),
          description: description?.trim() || null
        }
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return { success: true, id: data.id };
  }

  revalidatePath('/dash/tutor/builder');
  return { success: true };
}

export async function deleteAssignment(assignmentId: string) {
  const { error } = await supabaseAdmin
    .from('assignments')
    .update({ status: 'archived' })
    .eq('id', assignmentId);

  if (error) throw new Error(error.message);
  
  revalidatePath('/dash/tutor/builder');
  return { success: true };
}
