'use server';

import { createClient } from '@/utils/supabase/server';

export async function saveTutorProfileAction(form: {
  fullName: string;
  phoneNumber?: string;
  headline?: string;
  bio?: string;
  expertiseSummary?: string;
  availabilityNotes?: string;
  timezone?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const now = new Date().toISOString();

  // Update profiles table
  await supabase.from('profiles').update({
    full_name: form.fullName.trim(),
    updated_at: now,
  }).eq('id', user.id);

  // Upsert tutor_profiles
  const { error } = await supabase.from('tutor_profiles').upsert({
    user_id: user.id,
    headline: form.headline?.trim() || null,
    bio: form.bio?.trim() || null,
    expertise_summary: form.expertiseSummary?.trim() || null,
    availability_notes: form.availabilityNotes?.trim() || null,
    timezone: form.timezone?.trim() || 'Africa/Lagos',
    updated_at: now,
  }, { onConflict: 'user_id' });

  if (error) throw new Error(error.message);
}

export async function saveStudentProfileAction(form: {
  gradeLevelCode: string;
  schoolName?: string;
  academicGoalNotes?: string;
  timezone?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: gradeLevel } = await supabase
    .from('grade_levels')
    .select('id, band_id')
    .eq('code', form.gradeLevelCode)
    .single();

  if (!gradeLevel) throw new Error('Invalid grade level');

  const now = new Date().toISOString();

  const { error } = await supabase.from('student_profiles').upsert({
    user_id: user.id,
    grade_level_id: gradeLevel.id,
    learner_band_id: gradeLevel.band_id,
    school_name: form.schoolName?.trim() || null,
    academic_goal_notes: form.academicGoalNotes?.trim() || null,
    updated_at: now,
  }, { onConflict: 'user_id' });

  if (error) throw new Error(error.message);
}
