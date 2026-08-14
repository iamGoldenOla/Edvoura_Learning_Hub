import { AdminNavHeader } from '@/components/dashboards/admin/AdminNavHeader';
import { AdminUsersClient } from '@/components/dashboards/admin/AdminUsersClient';
import { requireSuperAdminAccess } from '../_lib/role-guard';
import { getAdminDashboardData } from '@/lib/app-context';

export default async function AdminUsersRolesPage() {
  await requireSuperAdminAccess();
  const dashboard = await getAdminDashboardData();

  const totalUsers = dashboard.totalStudents + dashboard.totalTutors + dashboard.totalParents;

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-8 sm:space-y-10 p-4 sm:p-8 pb-24">
      <AdminNavHeader
        title="Users and Roles"
        subtitle="Central user management, role permissions, account directory, and access control."
      />
      <AdminUsersClient
        totalUsers={totalUsers}
        pendingApprovals={dashboard.pendingTutorApprovals}
        recentSignups={dashboard.recentSignups}
      />
    </div>
  );
}
