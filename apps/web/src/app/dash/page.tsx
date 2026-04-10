import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardController() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Temporary stub for role-based routing.
  // In a real implementation, you would fetch `user_roles` from the DB via API client or Supabase direct query
  // For now, redirect to student as a safe default
  const userRole = user.user_metadata?.role || 'student';

  switch (userRole) {
    case 'admin':
      redirect('/dash/admin');
    case 'tutor':
      redirect('/dash/tutor');
    case 'parent':
      redirect('/dash/parent');
    case 'student':
    default:
      redirect('/dash/student');
  }
}
