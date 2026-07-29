'use server';

import { supabaseAdmin } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { unstable_noStore as noStore } from 'next/cache';

export type PreloadedResource = {
  id: string;
  title: string;
  description: string | null;
  file_name: string;
  public_url: string;
  grade_level_code: string;
  resource_type: string;
};

/**
 * Fetch all preloaded comprehension resources for a given grade code.
 */
export async function getPreloadedResources(gradeCode: string) {
  noStore();
  const { data, error } = await supabaseAdmin
    .from('preloaded_resources')
    .select('id, title, description, file_name, public_url, grade_level_code, resource_type')
    .eq('grade_level_code', gradeCode)
    .eq('resource_type', 'comprehension')
    .order('title');

  if (error) {
    console.error('Error fetching preloaded resources:', error.message);
    return [];
  }

  return (data ?? []) as PreloadedResource[];
}

/**
 * Push a preloaded comprehension resource to all students in the tutor's classes.
 * This creates a learning_activity_event (resource type) that students will see.
 */
export async function pushResourceToStudents(
  resourceId: string,
  tutorId: string,
  gradeCode: string,
) {
  // 1. Fetch the resource details
  const { data: resource, error: fetchError } = await supabaseAdmin
    .from('preloaded_resources')
    .select('title, description, public_url, file_name')
    .eq('id', resourceId)
    .single();

  if (fetchError || !resource) {
    return { success: false, message: 'Resource not found.' };
  }

  // 2. Find the grade_level_id for this code
  const { data: gradeLevel } = await supabaseAdmin
    .from('grade_levels')
    .select('id')
    .eq('code', gradeCode)
    .single();

  if (!gradeLevel) {
    return { success: false, message: 'Grade level not found.' };
  }

  // 3. Find all active classes for this tutor + grade
  const { data: classes } = await supabaseAdmin
    .from('classes')
    .select('id, subject_id')
    .eq('tutor_id', tutorId)
    .eq('grade_level_id', gradeLevel.id)
    .eq('status', 'active');

  if (!classes || classes.length === 0) {
    return { success: false, message: 'No active classes found for this grade. Create a class first.' };
  }

  // 4. Create a backing assignment for the resource
  const { data: assignment, error: assignmentError } = await supabaseAdmin
    .from('assignments')
    .insert({
      title: resource.title,
      instructions: resource.description || `Comprehension resource: ${resource.title}`,
      class_id: classes[0].id,
      status: 'published',
    })
    .select('id')
    .single();

  if (assignmentError || !assignment) {
    return { success: false, message: `Failed to create assignment: ${assignmentError?.message}` };
  }

  // 5. Create a learning_activity_event for each class
  const events = classes.map((cls) => ({
    event_type: 'resource',
    title: resource.title,
    description: resource.description || `Comprehension resource for your grade`,
    class_id: cls.id,
    assignment_id: assignment.id,
    tutor_id: tutorId,
    grade_level_id: gradeLevel.id,
    subject_id: cls.subject_id,
    metadata: {
      source: 'comprehension_library',
      preloaded_resource_id: resourceId,
      pdf_url: resource.public_url,
      file_name: resource.file_name,
    },
  }));

  const { error: eventError } = await supabaseAdmin
    .from('learning_activity_events')
    .insert(events);

  if (eventError) {
    return { success: false, message: `Failed to publish: ${eventError.message}` };
  }

  revalidatePath('/dash/tutor/builder');
  revalidatePath('/dash/student');

  return {
    success: true,
    message: `"${resource.title}" pushed to ${classes.length} class${classes.length > 1 ? 'es' : ''}. Students can now view it.`,
  };
}
