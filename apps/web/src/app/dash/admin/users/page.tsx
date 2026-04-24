import Link from 'next/link';
import { KeyRound, ShieldCheck, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSuperAdminAccess } from '../_lib/role-guard';
import { getAdminDashboardData } from '@/lib/app-context';

export default async function AdminUsersRolesPage() {
  await requireSuperAdminAccess();
  const dashboard = await getAdminDashboardData();

  const totalUsers = dashboard.totalStudents + dashboard.totalTutors + dashboard.totalParents;

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--';
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">Users and Roles</h1>
        <p className="mt-1 text-sm text-slate-600">
          Central user management, role permissions, and account access control.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <Users className="h-5 w-5 text-blue-600" />
            <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Total Users</p>
            <p className="text-2xl font-bold text-slate-900">{totalUsers.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Active Roles</p>
            <p className="text-2xl font-bold text-slate-900">3</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Students, Parents, Tutors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <KeyRound className="h-5 w-5 text-indigo-600" />
            <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Pending Approvals</p>
            <p className="text-2xl font-bold text-slate-900">{dashboard.pendingTutorApprovals}</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Tutor profiles waiting</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent User Signups</CardTitle>
          <div className="flex gap-2">
            <Link href="/dash/admin/users?export=csv" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
              Export
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {dashboard.recentSignups.length === 0 ? (
             <p className="text-sm text-slate-500">No recent users.</p>
          ) : (
            dashboard.recentSignups.map((row) => (
              <div key={row.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-900">{row.fullName || row.email}</p>
                  <p className="text-slate-600">Role: <span className="uppercase text-[10px] tracking-wider font-bold bg-slate-100 px-2 py-0.5 rounded ml-1">{row.role}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-slate-700">active</p>
                  <p className="text-xs text-slate-500">Joined {formatDate(row.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
