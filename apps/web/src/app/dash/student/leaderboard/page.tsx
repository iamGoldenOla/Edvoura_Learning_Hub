import Link from 'next/link';
import { getStudentDashboardData, requireAppViewer } from '@/lib/app-context';

export default async function LeaderboardPage() {
  const viewer = await requireAppViewer();
  let dashboard;

  try {
    dashboard = await getStudentDashboardData(viewer.accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load leaderboard.';
    return (
      <div className="max-w-3xl mx-auto bg-white border-[4px] border-dark rounded-[28px] p-10 shadow-[10px_10px_0px_#060E1C]">
        <h1 className="text-3xl font-heading font-black text-dark mb-4">Leaderboard unavailable</h1>
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

  const xp = dashboard.stats.completedAssignments * 20 + dashboard.progress.length * 10;

  return (
    <div className="space-y-8 max-w-[1320px]">
      <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-8">
        <h1 className="text-4xl font-heading tracking-tight text-dark">Leaderboard</h1>
        <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
          Class ranking snapshot and XP progress in a safe, supportive format.
        </p>
      </section>

      <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
        <h2 className="text-2xl font-black text-dark">Current Snapshot</h2>
        <div className="mt-4 border-[3px] border-dark rounded-2xl bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-base font-black text-dark">{dashboard.profile.fullName ?? 'You'}</p>
            <p className="text-sm font-black text-dark">{xp} XP</p>
          </div>
          <p className="mt-2 text-sm normal-case text-dark/70 font-semibold">
            Ranking feed sync is enabled; expanded class ranking can be connected when peer rank API is available.
          </p>
        </div>
      </section>

      <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
        <h2 className="text-2xl font-black text-dark">How to Move Up</h2>
        <div className="mt-4 space-y-3">
          <article className="border-[3px] border-dark rounded-2xl bg-off-white p-4 text-sm font-semibold text-dark">
            Submit pending assignments on time.
          </article>
          <article className="border-[3px] border-dark rounded-2xl bg-off-white p-4 text-sm font-semibold text-dark">
            Join lessons consistently and complete drills.
          </article>
          <article className="border-[3px] border-dark rounded-2xl bg-off-white p-4 text-sm font-semibold text-dark">
            Improve weekly score trend in Performance Analytics.
          </article>
        </div>
      </section>
    </div>
  );
}

