'use client';

import Link from 'next/link';
import type { StudentDashboardData } from '@/lib/app-context';
import type { LearnerBand } from '@/components/dashboards/BandContext';
import { useBand } from '@/components/dashboards/BandContext';
import Grade13MiniGameLab from '@/components/dashboards/Grade13MiniGameLab';

const grade46Challenges = [
  {
    title: 'Vocabulary Challenge',
    description: 'Grow retention with weekly word missions.',
    launchHref: '/dash/student/quiz',
  },
  {
    title: 'Quiz Duel',
    description: 'Compete in challenge mode and build confidence.',
    launchHref: '/dash/student/quiz',
  },
  {
    title: 'Math Challenge Arena',
    description: 'Short timed rounds for speed and accuracy.',
    launchHref: '/dash/student/exam-prep',
  },
  {
    title: 'Subject Challenge Games',
    description: 'Science and social studies revision battles.',
    launchHref: '/dash/student/past-questions',
  },
  {
    title: 'Spelling Bee Ladder',
    description: 'Practice and challenge rounds with score tracking.',
    launchHref: '/dash/student/quiz',
  },
];

export default function StudentGamesClient({
  dashboard,
  fallbackBand,
}: {
  dashboard: StudentDashboardData;
  fallbackBand: LearnerBand;
}) {
  const { band } = useBand();
  const activeBand = band ?? fallbackBand;
  const xp = dashboard.stats.completedAssignments * 20 + dashboard.progress.length * 8;
  const streak = Math.max(1, dashboard.progress.length);
  const wins = dashboard.assignments.filter(
    (assignment) =>
      assignment.submissionStatus === 'graded' || assignment.submissionStatus === 'returned',
  ).length;

  if (activeBand === '1-3') {
    return (
      <div className="space-y-8 max-w-[1320px]">
        <div className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-8">
          <h1 className="text-4xl font-heading tracking-tight text-dark">Play and Learn</h1>
          <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
            Short and rewarding games for literacy, numeracy, and matching skills.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6 xl:col-span-3">
            <h2 className="text-2xl font-black text-dark">Game Tiles</h2>
            <div className="mt-5">
              <Grade13MiniGameLab />
            </div>
          </section>

          <section className="space-y-6">
            <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
              <h2 className="text-2xl font-black text-dark">Rewards</h2>
              <div className="mt-4 space-y-3">
                <InfoRow label="XP" value={String(xp)} />
                <InfoRow label="Stars" value={String(dashboard.stats.completedAssignments * 8)} />
                <InfoRow label="Streak" value={`${streak} days`} />
              </div>
              <p className="mt-4 text-xs normal-case text-dark/60 font-semibold">
                Complete a game and a lesson to unlock more stickers.
              </p>
            </section>

            <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
              <h2 className="text-2xl font-black text-dark">Quick Actions</h2>
              <div className="mt-4 grid grid-cols-1 gap-2">
                <Link
                  href="/dash/student/quiz"
                  className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest"
                >
                  Open Spelling Bee
                </Link>
                <Link
                  href="/dash/student/assignments"
                  className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-white text-dark font-black uppercase text-xs tracking-widest"
                >
                  Open Homework
                </Link>
              </div>
            </section>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1320px]">
      <div className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-8">
        <h1 className="text-4xl font-heading tracking-tight text-dark">Challenges and Games</h1>
        <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
          Structured, challenge-driven activities for Grades 4 to 6 with clear academic progress signals.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6 xl:col-span-2">
          <h2 className="text-2xl font-black text-dark">Challenge Launch</h2>
          <div className="mt-5 space-y-4">
            {grade46Challenges.map((challenge) => (
              <article key={challenge.title} className="border-[3px] border-dark rounded-2xl bg-white p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-black text-dark">{challenge.title}</h3>
                    <p className="text-sm normal-case text-dark/70 font-semibold">{challenge.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={challenge.launchHref}
                      className="inline-flex items-center justify-center px-4 py-2 border-[2px] border-dark bg-yellow text-dark font-black uppercase text-[10px] tracking-widest"
                    >
                      Launch
                    </Link>
                    <Link
                      href="/dash/student/quiz"
                      className="inline-flex items-center justify-center px-4 py-2 border-[2px] border-dark bg-white text-dark font-black uppercase text-[10px] tracking-widest"
                    >
                      View Quiz Link
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">My Streaks</h2>
            <div className="mt-4 space-y-3">
              <InfoRow label="Daily Learning" value={`${streak} days`} />
              <InfoRow label="Challenge Completion" value={String(wins)} />
              <InfoRow label="XP" value={String(xp)} />
            </div>
          </section>

          <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">Leaderboard</h2>
            <div className="mt-4 space-y-3">
              <InfoRow label="XP Rank Snapshot" value="Syncing" />
              <InfoRow label="Weekly Challenge" value={wins > 0 ? `${wins} completed` : 'No result yet'} />
              <InfoRow
                label="Spelling Bee"
                value={dashboard.stats.averageScore ? `${Number(dashboard.stats.averageScore).toFixed(0)}%` : '--'}
              />
            </div>
            <p className="mt-4 text-xs normal-case text-dark/60 font-semibold">
              Full class rankings will show here when leaderboard feed is connected.
            </p>
          </section>
        </section>
      </div>
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
