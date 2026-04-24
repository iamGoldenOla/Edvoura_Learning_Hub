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

  let finalJoinUrl = joinUrl || null;
  let finalHostUrl = hostUrl || null;

  if (!finalJoinUrl) {
    try {
      const { createGoogleMeetSession } = await import('@/lib/google-calendar');
      const meetUrls = await createGoogleMeetSession({
        title: title || 'Live Session',
        startTime: new Date(scheduledStartAt).toISOString(),
        endTime: new Date(scheduledEndAt).toISOString(),
      });
      finalJoinUrl = meetUrls.joinUrl;
      finalHostUrl = meetUrls.hostUrl;
    } catch (err: any) {
      console.error('Failed to auto-generate Google Meet link:', err);
      // Fallback: we still proceed but without a meet link if it fails?
      // Or we can return an error to the user to either set up credentials or paste manually.
      // redirect(`/dash/tutor/schedule?error=${encodeURIComponent(err.message || 'Failed to auto-generate Google Meet link')}`);
    }
  }

  const { error } = await supabase.rpc('create_tutor_live_slot', {
    p_class_id: classId,
    p_title: title || 'Live Session',
    p_scheduled_start_at: new Date(scheduledStartAt).toISOString(),
    p_scheduled_end_at: new Date(scheduledEndAt).toISOString(),
    p_join_url: finalJoinUrl,
    p_host_url: finalHostUrl,
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

export async function startLesson(lessonId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('start_tutor_lesson', { p_lesson_id: lessonId });

  if (error) {
    throw error;
  }

  revalidatePath('/dash/tutor/schedule');
  revalidatePath('/dash/tutor');
  revalidatePath('/dash/student/live');
}
