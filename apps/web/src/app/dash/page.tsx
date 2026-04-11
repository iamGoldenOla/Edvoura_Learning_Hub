import { redirect } from 'next/navigation';
import { requireAppViewer, roleToDashboardPath } from '@/lib/app-context';

export default async function DashboardController() {
  const viewer = await requireAppViewer();
  redirect(roleToDashboardPath[viewer.currentUser.primaryRole] || '/dash/student');
}
