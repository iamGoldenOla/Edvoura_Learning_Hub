'use server';

import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function addChildAction(payload: {
  fullName: string;
  email?: string;
  gradeLevelCode: string;
  schoolName?: string;
  academicGoalNotes?: string;
  relationship: string;
  isPrimaryGuardian: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify parent profile exists
  const { data: parentProfile } = await supabase
    .from('parent_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .single();

  if (!parentProfile) throw new Error('Complete your parent profile before adding children.');

  // Resolve grade level
  const { data: gradeLevel } = await supabase
    .from('grade_levels')
    .select('id, band_id')
    .eq('code', payload.gradeLevelCode)
    .single();

  if (!gradeLevel) throw new Error(`Grade level '${payload.gradeLevelCode}' not found.`);

  // Create child auth user via Supabase Admin API
  const childEmail =
    payload.email?.trim() ||
    `child-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@edvoura.internal`;

  const { data: newUser, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email: childEmail,
      user_metadata: { full_name: payload.fullName },
      email_confirm: true,
    });

  if (createError || !newUser.user) {
    throw new Error('Failed to create child account.');
  }

  const studentUserId = newUser.user.id;
  const now = new Date().toISOString();

  // Create student profile
  await supabaseAdmin.from('student_profiles').upsert({
    user_id: studentUserId,
    grade_level_id: gradeLevel.id,
    learner_band_id: gradeLevel.band_id,
    school_name: payload.schoolName?.trim() || null,
    academic_goal_notes: payload.academicGoalNotes?.trim() || null,
    created_at: now,
    updated_at: now,
  }, { onConflict: 'user_id' });

  // Assign student role
  await supabaseAdmin.from('user_roles').upsert({
    user_id: studentUserId,
    role: 'student',
    granted_by_user_id: user.id,
    granted_at: now,
  }, { onConflict: 'user_id,role' });

  // Link parent to student
  await supabaseAdmin.from('parent_student_links').upsert({
    parent_user_id: user.id,
    student_user_id: studentUserId,
    relationship: payload.relationship,
    is_primary_guardian: payload.isPrimaryGuardian,
    can_view_billing: true,
    can_view_progress: true,
    is_active: true,
    created_at: now,
    updated_at: now,
  }, { onConflict: 'parent_user_id,student_user_id' });

  return { studentUserId };
}

export async function linkExistingChildAction(payload: {
  childEmail: string;
  relationship: string;
  isPrimaryGuardian: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const normalizedEmail = payload.childEmail.trim().toLowerCase();

  // Verify parent profile
  const { data: parentProfile } = await supabase
    .from('parent_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .single();

  if (!parentProfile) throw new Error('Complete your parent profile before linking a child.');

  // Find child profile
  const { data: childProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', normalizedEmail)
    .single();

  if (!childProfile) throw new Error('No account found for that child email.');
  if (childProfile.id === user.id) throw new Error('Cannot link yourself as a child.');

  // Check child is a student
  const { data: studentProfile } = await supabaseAdmin
    .from('student_profiles')
    .select('user_id')
    .eq('user_id', childProfile.id)
    .single();

  if (!studentProfile) throw new Error('That email does not belong to a student profile.');

  const now = new Date().toISOString();

  await supabaseAdmin.from('parent_student_links').upsert({
    parent_user_id: user.id,
    student_user_id: childProfile.id,
    relationship: payload.relationship,
    is_primary_guardian: payload.isPrimaryGuardian,
    can_view_billing: true,
    can_view_progress: true,
    is_active: true,
    created_at: now,
    updated_at: now,
  }, { onConflict: 'parent_user_id,student_user_id' });

  return { studentUserId: childProfile.id };
}
