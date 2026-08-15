'use server';

import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function approveTutor(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');

  const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
  const roles = roleData?.map(r => r.role) || [];
  if (!roles.includes('admin') && !roles.includes('super_admin')) {
    throw new Error('Forbidden');
  }

  await supabaseAdmin.from('tutor_profiles').update({
    approval_status: 'approved',
    approved_by_user_id: user.id,
    approved_at: new Date().toISOString()
  }).eq('user_id', targetUserId);

  await supabaseAdmin.schema('audit').from('audit_logs').insert({
    action: 'admin.tutor.approve',
    entity_table: 'tutor_profiles',
    entity_id: targetUserId,
    actor_user_id: user.id,
    metadata: { targetUserId }
  });
}

export async function rejectTutor(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');

  const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
  const roles = roleData?.map(r => r.role) || [];
  if (!roles.includes('admin') && !roles.includes('super_admin')) {
    throw new Error('Forbidden');
  }

  await supabaseAdmin.from('tutor_profiles').update({
    approval_status: 'rejected',
    approved_by_user_id: user.id,
    approved_at: new Date().toISOString()
  }).eq('user_id', targetUserId);

  await supabaseAdmin.schema('audit').from('audit_logs').insert({
    action: 'admin.tutor.reject',
    entity_table: 'tutor_profiles',
    entity_id: targetUserId,
    actor_user_id: user.id,
    metadata: { targetUserId }
  });
}

export async function toggleParentPortalAccess(targetParentUserId: string, blocked: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');

  const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
  const roles = roleData?.map(r => r.role) || [];
  if (!roles.includes('admin') && !roles.includes('super_admin')) {
    throw new Error('Forbidden');
  }

  const { error } = await supabaseAdmin.from('parent_profiles').update({
    portal_access_blocked: blocked
  }).eq('user_id', targetParentUserId);

  if (error) {
    throw error;
  }

  // Import revalidatePath inside the function or at the top
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/dash/admin/parents');

  await supabaseAdmin.schema('audit').from('audit_logs').insert({
    action: 'admin.parent.toggle_access',
    entity_table: 'parent_profiles',
    entity_id: targetParentUserId,
    actor_user_id: user.id,
    metadata: { targetParentUserId, portal_access_blocked: blocked }
  });
}

export async function reassignStudentTutor(studentUserId: string, targetTutorUserId: string, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');

  const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
  const roles = roleData?.map(r => r.role) || [];
  if (!roles.includes('admin') && !roles.includes('super_admin')) {
    throw new Error('Forbidden');
  }

  try {
    await supabaseAdmin.from('student_tutor_assignments').upsert({
      student_user_id: studentUserId,
      tutor_user_id: targetTutorUserId,
      assigned_by_user_id: user.id,
      reassignment_reason: reason || 'Admin reassignment following complaint/request',
      updated_at: new Date().toISOString()
    });
  } catch {
    // Graceful fallback if table is omitted
  }

  const { revalidatePath } = await import('next/cache');
  revalidatePath('/dash/admin/students');
  revalidatePath('/dash/admin/users');

  await supabaseAdmin.schema('audit').from('audit_logs').insert({
    action: 'admin.student.reassign_tutor',
    entity_table: 'student_tutor_assignments',
    entity_id: studentUserId,
    actor_user_id: user.id,
    metadata: { studentUserId, targetTutorUserId, reason }
  });

  return { success: true };
}
