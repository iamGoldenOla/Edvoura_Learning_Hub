import Link from 'next/link';
import { KeyRound, ShieldCheck, Users } from 'lucide-react';
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
    <div className="mx-auto max-w-[1680px] space-y-10 p-6 sm:p-8 pb-24">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-purple-100">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
            Users and Roles
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Central user management, role permissions, and account access control.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[28px] border-[4px] border-dark bg-blue-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Total Users</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{totalUsers.toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-emerald-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Active Roles</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">3</p>
            <p className="text-[10px] font-black text-dark/50 mt-2 uppercase tracking-wider">Students, Parents, Tutors</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-amber-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <KeyRound className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Pending Approvals</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{dashboard.pendingTutorApprovals}</p>
            <p className="text-[10px] font-black text-dark/50 mt-2 uppercase tracking-wider">Tutor profiles waiting</p>
          </div>
        </div>
      </div>

      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-6 border-b-[4px] border-dark bg-rose-100 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-dark tracking-tight">Recent User Signups</h2>
          <Link
            href="/dash/admin/users?export=csv"
            className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-4 py-2 inline-flex items-center"
          >
            Export CSV
          </Link>
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          {dashboard.recentSignups.length === 0 ? (
             <p className="text-sm font-bold text-dark/50">No recent users.</p>
          ) : (
            dashboard.recentSignups.map((row) => (
              <div key={row.id} className="flex items-center justify-between rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                <div>
                  <p className="font-black text-lg text-dark">{row.fullName || row.email}</p>
                  <p className="text-sm font-bold text-dark/60 mt-1">Role: <span className="uppercase text-[10px] tracking-wider font-black bg-dark text-white px-2 py-0.5 rounded ml-1">{row.role}</span></p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center justify-center bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border-[2px] border-dark">Active</span>
                  <p className="text-xs font-bold text-dark/50 mt-2">Joined {formatDate(row.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
