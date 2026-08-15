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

export async function dispatchParentWelcomeEmailAction({
  recipientEmail,
  parentName = 'Jediark Poesy',
  templateType = 'welcome',
}: {
  recipientEmail: string;
  parentName?: string;
  templateType?: 'welcome' | 'followup1' | 'followup2';
}) {
  const { generateParentWelcomeEmailHtml, generateParentFollowUp1Html, generateParentFollowUp2Html } = await import('@/lib/emailTemplates');

  let htmlBody = generateParentWelcomeEmailHtml({ parentName, parentEmail: recipientEmail });
  let subject = 'Welcome to Edvoura Learning Hub — Your Family Onboarding Guide';

  if (templateType === 'followup1') {
    htmlBody = generateParentFollowUp1Html({ parentName, parentEmail: recipientEmail });
    subject = 'Your Free 1-on-1 Trial Session Awaits — Edvoura';
  } else if (templateType === 'followup2') {
    htmlBody = generateParentFollowUp2Html({ parentName, parentEmail: recipientEmail });
    subject = 'How Edvoura Students Boost Test Scores by 35% 📈';
  }

  // 1. Log or insert into lead_captures table in Supabase
  try {
    await supabaseAdmin.from('lead_captures').upsert({
      email: recipientEmail.toLowerCase().trim(),
      full_name: parentName,
      subject_topic: subject,
      message_body: `Automated HTML Email Dispatch (${templateType})`,
      status: 'email_dispatched',
      created_at: new Date().toISOString(),
    });
  } catch (e) {
    // Graceful fallback
  }

  // 2. Dispatch direct HTML email via sendDirectEmail
  const { sendDirectEmail } = await import('@/lib/sendEmail');
  const emailResult = await sendDirectEmail({
    to: recipientEmail.toLowerCase().trim(),
    subject,
    html: htmlBody,
  });

  // 3. Fallback trigger via Supabase Auth Admin Invite
  if (!emailResult.success) {
    try {
      await supabaseAdmin.auth.admin.inviteUserByEmail(recipientEmail.toLowerCase().trim(), {
        data: { parent_name: parentName, email_subject: subject },
      });
    } catch (e) {
      try {
        await supabaseAdmin.auth.resetPasswordForEmail(recipientEmail.toLowerCase().trim());
      } catch (err) {}
    }
  }

  return {
    success: true,
    recipientEmail,
    subject,
    templateType,
    delivered: emailResult.success,
    message: emailResult.success
      ? `✅ HTML Email (${templateType.toUpperCase()}) successfully delivered to ${recipientEmail}!`
      : `⚠️ HTML Template generated for ${recipientEmail}! (Note: Supabase default mailer requires adding RESEND_API_KEY in Vercel to bypass Supabase's strict rate limits).`,
  };
}

