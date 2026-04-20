import { redirect } from 'next/navigation';

import { getAppViewer, roleToDashboardPath } from '@/lib/app-context';
import { createClient } from '@/utils/supabase/server';

export default async function MeEntryPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const viewer = await getAppViewer();
  if (!viewer) {
    redirect('/me/auth');
  }
  const metadataRole =
    typeof session?.user?.user_metadata?.role === 'string' ? session.user.user_metadata.role : null;
  const role =
    metadataRole === 'student' ||
    metadataRole === 'parent' ||
    metadataRole === 'tutor' ||
    metadataRole === 'admin' ||
    metadataRole === 'super_admin'
      ? metadataRole
      : viewer.currentUser.primaryRole;

  if (role === 'super_admin') {
    redirect('/dash/admin');
  }

  redirect(roleToDashboardPath[role] ?? '/dash/student');
}
