import Link from 'next/link';
import { getStudentDashboardData, requireAppViewer } from '@/lib/app-context';

const toPercent = (value: string | null) => {
  const numeric = Number.parseFloat(value ?? '0');
  if (!Number.isFinite(numeric) || numeric <= 0) return '--';
  return `${Math.round(numeric)}%`;
};

const safeWidth = (value: string | null) => {
  const numeric = Number.parseFloat(value ?? '0');
  if (!Number.isFinite(numeric)) return 8;
  return Math.max(8, Math.min(100, Math.round(numeric)));
};

export default async function TrackerPage() {
  const viewer = await requireAppViewer();
  let dashboard;

  try {
    dashboard = await getStudentDashboardData(viewer.accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load subject mastery.';
    return (
      <div className="max-w-5xl mx-auto bg-white border-[4px] border-dark rounded-[28px] p-10 shadow-[10px_10px_0px_#060E1C]">
        <h1 className="text-3xl font-heading font-black text-dark mb-4">Subject mastery unavailable</h1>
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

  const masteryEntries = dashboard.progress.slice(0, 8);
  const weakTopics = masteryEntries.filter((entry) => Number.parseFloat(entry.averageScore ?? '0') < 55);

  return (
    <div className="space-y-8 max-w-[1320px]">
      <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-8">
        <h1 className="text-4xl font-heading tracking-tight text-dark">Subject Mastery</h1>
        <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
          Track mastery by subject, detect weak topics, and prioritize focused revision.
        </p>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6 xl:col-span-2">
          <h2 className="text-2xl font-black text-dark">Mastery by Subject</h2>
          <div className="mt-4 space-y-3">
            {masteryEntries.length > 0 ? (
              masteryEntries.map((entry) => (
                <article key={entry.id} className="border-[3px] border-dark rounded-2xl bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-black text-dark">{entry.subjectName ?? 'General Studies'}</h3>
                    <span className="text-sm font-black text-dark">{toPercent(entry.averageScore)}</span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${safeWidth(entry.averageScore)}%` }}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <span className="rounded-md border-[2px] border-dark bg-off-white px-2 py-1">
                      Attendance {toPercent(entry.attendanceRate)}
                    </span>
                    <span className="rounded-md border-[2px] border-dark bg-off-white px-2 py-1">
                      Tasks {toPercent(entry.assignmentCompletionRate)}
                    </span>
                  </div>
                  {entry.masteryNotes ? (
                    <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">{entry.masteryNotes}</p>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="border-[3px] border-dashed border-dark/30 rounded-2xl p-6 text-sm normal-case text-dark/60">
                No mastery snapshot has been generated yet.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">Weak Topics</h2>
            <div className="mt-4 space-y-2">
              {weakTopics.length > 0 ? (
                weakTopics.map((entry) => (
                  <div key={entry.id} className="rounded-xl border-[2px] border-dark bg-off-white px-3 py-2">
                    <p className="text-sm font-black text-dark">{entry.subjectName ?? 'General'}</p>
                    <p className="text-xs text-dark/70 font-semibold">Confidence {toPercent(entry.averageScore)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm normal-case text-dark/70 font-semibold">
                  No weak-topic alert right now. Keep consistency.
                </p>
              )}
            </div>
          </section>

          <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">Focus Next</h2>
            <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
              Use the Test & Drill center for timed practice, then review notes for weaker topics.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <Link
                href="/dash/student/exam-prep"
                className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest"
              >
                Open Tests & Drills
              </Link>
              <Link
                href="/dash/student/notes"
                className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-white text-dark font-black uppercase text-xs tracking-widest"
              >
                Open Notes
              </Link>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

