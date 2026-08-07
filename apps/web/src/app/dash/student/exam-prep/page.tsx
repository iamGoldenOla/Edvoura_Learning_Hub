import Link from 'next/link';
import { getStudentDashboardData, requireAppViewer } from '@/lib/app-context';

const formatPercent = (value: string | null) => {
  const numeric = Number.parseFloat(value ?? '0');
  if (!Number.isFinite(numeric) || numeric <= 0) return '--';
  return `${Math.round(numeric)}%`;
};

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'No due date';

export default async function ExamPrepPage() {
  const viewer = await requireAppViewer();
  let dashboard;

  try {
    dashboard = await getStudentDashboardData(viewer.accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load test and drill center.';
    return (
      <div className="max-w-5xl mx-auto bg-white border-[4px] border-dark rounded-[28px] p-10 shadow-[10px_10px_0px_#060E1C]">
        <h1 className="text-3xl font-heading font-black text-dark mb-4">Test & drill center unavailable</h1>
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

  const pendingAssignments = dashboard.assignments.filter(
    (assignment) =>
      !assignment.submissionStatus ||
      assignment.submissionStatus === 'draft' ||
      assignment.submissionStatus === 'submitted' ||
      assignment.submissionStatus === 'late',
  );
  const gradedAssignments = dashboard.assignments.filter(
    (assignment) =>
      assignment.submissionStatus === 'graded' || assignment.submissionStatus === 'returned',
  );
  const recentPerformance = dashboard.progress.slice(0, 4);

  return (
    <div className="space-y-8 max-w-[1320px]">
      <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading tracking-tight text-dark">Test and Drill Center</h1>
          <p className="mt-2 text-sm normal-case text-dark/70 font-semibold">
            Build exam readiness with timed drills, challenge sessions, and score-based feedback loops.
          </p>
        </div>
        <Link
          href="/dash/student"
          className="inline-flex items-center gap-2 rounded-xl border-[3px] border-dark bg-yellow px-4 py-2.5 text-xs font-black uppercase tracking-wider text-dark shadow-[3px_3px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all shrink-0"
        >
          ← Back to Dashboard
        </Link>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Kpi label="Active Drills" value={String(pendingAssignments.length)} />
        <Kpi label="Completed Drills" value={String(gradedAssignments.length)} />
        <Kpi label="Recent Score" value={formatPercent(dashboard.stats.averageScore)} />
        <Kpi label="Completion" value={formatPercent(dashboard.stats.assignmentCompletionRate)} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6 xl:col-span-2">
          <h2 className="text-2xl font-black text-dark">Timed Drill Queue</h2>
          <div className="mt-4 space-y-3">
            {pendingAssignments.length > 0 ? (
              pendingAssignments.slice(0, 6).map((assignment) => (
                <article key={assignment.id} className="border-[3px] border-dark rounded-2xl bg-white p-4">
                  <p className="text-[11px] tracking-[0.25em] text-dark/40">{assignment.subjectName}</p>
                  <h3 className="text-lg font-black text-dark">{assignment.title}</h3>
                  <p className="text-sm normal-case text-dark/70 font-semibold">Due {formatDate(assignment.dueAt)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href="/dash/student/assignments"
                      className="inline-flex items-center justify-center px-3 py-2 border-[2px] border-dark bg-yellow text-dark font-black uppercase text-[10px] tracking-widest"
                    >
                      Start Timed Drill
                    </Link>
                    <Link
                      href="/dash/student/assignments"
                      className="inline-flex items-center justify-center px-3 py-2 border-[2px] border-dark bg-white text-dark font-black uppercase text-[10px] tracking-widest"
                    >
                      Review Brief
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="border-[3px] border-dashed border-dark/30 rounded-2xl p-6 text-sm normal-case text-dark/60">
                No active drill is available right now.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">Challenge Mode</h2>
            <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
              Run exam-style sessions and compare against your most recent score trend.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <Link
                href="/dash/student/quiz"
                className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest"
              >
                Launch Challenge
              </Link>
              <Link
                href="/dash/student/past-questions"
                className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-white text-dark font-black uppercase text-xs tracking-widest"
              >
                Revision Hub
              </Link>
            </div>
          </section>

          <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">Recent Performance</h2>
            <div className="mt-4 space-y-2">
              {recentPerformance.length > 0 ? (
                recentPerformance.map((item) => (
                  <div key={item.id} className="rounded-xl border-[2px] border-dark bg-white p-3">
                    <p className="text-sm font-black text-dark">{item.subjectName ?? 'General'}</p>
                    <p className="text-xs text-dark/70 font-semibold mt-1">
                      Score {formatPercent(item.averageScore)} | Tasks {formatPercent(item.assignmentCompletionRate)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm normal-case text-dark/70 font-semibold">
                  Performance history will appear after completed drills.
                </p>
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-[4px] border-dark bg-white rounded-[24px] shadow-[6px_6px_0px_#060E1C] p-5">
      <p className="text-[11px] tracking-[0.25em] text-dark/40">{label}</p>
      <p className="mt-3 text-3xl font-black text-dark">{value}</p>
    </div>
  );
}

