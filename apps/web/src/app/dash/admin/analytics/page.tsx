import Link from 'next/link';
import { Activity, BarChart3, ChartSpline, Users } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { getAdminDashboardData } from '@/lib/app-context';

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const dashboard = await getAdminDashboardData();

  // Basic real-time analytics
  const [{ data: averageProgressData }, { data: paidInvoices = [] }] = await Promise.all([
    supabase.from('progress_snapshots').select('average_score, attendance_rate, assignment_completion_rate').limit(100),
    supabase.schema('billing').from('invoices').select('amount_paid_minor').eq('status', 'paid'),
  ]);

  let avgAttendance = 0;
  let avgCompletion = 0;
  const progressRows = averageProgressData ?? [];
  const totalRevenueMinor = (paidInvoices ?? []).reduce((sum, row) => sum + (row.amount_paid_minor ?? 0), 0);

  if (progressRows.length > 0) {
    avgAttendance = progressRows.reduce((acc, row) => acc + (Number(row.attendance_rate) || 0), 0) / progressRows.length;
    avgCompletion = progressRows.reduce((acc, row) => acc + (Number(row.assignment_completion_rate) || 0), 0) / progressRows.length;
  }

  return (
    <div className="mx-auto max-w-[1680px] space-y-10 p-6 sm:p-8 pb-24">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-yellow">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
            Reports and Analytics
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Cross-platform visibility for academics, engagement, billing, and operations.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border-[4px] border-dark bg-emerald-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Active Learners</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{dashboard.totalStudents}</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-sky-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Avg. Attendance</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{avgAttendance.toFixed(1)}%</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-purple-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <ChartSpline className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Avg. Completion</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{avgCompletion.toFixed(1)}%</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-rose-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Paid Revenue</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">NGN {(totalRevenueMinor / 100).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-6 border-b-[4px] border-dark bg-amber-100 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-dark tracking-tight">Exportable Reports</h2>
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">Learner-band performance report</div>
          <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">Tutor delivery quality and response SLAs</div>
          <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">Parent engagement and notification outcomes</div>
          <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">Gamification health: XP, badges, streaks, challenges</div>

          <div className="pt-6 border-t-[4px] border-dark/10 flex">
            <Link href="/dash/admin/notifications?action=schedule-weekly-digest" className="bg-dark border-[3px] border-dark text-white font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 inline-flex items-center">
              Schedule Weekly Digest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
