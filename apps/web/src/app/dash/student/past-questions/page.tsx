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
      <div className="max-w-5xl mx-auto bg-white border-[4px] border-dark rounded-[28px] p-10 shadow-[10px_10px_0px_#060E1C]">
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
    <div className="space-y-6 sm:space-y-8 w-full min-w-0 max-w-[1320px] mx-auto pb-20">
      <section className="border-[3px] sm:border-[4px] border-dark bg-white rounded-[20px] sm:rounded-[28px] shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] p-5 sm:p-8 min-w-0">
        <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-dark break-words">Revision Hub</h1>
        <p className="mt-2 sm:mt-3 text-sm normal-case text-dark/70 font-semibold break-words">
          Focused revision by subject, with topic-level recommendations and practice flow.
        </p>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-w-0">
        <section className="border-[3px] sm:border-[4px] border-dark bg-off-white rounded-[20px] sm:rounded-[28px] shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] p-5 sm:p-6 xl:col-span-2 min-w-0">
          <h2 className="text-xl sm:text-2xl font-black text-dark break-words">Topic Revision Plan</h2>
          <div className="mt-4 space-y-3 min-w-0">
            {revisionSubjects.length > 0 ? (
              revisionSubjects.map((entry) => (
                <article key={entry.id} className="border-[2px] sm:border-[3px] border-dark rounded-2xl bg-white p-4 min-w-0">
                  <p className="text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] text-dark/40 truncate">{entry.subjectName ?? 'General'}</p>
                  <h3 className="text-base sm:text-lg font-black text-dark break-words">Revision Quest</h3>
                  <p className="text-xs sm:text-sm normal-case text-dark/70 font-semibold break-words">
                    Score {formatPercent(entry.averageScore)} | Completion {formatPercent(entry.assignmentCompletionRate)}
                  </p>
                  <p className="mt-2 text-xs sm:text-sm normal-case text-dark/70 font-semibold break-words">
                    {entry.masteryNotes ?? 'Revise weak sub-topics and run one timed drill.'}
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                    <Link
                      href="/dash/student/exam-prep"
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 sm:py-2 border-[2px] border-dark bg-yellow text-dark font-black uppercase text-[10px] tracking-widest text-center"
                    >
                      Start Drill
                    </Link>
                    <Link
                      href="/dash/student/notes"
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 sm:py-2 border-[2px] border-dark bg-white text-dark font-black uppercase text-[10px] tracking-widest text-center"
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

        <section className="space-y-6 min-w-0">
          <section className="border-[3px] sm:border-[4px] border-dark bg-white rounded-[20px] sm:rounded-[28px] shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] p-5 sm:p-6 min-w-0">
            <h2 className="text-xl sm:text-2xl font-black text-dark break-words">Revision Targets</h2>
            <div className="mt-4 space-y-2 min-w-0">
              <Tile label="Assignments pending" value={String(dashboard.stats.pendingAssignments)} />
              <Tile label="Completed assignments" value={String(dashboard.stats.completedAssignments)} />
              <Tile label="Current score" value={formatPercent(dashboard.stats.averageScore)} />
            </div>
          </section>
          <section className="border-[3px] sm:border-[4px] border-dark bg-off-white rounded-[20px] sm:rounded-[28px] shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] p-5 sm:p-6 min-w-0">
            <h2 className="text-xl sm:text-2xl font-black text-dark break-words">Next Steps</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 min-w-0">
              <Link
                href="/dash/student/exam-prep"
                className="w-full inline-flex items-center justify-center px-4 py-3 sm:py-2.5 border-[2px] sm:border-[3px] border-dark bg-yellow text-dark font-black uppercase text-[10px] sm:text-xs tracking-widest text-center"
              >
                Test & Drill Center
              </Link>
              <Link
                href="/dash/student/analytics"
                className="w-full inline-flex items-center justify-center px-4 py-3 sm:py-2.5 border-[2px] sm:border-[3px] border-dark bg-white text-dark font-black uppercase text-[10px] sm:text-xs tracking-widest text-center"
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
    <div className="flex items-center justify-between gap-2 rounded-xl border-[2px] border-dark bg-off-white px-3 py-2 min-w-0">
      <span className="text-[10px] sm:text-[11px] tracking-[0.1em] sm:tracking-[0.2em] text-dark/50 truncate min-w-0">{label}</span>
      <span className="text-xs sm:text-sm font-black text-dark shrink-0">{value}</span>
    </div>
  );
}

