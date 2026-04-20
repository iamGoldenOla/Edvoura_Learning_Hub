import Link from 'next/link';
import { getStudentDashboardData, gradeBandCodeToUiBand, requireAppViewer } from '@/lib/app-context';

const formatDate = (value: string | null) => {
  if (!value) return 'No due date';
  return new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default async function StudentQuizPage() {
  const viewer = await requireAppViewer();
  let dashboard;

  try {
    dashboard = await getStudentDashboardData(viewer.accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load quiz centre.';
    return (
      <div className="max-w-3xl mx-auto bg-white border-[4px] border-dark rounded-[28px] p-10 shadow-[10px_10px_0px_#060E1C]">
        <h1 className="text-3xl font-heading font-black text-dark mb-4">Quiz centre unavailable</h1>
        <p className="text-sm text-dark/70 font-semibold normal-case mb-6">{message}</p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/dash/student"
            className="inline-flex items-center justify-center px-6 py-3 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#060E1C]"
          >
            Back to Overview
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border-[3px] border-dark bg-white text-dark font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#060E1C]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const band = gradeBandCodeToUiBand(dashboard.profile.gradeBandCode);
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
  const recentProgress = dashboard.progress.slice(0, 4);

  if (band === '1-3') {
    return (
      <div className="space-y-8 max-w-[1320px]">
        <div className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-8">
          <h1 className="text-4xl font-heading tracking-tight text-dark">Spelling Bee and Quiz Time</h1>
          <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
            Practice simple words with audio-first support and easy launch actions.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6 xl:col-span-2">
            <h2 className="text-2xl font-black text-dark">Practice Cards</h2>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingAssignments.slice(0, 4).map((assignment) => (
                <article key={assignment.id} className="border-[3px] border-dark rounded-2xl bg-white p-5 space-y-3">
                  <p className="text-[11px] tracking-[0.25em] text-dark/40">{assignment.subjectName}</p>
                  <h3 className="text-lg font-black text-dark">{assignment.title}</h3>
                  <p className="text-sm normal-case text-dark/70 font-semibold">Due {formatDate(assignment.dueAt)}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/dash/student/assignments"
                      className="inline-flex items-center justify-center px-3 py-2 border-[2px] border-dark bg-yellow text-dark font-black uppercase text-[10px] tracking-widest"
                    >
                      Practice
                    </Link>
                    <Link
                      href="/dash/student/assignments"
                      className="inline-flex items-center justify-center px-3 py-2 border-[2px] border-dark bg-white text-dark font-black uppercase text-[10px] tracking-widest"
                    >
                      Play Audio
                    </Link>
                  </div>
                </article>
              ))}
              {pendingAssignments.length === 0 ? (
                <div className="md:col-span-2 border-[3px] border-dashed border-dark/30 rounded-2xl p-6 text-sm normal-case text-dark/60">
                  No active practice card right now. New quiz tasks will appear here.
                </div>
              ) : null}
            </div>
          </section>

          <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6 space-y-4">
            <h2 className="text-2xl font-black text-dark">My Snapshot</h2>
            <InfoRow label="Words Practiced" value={String(pendingAssignments.length * 3)} />
            <InfoRow label="Completed Quiz Tasks" value={String(gradedAssignments.length)} />
            <InfoRow
              label="Recent Score"
              value={dashboard.stats.averageScore ? `${Number(dashboard.stats.averageScore).toFixed(0)}%` : '--'}
            />
            <Link
              href="/dash/student/assignments"
              className="inline-flex w-full items-center justify-center px-4 py-3 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest"
            >
              Open Homework
            </Link>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1320px]">
      <div className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-8">
        <h1 className="text-4xl font-heading tracking-tight text-dark">Quiz Centre</h1>
        <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
          Active and completed work is now tied directly to your student dashboard records.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6 xl:col-span-2">
          <h2 className="text-2xl font-black text-dark">Today&apos;s Tasks</h2>
          <div className="mt-5 space-y-4">
            {pendingAssignments.length > 0 ? (
              pendingAssignments.slice(0, 6).map((assignment) => (
                <article key={assignment.id} className="border-[3px] border-dark rounded-2xl bg-white p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[11px] tracking-[0.25em] text-dark/40">{assignment.subjectName}</p>
                      <h3 className="text-xl font-black text-dark">{assignment.title}</h3>
                      <p className="text-sm normal-case text-dark/70 font-semibold">
                        Due {formatDate(assignment.dueAt)} | Status: {assignment.submissionStatus ?? 'pending'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/dash/student/assignments"
                        className="inline-flex items-center justify-center px-4 py-2 border-[2px] border-dark bg-yellow text-dark font-black uppercase text-[10px] tracking-widest"
                      >
                        Start Task
                      </Link>
                      <Link
                        href="/dash/student/assignments"
                        className="inline-flex items-center justify-center px-4 py-2 border-[2px] border-dark bg-white text-dark font-black uppercase text-[10px] tracking-widest"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="border-[3px] border-dashed border-dark/30 rounded-2xl p-6 text-sm normal-case text-dark/60">
                No pending quiz-style assignment is available right now.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">Spelling Bee</h2>
            <div className="mt-4 space-y-3">
              <InfoRow label="Words Practiced" value={String(pendingAssignments.length * 4)} />
              <InfoRow label="Recent Score" value={dashboard.stats.averageScore ? `${Number(dashboard.stats.averageScore).toFixed(0)}%` : '--'} />
              <InfoRow label="Completion Count" value={String(gradedAssignments.length)} />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <Link
                href="/dash/student/assignments"
                className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest"
              >
                Practice Mode
              </Link>
              <Link
                href="/dash/student/games"
                className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-white text-dark font-black uppercase text-xs tracking-widest"
              >
                Challenge Mode
              </Link>
            </div>
          </section>

          <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">Progress Snapshot</h2>
            <div className="mt-4 space-y-3">
              <InfoRow label="Average Score" value={dashboard.stats.averageScore ? `${Number(dashboard.stats.averageScore).toFixed(0)}%` : '--'} />
              <InfoRow label="Completed Assignments" value={String(dashboard.stats.completedAssignments)} />
              <InfoRow label="Pending Assignments" value={String(dashboard.stats.pendingAssignments)} />
            </div>
            <p className="mt-4 text-xs normal-case text-dark/60 font-semibold">
              Leaderboard and duel ranking will populate when challenge ranking service is connected.
            </p>
          </section>
        </section>
      </div>

      <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
        <h2 className="text-2xl font-black text-dark">Recent Performance History</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {recentProgress.length > 0 ? (
            recentProgress.map((entry) => (
              <article key={entry.id} className="border-[3px] border-dark rounded-2xl bg-off-white p-4">
                <p className="text-[11px] tracking-[0.25em] text-dark/40">{entry.subjectName ?? 'General'}</p>
                <p className="mt-2 text-sm font-black text-dark">
                  Score {entry.averageScore ? `${Number(entry.averageScore).toFixed(0)}%` : '--'}
                </p>
                <p className="text-xs normal-case text-dark/60 font-semibold">
                  {new Date(entry.snapshotDate).toLocaleDateString()}
                </p>
              </article>
            ))
          ) : (
            <div className="md:col-span-2 xl:col-span-4 border-[3px] border-dashed border-dark/30 rounded-2xl p-6 text-sm normal-case text-dark/60">
              No progress snapshots yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border-[2px] border-dark bg-white px-3 py-2">
      <span className="text-[11px] tracking-[0.2em] text-dark/50">{label}</span>
      <span className="text-sm font-black text-dark">{value}</span>
    </div>
  );
}

