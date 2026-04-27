import Link from 'next/link';
import { getStudentDashboardData, requireAppViewer } from '@/lib/app-context';

const formatPercent = (value: string | null) => {
  const numeric = Number.parseFloat(value ?? '0');
  if (!Number.isFinite(numeric) || numeric <= 0) return '--';
  return `${Math.round(numeric)}%`;
};

const chartWidth = (value: string | null) => {
  const numeric = Number.parseFloat(value ?? '0');
  if (!Number.isFinite(numeric)) return 10;
  return Math.max(10, Math.min(100, Math.round(numeric)));
};

export default async function AnalyticsPage() {
  const viewer = await requireAppViewer();
  let dashboard;

  try {
    dashboard = await getStudentDashboardData(viewer.accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load performance analytics.';
    return (
      <div className="max-w-5xl mx-auto bg-white border-[4px] border-dark rounded-[28px] p-10 shadow-[10px_10px_0px_#060E1C]">
        <h1 className="text-3xl font-heading font-black text-dark mb-4">Performance analytics unavailable</h1>
        <p className="text-sm text-dark/70 font-semibold normal-case mb-6">{message}</p>
        <Link
          href="/dash/student"
          className="inline-flex items-center justify-center px-6 py-3 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#060E1C]"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const recentProgress = dashboard.progress.slice(0, 6);
  const averageScore = formatPercent(dashboard.stats.averageScore);
  const completionRate = formatPercent(dashboard.stats.assignmentCompletionRate);
  const attendanceRate = formatPercent(dashboard.stats.attendanceRate);

  return (
    <div className="space-y-8 max-w-[1320px]">
      <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-8">
        <h1 className="text-4xl font-heading tracking-tight text-dark">Performance Analytics</h1>
        <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
          Monitor score trends, completion consistency, and attendance impact.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Score Trend" value={averageScore} />
        <MetricCard label="Completion Trend" value={completionRate} />
        <MetricCard label="Attendance Trend" value={attendanceRate} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6 xl:col-span-2">
          <h2 className="text-2xl font-black text-dark">Trend by Snapshot</h2>
          <div className="mt-4 space-y-3">
            {recentProgress.length > 0 ? (
              recentProgress.map((entry) => (
                <article key={entry.id} className="border-[3px] border-dark rounded-2xl bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-dark">{entry.subjectName ?? 'Overall'}</p>
                    <p className="text-xs text-dark/60 font-semibold">
                      {new Date(entry.snapshotDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-3 space-y-2">
                    <Bar label="Score" value={entry.averageScore} />
                    <Bar label="Attendance" value={entry.attendanceRate} />
                    <Bar label="Task Completion" value={entry.assignmentCompletionRate} />
                  </div>
                </article>
              ))
            ) : (
              <div className="border-[3px] border-dashed border-dark/30 rounded-2xl p-6 text-sm normal-case text-dark/60">
                No performance snapshots are available yet.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">Target Tracker</h2>
            <div className="mt-4 space-y-3">
              <Row label="Current Score" value={averageScore} />
              <Row label="Target Score" value={dashboard.stats.averageScore ? `${Math.min(100, Number(dashboard.stats.averageScore) + 8).toFixed(0)}%` : '75%'} />
              <Row label="Pending Tasks" value={String(dashboard.stats.pendingAssignments)} />
            </div>
          </section>
          <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">Action Plan</h2>
            <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
              Improve weak-topic scores with timed drills and revise tutor notes after each attempt.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <Link
                href="/dash/student/exam-prep"
                className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest"
              >
                Open Drill Center
              </Link>
              <Link
                href="/dash/student/tracker"
                className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-white text-dark font-black uppercase text-xs tracking-widest"
              >
                View Mastery
              </Link>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-[4px] border-dark bg-white rounded-[24px] shadow-[6px_6px_0px_#060E1C] p-5">
      <p className="text-[11px] tracking-[0.25em] text-dark/40">{label}</p>
      <p className="mt-3 text-3xl font-black text-dark">{value}</p>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-dark/70">
        <span>{label}</span>
        <span>{formatPercent(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-slate-900" style={{ width: `${chartWidth(value)}%` }} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border-[2px] border-dark bg-white px-3 py-2">
      <span className="text-[11px] tracking-[0.2em] text-dark/50">{label}</span>
      <span className="text-sm font-black text-dark">{value}</span>
    </div>
  );
}

