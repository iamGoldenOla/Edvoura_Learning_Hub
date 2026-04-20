import Link from 'next/link';
import { getStudentDashboardData, requireAppViewer } from '@/lib/app-context';

export default async function StreakPage() {
  const viewer = await requireAppViewer();
  let dashboard;

  try {
    dashboard = await getStudentDashboardData(viewer.accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load streaks.';
    return (
      <div className="max-w-3xl mx-auto bg-white border-[4px] border-dark rounded-[28px] p-10 shadow-[10px_10px_0px_#060E1C]">
        <h1 className="text-3xl font-heading font-black text-dark mb-4">Streaks unavailable</h1>
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

  const dailyStudyStreak = Math.max(1, dashboard.progress.length);
  const homeworkStreak = Math.max(1, dashboard.stats.completedAssignments);
  const challengeStreak = Math.max(1, dashboard.stats.upcomingLessons);

  return (
    <div className="space-y-8 max-w-[1320px]">
      <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-8">
        <h1 className="text-4xl font-heading tracking-tight text-dark">My Streaks</h1>
        <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
          Keep your learning consistency strong with daily study and task streaks.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StreakTile label="Daily Study Streak" value={`${dailyStudyStreak} days`} />
        <StreakTile label="Homework Streak" value={`${homeworkStreak} tasks`} />
        <StreakTile label="Challenge Streak" value={`${challengeStreak} rounds`} />
      </div>

      <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
        <h2 className="text-2xl font-black text-dark">Consistency Guidance</h2>
        <div className="mt-4 space-y-3">
          <article className="border-[3px] border-dark rounded-2xl bg-white p-4 text-sm font-semibold text-dark">
            Complete one assignment today to protect your streak.
          </article>
          <article className="border-[3px] border-dark rounded-2xl bg-white p-4 text-sm font-semibold text-dark">
            Join your next class on time to increase consistency score.
          </article>
          <article className="border-[3px] border-dark rounded-2xl bg-white p-4 text-sm font-semibold text-dark">
            Practice at least one drill to keep momentum.
          </article>
        </div>
      </section>
    </div>
  );
}

function StreakTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-[4px] border-dark bg-white rounded-[24px] shadow-[6px_6px_0px_#060E1C] p-5">
      <p className="text-[11px] tracking-[0.25em] text-dark/40">{label}</p>
      <p className="mt-3 text-3xl font-black text-dark">{value}</p>
    </div>
  );
}

