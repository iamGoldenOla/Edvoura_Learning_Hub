'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BarChart3, BookOpenCheck, Flame, Medal, Trophy, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ParentChild = {
  userId: string;
  fullName: string | null;
  gradeLevelName: string;
};

type SubjectReport = {
  subject: string;
  score: number;
  tutorFeedback: string;
  assignmentsDue: number;
  assignmentsSubmitted: number;
};

const buildReports = (seed: number): SubjectReport[] => [
  {
    subject: 'Mathematics',
    score: 68 + (seed % 25),
    tutorFeedback: 'Improving steadily. Focus on multi-step problem solving.',
    assignmentsDue: 3,
    assignmentsSubmitted: 2,
  },
  {
    subject: 'English',
    score: 64 + ((seed * 2) % 29),
    tutorFeedback: 'Good vocabulary growth. Continue weekly writing drills.',
    assignmentsDue: 2,
    assignmentsSubmitted: 2,
  },
  {
    subject: 'Science',
    score: 62 + ((seed * 3) % 31),
    tutorFeedback: 'Practical work is strong. More revision needed on theory.',
    assignmentsDue: 4,
    assignmentsSubmitted: 3,
  },
];

export default function ParentReportsClient({ linkedChildren }: { linkedChildren: ParentChild[] }) {
  const [activeChildId, setActiveChildId] = useState<string>(linkedChildren[0]?.userId ?? '');
  const activeChild = useMemo(
    () => linkedChildren.find((child) => child.userId === activeChildId) ?? linkedChildren[0] ?? null,
    [linkedChildren, activeChildId],
  );
  const activeIndex = Math.max(0, linkedChildren.findIndex((child) => child.userId === activeChild?.userId));

  const reports = useMemo(() => buildReports(activeIndex + 3), [activeIndex]);
  const averageScore = Math.round(reports.reduce((sum, report) => sum + report.score, 0) / Math.max(reports.length, 1));
  const totalDue = reports.reduce((sum, report) => sum + report.assignmentsDue, 0);
  const totalSubmitted = reports.reduce((sum, report) => sum + report.assignmentsSubmitted, 0);
  const completionRate = totalDue > 0 ? Math.round((totalSubmitted / totalDue) * 100) : 0;
  const xp = 980 + activeIndex * 120;
  const streak = 6 + (activeIndex % 5);
  const badges = 9 + (activeIndex % 4);

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-6 sm:p-8 pb-20">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-sky-100">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
            Homework & Progress
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Review assignments, grades, tutor feedback, and engagement progress for each child.
          </p>
        </div>
        <div className="p-6 bg-off-white flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
            <Users className="h-4 w-4" />
            Switch Child
          </span>
          {linkedChildren.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {linkedChildren.map((child) => (
                <button
                  key={child.userId}
                  type="button"
                  onClick={() => setActiveChildId(child.userId)}
                  className={`rounded-xl border-[3px] px-4 py-2 text-sm font-black transition-all hover:translate-x-[1px] hover:translate-y-[1px] ${
                    activeChild?.userId === child.userId
                      ? 'border-dark bg-dark text-white shadow-[3px_3px_0px_#060E1C] hover:shadow-none'
                      : 'border-dark bg-white text-dark shadow-[3px_3px_0px_#060E1C] hover:shadow-none'
                  }`}
                >
                  {child.fullName ?? 'Unnamed Child'}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs font-bold text-dark/60">No child profiles linked yet.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-[28px] border-[4px] border-dark bg-emerald-100 p-6 shadow-[6px_6px_0px_#060E1C]">
          <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Average Score</p>
          <p className="mt-2 text-4xl font-black text-dark">{averageScore}%</p>
        </div>
        <div className="rounded-[28px] border-[4px] border-dark bg-yellow p-6 shadow-[6px_6px_0px_#060E1C]">
          <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Assignments Submitted</p>
          <p className="mt-2 text-4xl font-black text-dark">
            {totalSubmitted}/{totalDue}
          </p>
        </div>
        <div className="rounded-[28px] border-[4px] border-dark bg-blue-100 p-6 shadow-[6px_6px_0px_#060E1C]">
          <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Completion Rate</p>
          <p className="mt-2 text-4xl font-black text-dark">{completionRate}%</p>
        </div>
        <div className="rounded-[28px] border-[4px] border-dark bg-amber-100 p-6 shadow-[6px_6px_0px_#060E1C]">
          <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Engagement Streak</p>
          <p className="mt-2 text-4xl font-black text-dark">{streak} days</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Grades and Tutor Feedback */}
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-rose-100 flex items-center gap-3">
            <BookOpenCheck className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">Grades & Tutor Feedback</h2>
          </div>
          <div className="p-6 sm:p-8 space-y-4">
            {reports.map((report) => (
              <div key={report.subject} className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#060E1C]">
                <div className="flex items-center justify-between border-b-[3px] border-dark/10 pb-3 mb-3">
                  <p className="text-xl font-black text-dark">{report.subject}</p>
                  <span className={`inline-block rounded-xl border-[2px] border-dark px-3 py-1 text-sm font-black shadow-[2px_2px_0px_#060E1C] ${report.score >= 80 ? 'bg-emerald-100' : report.score >= 60 ? 'bg-amber-100' : 'bg-rose-100'}`}>
                    {report.score}%
                  </span>
                </div>
                <p className="text-sm font-bold text-dark/80 leading-relaxed">{report.tutorFeedback}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards & Engagement */}
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden flex flex-col">
          <div className="p-6 border-b-[4px] border-dark bg-yellow/20 flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">Rewards & Engagement</h2>
          </div>
          <div className="p-6 sm:p-8 flex flex-col flex-1 gap-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl border-[3px] border-dark bg-purple-100 p-5 text-center shadow-[4px_4px_0px_#060E1C]">
                <Trophy className="mx-auto h-6 w-6 text-dark" />
                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-dark/60">XP</p>
                <p className="mt-1 text-2xl font-black text-dark">{xp}</p>
              </div>
              <div className="rounded-2xl border-[3px] border-dark bg-sky-100 p-5 text-center shadow-[4px_4px_0px_#060E1C]">
                <Medal className="mx-auto h-6 w-6 text-dark" />
                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-dark/60">Badges</p>
                <p className="mt-1 text-2xl font-black text-dark">{badges}</p>
              </div>
              <div className="rounded-2xl border-[3px] border-dark bg-rose-100 p-5 text-center shadow-[4px_4px_0px_#060E1C]">
                <Flame className="mx-auto h-6 w-6 text-dark" />
                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-dark/60">Streak</p>
                <p className="mt-1 text-2xl font-black text-dark">{streak}</p>
              </div>
            </div>
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-6 shadow-[4px_4px_0px_#060E1C] mt-auto">
              <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Achievement Progress</p>
              <div className="mt-3 h-4 w-full rounded-full border-[3px] border-dark bg-white overflow-hidden shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)]">
                <div className="h-full bg-emerald-400 border-r-[3px] border-dark" style={{ width: `${Math.min(98, completionRate + 12)}%` }} />
              </div>
              <p className="mt-2 text-xs font-bold text-dark/70 text-right">{Math.min(98, completionRate + 12)}% milestone</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-6 border-t-[4px] border-dark/10">
        <Link href="/dash/parent/messages">
          <Button className="bg-yellow border-[3px] border-dark !text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 h-auto text-base">
            Message Tutor About Report
          </Button>
        </Link>
        <Link href="/dash/parent/billing">
          <Button className="bg-white border-[3px] border-dark !text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 h-auto text-base">
            Open Billing and Subscription
          </Button>
        </Link>
      </div>
    </div>
  );
}
