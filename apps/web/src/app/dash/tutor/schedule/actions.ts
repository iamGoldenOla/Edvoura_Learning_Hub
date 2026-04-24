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

  const subjectId = String(formData.get('subjectId') ?? '').trim();
  const gradeLevelId = String(formData.get('gradeLevelId') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const scheduledStartAt = String(formData.get('scheduledStartAt') ?? '').trim();
  const scheduledEndAt = String(formData.get('scheduledEndAt') ?? '').trim();
  const joinUrl = String(formData.get('joinUrl') ?? '').trim();
  const hostUrl = String(formData.get('hostUrl') ?? '').trim();

  if (!subjectId || !gradeLevelId || !scheduledStartAt || !scheduledEndAt) {
    redirect('/dash/tutor/schedule?error=missing-fields');
  }

  // Find or create the class for this tutor/subject/grade
  const { data: existingClass, error: classError } = await supabase
    .from('classes')
    .select('id')
    .eq('primary_tutor_user_id', session.user.id)
    .eq('subject_id', subjectId)
    .eq('grade_level_id', gradeLevelId)
    .maybeSingle();

  let classId = existingClass?.id;

  if (!classId) {
    // Fetch subject and grade names for a nice class title, plus the band_id
    const [{ data: sub }, { data: grd }] = await Promise.all([
      supabase.from('subjects').select('name').eq('id', subjectId).single(),
      supabase.from('grade_levels').select('display_name, band_id').eq('id', gradeLevelId).single(),
    ]);

    const { data: newClass, error: createClassError } = await supabase
      .from('classes')
      .insert({
        title: `${sub?.name || 'New Class'} - ${grd?.display_name || 'All'}`,
        subject_id: subjectId,
        grade_level_id: gradeLevelId,
        grade_band_id: grd?.band_id,
        primary_tutor_user_id: session.user.id,
        created_by_user_id: session.user.id,
        status: 'active',
      })
      .select('id')
      .single();

    if (createClassError) {
      console.error('Failed to auto-create class:', createClassError);
      redirect(`/dash/tutor/schedule?error=${encodeURIComponent('Failed to create class for this subject: ' + createClassError.message)}`);
    }
    classId = newClass.id;
  }

  const startDate = new Date(scheduledStartAt);
  const endDate = new Date(scheduledEndAt);

  console.log('Creating live slot:', { 
    scheduledStartAt, 
    scheduledEndAt, 
    parsedStart: startDate.toISOString(), 
    parsedEnd: endDate.toISOString() 
  });

  if (endDate <= startDate) {
    redirect(`/dash/tutor/schedule?error=${encodeURIComponent('Lesson end time must be after the start time. You picked ' + scheduledStartAt + ' to ' + scheduledEndAt)}`);
  }

  const isRecurring = formData.get('isRecurring') === 'on';
  const recurrenceWeeks = parseInt(String(formData.get('recurrenceWeeks') || '1'), 10);

  let finalJoinUrl = joinUrl || null;
  let finalHostUrl = hostUrl || null;

  const createSlot = async (start: Date, end: Date) => {
    let currentJoinUrl = finalJoinUrl;
    let currentHostUrl = finalHostUrl;

    if (!currentJoinUrl) {
      try {
        const { createGoogleMeetSession } = await import('@/lib/google-calendar');
        const meetUrls = await createGoogleMeetSession({
          title: title || 'Live Session',
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        });
        currentJoinUrl = meetUrls.joinUrl;
        currentHostUrl = meetUrls.hostUrl;
      } catch (err: any) {
        console.error('Failed to auto-generate Google Meet link:', err);
      }
    }

    const { error } = await supabase.rpc('create_tutor_live_slot', {
      p_class_id: classId,
      p_title: title || 'Live Session',
      p_scheduled_start_at: start.toISOString(),
      p_scheduled_end_at: end.toISOString(),
      p_join_url: currentJoinUrl,
      p_host_url: currentHostUrl,
      p_provider: 'google_meet',
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  try {
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    
    if (endObj <= startObj) {
      redirect(`/dash/tutor/schedule?error=${encodeURIComponent('The lesson end time must be after the start time. Please check your AM/PM or 24h settings.')}`);
    }

    const slotsToCreate = isRecurring ? recurrenceWeeks : 1;
    for (let i = 0; i < slotsToCreate; i++) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setDate(start.getDate() + i * 7);
      end.setDate(end.getDate() + i * 7);
      await createSlot(start, end);
    }
  } catch (err: any) {
    console.error('Error creating live slot(s):', err);
    redirect(`/dash/tutor/schedule?error=${encodeURIComponent(err.message)}`);
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

  return { hostUrl: finalHostUrl || liveSession?.join_url };
}

export async function deleteLesson(lessonId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId);

  if (error) {
    throw error;
  }

  revalidatePath('/dash/tutor/schedule');
  revalidatePath('/dash/tutor');
}
