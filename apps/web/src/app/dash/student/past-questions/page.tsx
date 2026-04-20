import Link from 'next/link';
import { getStudentDashboardData, requireAppViewer } from '@/lib/app-context';

const formatPercent = (value: string | null) => {
  const numeric = Number.parseFloat(value ?? '0');
  if (!Number.isFinite(numeric) || numeric <= 0) return '--';
  return `${Math.round(numeric)}%`;
};

export default async function PastQuestionsPage() {
  const viewer = await requireAppViewer();
  let dashboard;

  try {
    dashboard = await getStudentDashboardData(viewer.accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load revision hub.';
    return (
      <div className="max-w-3xl mx-auto bg-white border-[4px] border-dark rounded-[28px] p-10 shadow-[10px_10px_0px_#060E1C]">
        <h1 className="text-3xl font-heading font-black text-dark mb-4">Revision hub unavailable</h1>
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

  const revisionSubjects = dashboard.progress.slice(0, 8);

  return (
    <div className="space-y-8 max-w-[1320px]">
      <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-8">
        <h1 className="text-4xl font-heading tracking-tight text-dark">Revision Hub</h1>
        <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
          Focused revision by subject, with topic-level recommendations and practice flow.
        </p>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6 xl:col-span-2">
          <h2 className="text-2xl font-black text-dark">Topic Revision Plan</h2>
          <div className="mt-4 space-y-3">
            {revisionSubjects.length > 0 ? (
              revisionSubjects.map((entry) => (
                <article key={entry.id} className="border-[3px] border-dark rounded-2xl bg-white p-4">
                  <p className="text-[11px] tracking-[0.25em] text-dark/40">{entry.subjectName ?? 'General'}</p>
                  <h3 className="text-lg font-black text-dark">Revision Quest</h3>
                  <p className="text-sm normal-case text-dark/70 font-semibold">
                    Score {formatPercent(entry.averageScore)} | Completion {formatPercent(entry.assignmentCompletionRate)}
                  </p>
                  <p className="mt-2 text-sm normal-case text-dark/70 font-semibold">
                    {entry.masteryNotes ?? 'Revise weak sub-topics and run one timed drill.'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href="/dash/student/exam-prep"
                      className="inline-flex items-center justify-center px-3 py-2 border-[2px] border-dark bg-yellow text-dark font-black uppercase text-[10px] tracking-widest"
                    >
                      Start Drill
                    </Link>
                    <Link
                      href="/dash/student/notes"
                      className="inline-flex items-center justify-center px-3 py-2 border-[2px] border-dark bg-white text-dark font-black uppercase text-[10px] tracking-widest"
                    >
                      Open Notes
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="border-[3px] border-dashed border-dark/30 rounded-2xl p-6 text-sm normal-case text-dark/60">
                No revision recommendation available yet.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">Revision Targets</h2>
            <div className="mt-4 space-y-2">
              <Tile label="Assignments pending" value={String(dashboard.stats.pendingAssignments)} />
              <Tile label="Completed assignments" value={String(dashboard.stats.completedAssignments)} />
              <Tile label="Current score" value={formatPercent(dashboard.stats.averageScore)} />
            </div>
          </section>
          <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">Next Steps</h2>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <Link
                href="/dash/student/exam-prep"
                className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest"
              >
                Test & Drill Center
              </Link>
              <Link
                href="/dash/student/analytics"
                className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-white text-dark font-black uppercase text-xs tracking-widest"
              >
                Performance Analytics
              </Link>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border-[2px] border-dark bg-off-white px-3 py-2">
      <span className="text-[11px] tracking-[0.2em] text-dark/50">{label}</span>
      <span className="text-sm font-black text-dark">{value}</span>
    </div>
  );
}

