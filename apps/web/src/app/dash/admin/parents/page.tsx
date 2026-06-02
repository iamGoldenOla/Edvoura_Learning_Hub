import Link from 'next/link';
import { Bell, CreditCard, Users } from 'lucide-react';
import { getAdminDashboardData } from '@/lib/app-context';
import { createClient } from '@/utils/supabase/server';
import ParentAccessToggle from '@/components/dashboards/ParentAccessToggle';

export default async function AdminParentsPage() {
  const dashboard = await getAdminDashboardData();
  const supabase = await createClient();

  const [
    { count: linkedParentsCount },
    { data: parentProfiles },
  ] = await Promise.all([
    supabase.from('parent_child_links').select('*', { count: 'exact', head: true }),
    supabase.from('parent_profiles').select(`
      user_id,
      portal_access_blocked,
      profiles (
        full_name,
        email
      )
    `),
  ]);

  const parentList = (parentProfiles ?? []).map((p: any) => ({
    userId: p.user_id,
    portalAccessBlocked: p.portal_access_blocked,
    fullName: p.profiles?.full_name || 'No Name',
    email: p.profiles?.email || 'No Email',
  }));

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-8 sm:space-y-10 p-4 sm:p-8 pb-24">
      <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-8 border-b-[4px] border-dark bg-sky-100">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
            Parent Management
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Manage parent accounts, child links, billing visibility, and engagement notifications.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-blue-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Active Parents</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{dashboard.totalParents.toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-rose-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Child Links</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{linkedParentsCount ?? 0}</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-emerald-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Billing Access</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">100%</p>
          </div>
        </div>
      </div>

      <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-6 border-b-[4px] border-dark bg-amber-100 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-dark tracking-tight">Actions</h2>
          <Link
            href="/dash/admin/parents?export=csv"
            className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-4 py-2 inline-flex items-center"
          >
            Export Directory
          </Link>
        </div>
        <div className="p-6 sm:p-8 flex flex-wrap gap-4">
          <Link href="/dash/admin/parents?action=link-manager" className="bg-dark border-[3px] border-dark text-white font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 inline-flex items-center">
            Open Parent Link Manager
          </Link>
          <Link href="/dash/admin/parents?action=resolve-link-conflicts" className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 inline-flex items-center">
            Resolve Child-Link Conflicts
          </Link>
          <Link href="/dash/admin/notifications?action=parent-broadcast" className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 inline-flex items-center">
            Send Parent Broadcast
          </Link>
        </div>
      </div>

      {/* Parent Directory Table */}
      <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-6 border-b-[4px] border-dark bg-sky-100 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-dark tracking-tight">Parent Directory & Access Control</h2>
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          {parentList.length === 0 ? (
             <p className="text-sm font-bold text-dark/50">No parent accounts registered.</p>
          ) : (
             parentList.map((parent: any) => (
               <div key={parent.userId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                 <div>
                   <p className="font-black text-lg text-dark">{parent.fullName}</p>
                   <p className="text-sm font-bold text-dark/60 mt-1">{parent.email}</p>
                 </div>
                 <div className="flex items-center gap-3 self-start sm:self-auto">
                   <span className={`inline-flex items-center justify-center text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border-[2px] border-dark ${
                     parent.portalAccessBlocked 
                       ? 'bg-rose-100 text-rose-800' 
                       : 'bg-emerald-100 text-emerald-800'
                   }`}>
                     {parent.portalAccessBlocked ? 'Suspended' : 'Active Access'}
                   </span>
                   <ParentAccessToggle userId={parent.userId} initialBlocked={parent.portalAccessBlocked} />
                 </div>
               </div>
             ))
          )}
        </div>
      </div>
    </div>
  );
}
