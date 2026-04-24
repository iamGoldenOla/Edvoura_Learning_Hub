'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

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
