import Link from 'next/link';
import { ClipboardList, Eye, Lock, UserCog } from 'lucide-react';
import { requireSuperAdminAccess } from '../_lib/role-guard';

export default async function AdminAuditLogsPage() {
  await requireSuperAdminAccess();

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-6 sm:p-8 pb-20">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-purple-100">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
            Audit Logs
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Immutable operational history for users, permissions, and platform configuration changes.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[28px] border-[4px] border-dark bg-sky-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Events (24h)</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">0</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-amber-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <UserCog className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Role Changes</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">0</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-emerald-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <Lock className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Security Actions</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">0</p>
          </div>
        </div>
      </div>

      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-6 border-b-[4px] border-dark bg-rose-100 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-dark tracking-tight">Recent Events</h2>
          <Link
            href="/dash/admin/audit-logs?view=full"
            className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-4 py-2 inline-flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Full Trail
          </Link>
        </div>
        <div className="p-6 sm:p-8 space-y-4">
           <p className="text-sm font-bold text-dark/50">No audit events generated today.</p>
        </div>
      </div>
    </div>
  );
}
