'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BarChart3, BookOpenCheck, Flame, Medal, Trophy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-edvoura-navy">Homework & Progress</h1>
        <p className="mt-2 text-sm text-slate-600">
          Review assignments, grades, tutor feedback, and engagement progress for each child.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {linkedChildren.length > 0 ? (
            linkedChildren.map((child) => (
              <button
                key={child.userId}
                type="button"
                onClick={() => setActiveChildId(child.userId)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                  activeChild?.userId === child.userId
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                {child.fullName ?? 'Unnamed Child'}
              </button>
            ))
          ) : (
            <p className="text-xs text-slate-600">No child profiles linked yet.</p>
          )}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Average Score</p>
            <p className="text-2xl font-bold text-slate-900">{averageScore}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Assignments Submitted</p>
            <p className="text-2xl font-bold text-slate-900">
              {totalSubmitted}/{totalDue}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Completion Rate</p>
            <p className="text-2xl font-bold text-slate-900">{completionRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Engagement Streak</p>
            <p className="text-2xl font-bold text-slate-900">{streak} days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4 text-slate-600" />
              Grades and Tutor Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reports.map((report) => (
              <div key={report.subject} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{report.subject}</p>
                  <span className="text-sm font-bold text-slate-900">{report.score}%</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">{report.tutorFeedback}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-600" />
              Rewards & Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                <Trophy className="mx-auto h-4 w-4 text-slate-600" />
                <p className="mt-1 text-xs text-slate-500">XP</p>
                <p className="font-bold text-slate-900">{xp}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                <Medal className="mx-auto h-4 w-4 text-slate-600" />
                <p className="mt-1 text-xs text-slate-500">Badges</p>
                <p className="font-bold text-slate-900">{badges}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                <Flame className="mx-auto h-4 w-4 text-slate-600" />
                <p className="mt-1 text-xs text-slate-500">Streak</p>
                <p className="font-bold text-slate-900">{streak}</p>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Achievement Progress</p>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min(98, completionRate + 12)}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-600">{Math.min(98, completionRate + 12)}% milestone completion</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/dash/parent/messages">
          <Button variant="primary" className="text-xs">
            Message Tutor About Report
          </Button>
        </Link>
        <Link href="/dash/parent/billing">
          <Button variant="outline" className="text-xs">
            Open Billing and Subscription
          </Button>
        </Link>
      </div>
    </div>
  );
}
