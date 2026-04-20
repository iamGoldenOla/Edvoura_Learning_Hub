import { redirect } from 'next/navigation';

import { requireAppViewer } from '@/lib/app-context';

export async function requireAdminAccess() {
  const viewer = await requireAppViewer();
  const role = viewer.currentUser.primaryRole;
  if (role !== 'admin' && role !== 'super_admin') {
    redirect('/dash/student');
  }
  return { viewer, isSuperAdmin: role === 'super_admin' };
}

export async function requireSuperAdminAccess() {
  const access = await requireAdminAccess();
  if (!access.isSuperAdmin) {
    redirect('/dash/admin');
  }
  return access;
}

