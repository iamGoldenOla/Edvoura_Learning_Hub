import Link from 'next/link';
import { getStudentDashboardData, requireAppViewer } from '@/lib/app-context';

const formatPercent = (value: string | null) => {
  const numeric = Number.parseFloat(value ?? '0');
  if (!Number.isFinite(numeric) || numeric <= 0) return '--';
  return `${Math.round(numeric)}%`;
};

export default async function BadgesPage() {
  const viewer = await requireAppViewer();
  let dashboard;

  try {
    dashboard = await getStudentDashboardData(viewer.accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load rewards and achievements.';
    return (
      <div className="max-w-5xl mx-auto bg-white border-[4px] border-dark rounded-[28px] p-10 shadow-[10px_10px_0px_#060E1C]">
        <h1 className="text-3xl font-heading font-black text-dark mb-4">Rewards unavailable</h1>
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

  const achievementRows = [
    { label: 'Mastery Milestones', value: String(dashboard.progress.length) },
    { label: 'Completed Assignments', value: String(dashboard.stats.completedAssignments) },
    { label: 'Average Performance', value: formatPercent(dashboard.stats.averageScore) },
    { label: 'Consistency Index', value: formatPercent(dashboard.stats.assignmentCompletionRate) },
  ];

  const recognitions = [
    `Completed ${dashboard.stats.completedAssignments} assignment(s)`,
    `Maintained ${dashboard.stats.activeClasses} active class engagement`,
    `Recorded ${dashboard.progress.length} progress snapshot(s)`,
  ];

  return (
    <div className="space-y-8 max-w-[1320px]">
      <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-8">
        <h1 className="text-4xl font-heading tracking-tight text-dark">Rewards and Achievements</h1>
        <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
          Performance-based recognitions for mastery, consistency, and academic improvement.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {achievementRows.map((item) => (
          <div key={item.label} className="border-[4px] border-dark bg-white rounded-[24px] shadow-[6px_6px_0px_#060E1C] p-5">
            <p className="text-[11px] tracking-[0.25em] text-dark/40">{item.label}</p>
            <p className="mt-3 text-3xl font-black text-dark">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6 xl:col-span-2">
          <h2 className="text-2xl font-black text-dark">Academic Achievement History</h2>
          <div className="mt-4 space-y-3">
            {recognitions.map((item) => (
              <article key={item} className="border-[3px] border-dark rounded-2xl bg-white p-4">
                <p className="text-sm font-black text-dark">{item}</p>
                <p className="text-xs text-dark/70 font-semibold mt-1">
                  Recorded as part of your current academic cycle.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">Next Milestone</h2>
            <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
              Complete upcoming tasks and maintain attendance to unlock higher mastery recognition.
            </p>
          </section>
          <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">Improve Faster</h2>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <Link
                href="/dash/student/exam-prep"
                className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest"
              >
                Open Test Center
              </Link>
              <Link
                href="/dash/student/analytics"
                className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-white text-dark font-black uppercase text-xs tracking-widest"
              >
                View Analytics
              </Link>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

