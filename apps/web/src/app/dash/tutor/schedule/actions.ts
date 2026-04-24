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
  
  // First, check if the lesson has a link
  const { data: lesson } = await supabase
    .from('lessons')
    .select('title, scheduled_start_at, scheduled_end_at, class_id')
    .eq('id', lessonId)
    .single();

  const { data: liveSession } = await supabase
    .from('private.lesson_live_sessions' as any)
    .select('join_url, host_url')
    .eq('lesson_id', lessonId)
    .maybeSingle();

  let finalHostUrl = liveSession?.host_url;

  if (!liveSession?.join_url && lesson) {
    // Check if there is a personal meet link for students in this class
    const { data: enrollments } = await supabase
      .from('class_enrollments')
      .select('student_user_id')
      .eq('class_id', lesson.class_id);

    if (enrollments && enrollments.length > 0) {
      const studentIds = enrollments.map(e => e.student_user_id);
      const { data: studentProfiles } = await supabase
        .from('student_profiles')
        .select('personal_meet_url, personal_meet_host_url')
        .in('user_id', studentIds)
        .not('personal_meet_url', 'is', null);

      if (studentProfiles && studentProfiles.length === 1) {
        // Use the student's personal link for this lesson
        finalHostUrl = studentProfiles[0].personal_meet_host_url;
        
        // Also update the live session table so the student sees it
        await supabase.from('private.lesson_live_sessions' as any).insert({
          lesson_id: lessonId,
          provider: 'google_meet',
          join_url: studentProfiles[0].personal_meet_url,
          host_url: studentProfiles[0].personal_meet_host_url,
        });
      }
    }

    // If still no link, try to auto-generate
    if (!finalHostUrl) {
      try {
        const { createGoogleMeetSession } = await import('@/lib/google-calendar');
        const meetUrls = await createGoogleMeetSession({
          title: lesson.title || 'Live Session',
          startTime: lesson.scheduled_start_at,
          endTime: lesson.scheduled_end_at,
        });
        
        await supabase.from('private.lesson_live_sessions' as any).insert({
          lesson_id: lessonId,
          provider: 'google_meet',
          join_url: meetUrls.joinUrl,
          host_url: meetUrls.hostUrl,
        });
        finalHostUrl = meetUrls.hostUrl;
      } catch (err) {
        console.error('Failed to generate meet link on start:', err);
      }
    }
  }

  const { error } = await supabase.rpc('start_tutor_lesson', { p_lesson_id: lessonId });

  if (error) {
    throw error;
  }

  revalidatePath('/dash/tutor/schedule');
  revalidatePath('/dash/tutor');
  revalidatePath('/dash/student/live');

  return { hostUrl: finalHostUrl };
}
