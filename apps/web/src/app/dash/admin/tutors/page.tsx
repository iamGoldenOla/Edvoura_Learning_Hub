import Link from 'next/link';
import { ShieldCheck, UserCheck, UserX } from 'lucide-react';
import AdminTutorQueueActions from '@/components/dashboards/AdminTutorQueueActions';
import { requireAdminAccess } from '../_lib/role-guard';
import { createClient } from '@/utils/supabase/server';
import { getAdminDashboardData } from '@/lib/app-context';

type PendingTutor = {
  userId: string;
  fullName: string | null;
  email: string;
  expertiseSummary: string | null;
  approvalStatus: string;
};

export default async function AdminTutorsApprovalsPage() {
  await requireAdminAccess();
  const supabase = await createClient();
  const dashboard = await getAdminDashboardData();

  let queue: PendingTutor[] = [];
  try {
    const { data: pendingTutors } = await supabase
      .from('tutor_profiles')
      .select('user_id, expertise_summary, approval_status')
      .in('approval_status', ['pending', 'submitted']);

    const normalizedTutors = pendingTutors ?? [];
    const userIds = normalizedTutors.map(t => t.user_id);

    const { data: profilesData } = userIds.length
      ? await supabase.from('profiles').select('id, full_name, email').in('id', userIds)
      : { data: [] as Array<{ id: string; full_name: string | null; email: string }> };

    const profileById = new Map((profilesData ?? []).map(p => [p.id, p]));

    queue = normalizedTutors.map(t => {
      const profile = profileById.get(t.user_id);
      return {
        userId: t.user_id,
        fullName: profile?.full_name ?? null,
        email: profile?.email ?? 'unknown@edvoura.com',
        expertiseSummary: t.expertise_summary,
        approvalStatus: t.approval_status,
      };
    });
  } catch {
    queue = [];
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-6 sm:p-8 pb-20">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-sky-100">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
            Tutors and Approvals
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Tutor approval workflow, quality assurance, and teaching compliance controls.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[28px] border-[4px] border-dark bg-emerald-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Approved Tutors</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{dashboard.totalTutors}</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-blue-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <UserCheck className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Pending Approvals</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{queue.length}</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-rose-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <UserX className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Suspended</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">0</p>
          </div>
        </div>
      </div>

      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-6 border-b-[4px] border-dark bg-amber-100 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-dark tracking-tight">Tutor Moderation Queue</h2>
          <Link
            href="/dash/admin/tutors?view=full-queue"
            className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-4 py-2 inline-flex items-center"
          >
            View Full Queue
          </Link>
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          {queue.length === 0 ? (
            <p className="text-sm font-bold text-dark/50">No pending tutor applications.</p>
          ) : null}
          {queue.map((item) => (
            <div key={item.userId} className="flex items-center justify-between rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
              <div>
                <p className="font-black text-lg text-dark">{item.fullName || item.email}</p>
                <p className="text-sm font-bold text-dark/60 mt-1">{item.expertiseSummary || 'Tutor application pending review'}</p>
              </div>
              <AdminTutorQueueActions userId={item.userId} fullName={item.fullName || item.email} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
