'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function updateStudentPersonalLink(studentId: string, joinUrl: string, hostUrl: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('student_profiles')
    .update({
      personal_meet_url: joinUrl,
      personal_meet_host_url: hostUrl,
    })
    .eq('user_id', studentId);

  if (error) {
    throw error;
  }

  revalidatePath('/dash/tutor/roster');
  revalidatePath('/dash/student/live');
}

export async function quickOnboardPupil(data: {
  fullName: string;
  gradeLevel: number; // 1 to 6
  meetUrl: string;
  parentEmail?: string;
  scheduleNotes?: string;
}) {
  try {
    const { fullName, gradeLevel, meetUrl, parentEmail, scheduleNotes } = data;

    // Fetch matching grade level
    const { data: gradeLevels } = await supabaseAdmin
      .from('grade_levels')
      .select('id, band_id, numeric_level');

    const targetGrade = gradeLevels?.find((g) => g.numeric_level === gradeLevel) || gradeLevels?.[0];

    if (!targetGrade) {
      throw new Error('Grade level not found');
    }

    // Check if user already exists
    const sanitizedEmail = `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}.student@edvoura.com`;
    
    let studentUserId: string | null = null;

    const { data: existingProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .ilike('full_name', `%${fullName.trim()}%`)
      .limit(1);

    if (existingProfiles && existingProfiles.length > 0) {
      studentUserId = existingProfiles[0].id;
    } else {
      // Create user in auth
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: sanitizedEmail,
        password: 'EdvouraPupil2026!',
        email_confirm: true,
        user_metadata: {
          full_name: fullName.trim(),
          role: 'student',
        },
      });

      if (createErr || !newUser?.user) {
        throw new Error(createErr?.message || 'Failed to create student user');
      }

      studentUserId = newUser.user.id;
      await supabaseAdmin.from('user_roles').upsert({ user_id: studentUserId, role: 'student' });
    }

    // Upsert student profile
    await supabaseAdmin
      .from('student_profiles')
      .upsert({
        user_id: studentUserId,
        grade_level_id: targetGrade.id,
        learner_band_id: targetGrade.band_id,
        personal_meet_url: meetUrl.trim(),
        personal_meet_host_url: meetUrl.trim(),
        academic_goal_notes: scheduleNotes || `Grade ${gradeLevel} 1-on-1 sessions`,
        school_name: `Primary / Grade ${gradeLevel}`,
        updated_at: new Date().toISOString(),
      });

    // If parent email provided, link parent
    if (parentEmail && parentEmail.includes('@')) {
      const { data: parentProfiles } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', parentEmail.trim().toLowerCase())
        .limit(1);

      let parentId = parentProfiles?.[0]?.id;

      if (!parentId) {
        const { data: newParent } = await supabaseAdmin.auth.admin.createUser({
          email: parentEmail.trim().toLowerCase(),
          password: 'EdvouraParent2026!',
          email_confirm: true,
          user_metadata: {
            role: 'parent',
          },
        });
        if (newParent?.user) {
          parentId = newParent.user.id;
          await supabaseAdmin.from('user_roles').upsert({ user_id: parentId, role: 'parent' });
          await supabaseAdmin.from('parent_profiles').upsert({ user_id: parentId });
        }
      }

      if (parentId) {
        await supabaseAdmin
          .from('parent_student_links')
          .upsert(
            {
              parent_user_id: parentId,
              student_user_id: studentUserId,
              relationship: 'guardian',
              is_primary_guardian: true,
              can_view_billing: true,
              can_view_progress: true,
            },
            { onConflict: 'parent_user_id,student_user_id' }
          );
      }
    }

    revalidatePath('/dash/tutor/roster');
    revalidatePath('/dash/tutor/lesson-notes');
    revalidatePath('/dash/student/live');

    return { success: true, studentUserId };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}
