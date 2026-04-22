'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';

export async function createTutorLiveSlot(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect('/login');
  }

  const classId = String(formData.get('classId') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const scheduledStartAt = String(formData.get('scheduledStartAt') ?? '').trim();
  const scheduledEndAt = String(formData.get('scheduledEndAt') ?? '').trim();
  const joinUrl = String(formData.get('joinUrl') ?? '').trim();
  const hostUrl = String(formData.get('hostUrl') ?? '').trim();

  if (!classId || !scheduledStartAt || !scheduledEndAt) {
    redirect('/dash/tutor/schedule?error=missing-fields');
  }

  const { error } = await supabase.rpc('create_tutor_live_slot', {
    p_class_id: classId,
    p_title: title || 'Live Session',
    p_scheduled_start_at: new Date(scheduledStartAt).toISOString(),
    p_scheduled_end_at: new Date(scheduledEndAt).toISOString(),
    p_join_url: joinUrl || null,
    p_host_url: hostUrl || null,
    p_provider: 'google_meet',
  });

  if (error) {
    redirect(`/dash/tutor/schedule?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/dash/tutor/schedule');
  revalidatePath('/dash/student');
  revalidatePath('/dash/student/live');
  redirect('/dash/tutor/schedule?created=1');
}
