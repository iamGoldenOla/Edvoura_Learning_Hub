'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Clock3, Target, TrendingUp, Video, Sparkles, Languages, BrainCircuit } from 'lucide-react';

import { useBand } from './BandContext';
import StudentLiveContentPanel from './StudentLiveContentPanel';
import type { BillingSummary, StudentDashboardData } from '@/lib/app-context';
import { getDailyWords } from '@/lib/daily-words';

const bandCopy = {
  '1-3': {
    label: 'Explorer Mode',
    subtitle: 'Simple daily learning steps.',
  },
  '4-6': {
    label: 'Mission Mode',
    subtitle: 'Focus on lessons, tasks, and steady progress.',
  },
  '7-12': {
    label: 'Performance Mode',
    subtitle: 'Stay organized and exam-ready with clear priorities.',
  },
} as const;

const formatPercent = (value: string | null) => {
  if (!value) return '--';
  return `${Number(value).toFixed(0)}%`;
};

const formatMoney = (amountMinor: number | null, currencyCode: string | null) => {
  if (amountMinor === null || !currencyCode) return 'Not set';

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amountMinor / 100);
};

const formatDateTime = (value: string | null) => {
  if (!value) return 'TBD';
  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const formatDate = (value: string | null) => {
  if (!value) return 'No due date';
  return new Date(value).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const countdownText = (startAt: string) => {
  const diffMs = new Date(startAt).getTime() - Date.now();

  if (diffMs <= 0) return 'Live now';

  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 60) return `${minutes}m to start`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m to start`;
};

const isPendingAssignment = (status: string | null) => {
  const normalized = (status ?? '').toLowerCase();
  return !normalized || normalized === 'draft' || normalized === 'submitted' || normalized === 'late';
};

export default function StudentBandClientWrapper({
  dashboard,
  billingSummary,
}: {
  dashboard: StudentDashboardData;
  billingSummary: BillingSummary;
}) {
  const { band } = useBand();
  const copy = bandCopy[band];

  const nextLesson = [...dashboard.upcomingLessons].sort(
    (left, right) => new Date(left.scheduledStartAt).getTime() - new Date(right.scheduledStartAt).getTime(),
  )[0];

  const pendingAssignments = dashboard.assignments
    .filter((assignment) => isPendingAssignment(assignment.submissionStatus))
    .sort((left, right) => {
      if (!left.dueAt) return 1;
      if (!right.dueAt) return -1;
      return new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime();
    })
    .slice(0, 5);
  const [uploadedSubmissions, setUploadedSubmissions] = useState<Record<string, string>>({});

  const dailyWords = getDailyWords(band, new Date().toISOString().split('T')[0]);

  const progressRows = dashboard.progress.slice(0, 4).map((entry) => ({
    id: entry.id,
    subject: entry.subjectName ?? 'General',
    value: Number(entry.averageScore ?? 0),
  }));

  const planName = billingSummary.subscription?.planName ?? billingSummary.plans[0]?.name ?? 'Not set';
  const planAmount = formatMoney(
    billingSummary.subscription?.planAmountMinor ?? billingSummary.plans[0]?.amountMinor ?? null,
    billingSummary.subscription?.planCurrencyCode ?? billingSummary.plans[0]?.currencyCode ?? null,
  );

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{copy.label}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Hello {dashboard.profile.fullName ?? 'Student'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{copy.subtitle}</p>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Upcoming lessons" value={String(dashboard.stats.upcomingLessons)} icon={Clock3} />
          <StatCard label="Pending tasks" value={String(dashboard.stats.pendingAssignments)} icon={CheckCircle2} />
          <StatCard label="Average score" value={formatPercent(dashboard.stats.averageScore)} icon={TrendingUp} />
          <StatCard label="Attendance" value={formatPercent(dashboard.stats.attendanceRate)} icon={Target} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <Panel title="Live from tutor" icon={Video}>
            <StudentLiveContentPanel />
          </Panel>

          <Panel title="Next lesson" icon={Video}>
            {nextLesson ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{nextLesson.title}</p>
                <p className="text-sm text-slate-600">
                  {nextLesson.subjectName} - {nextLesson.classTitle}
                </p>
                <p className="text-sm text-slate-600">{formatDateTime(nextLesson.scheduledStartAt)}</p>
                <p className="text-xs font-medium text-slate-500">{countdownText(nextLesson.scheduledStartAt)}</p>
                <div className="flex flex-wrap gap-2">
                  {nextLesson.joinUrl ? (
                    <a
                      href={nextLesson.joinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 shadow-sm animate-pulse"
                    >
                      Join Live Lesson Now
                    </a>
                  ) : (
                    <Link
                      href="/dash/student/live"
                      className="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                    >
                      Open live room
                    </Link>
                  )}
                  <Link
                    href="/dash/student/classes"
                    className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    View schedule
                  </Link>
                </div>
              </div>
            ) : (
              <EmptyState text="No upcoming lesson is scheduled yet." />
            )}
          </Panel>

          {/* New Daily Vocabulary Panel */}
          <Panel title="Daily Vocabulary" icon={Languages}>
            <div className="space-y-4">
              <p className="text-xs text-slate-600 italic">
                Master these 10 words today to boost your spelling score!
              </p>
              <div className="grid grid-cols-2 gap-2">
                {dailyWords.map((word, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                    <span className="text-[10px] font-bold text-slate-400">{idx + 1}.</span>
                    <span className="text-sm font-semibold text-slate-800">{word}</span>
                  </div>
                ))}
              </div>
              <Link 
                href="/dash/student/homework" 
                className="block text-center rounded-lg bg-blue-50 py-2 text-[10px] font-bold uppercase tracking-widest text-blue-700 hover:bg-blue-100 transition-colors"
              >
                Practice Spelling →
              </Link>
            </div>
          </Panel>

          <Panel title="Pending assignments" icon={BookOpen}>
            <div className="space-y-3">
              {pendingAssignments.length > 0 ? (
                pendingAssignments.map((assignment) => (
                  <article key={assignment.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                          {assignment.subjectName}
                        </p>
                        <h3 className="mt-1 text-sm font-semibold text-slate-900">{assignment.title}</h3>
                        <p className="mt-1 text-xs text-slate-600">Due {formatDate(assignment.dueAt)}</p>
                      </div>
                      <span className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                        {assignment.submissionStatus ?? 'not started'}
                      </span>
                    </div>

                    <div className="mt-3 rounded-md border border-slate-300 bg-white p-3">
                      <p className="text-xs font-medium text-slate-700">Upload assignment submission</p>
                      <input
                        type="file"
                        onChange={(event) => {
                          const fileName = event.target.files?.[0]?.name ?? '';
                          if (!fileName) return;
                          setUploadedSubmissions((current) => ({ ...current, [assignment.id]: fileName }));
                        }}
                        className="mt-2 block w-full text-xs text-slate-700 file:mr-2 file:rounded file:border file:border-slate-300 file:bg-slate-50 file:px-2 file:py-1"
                      />
                      {uploadedSubmissions[assignment.id] ? (
                        <p className="mt-2 text-xs text-green-700">
                          Uploaded: {uploadedSubmissions[assignment.id]}
                        </p>
                      ) : null}
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState text="No pending assignments right now." />
              )}
            </div>
            <Link
              href="/dash/student/assignments"
              className="mt-4 inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Open all assignments
            </Link>
          </Panel>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <Panel title="Subject progress" icon={TrendingUp}>
            <div className="space-y-3">
              {progressRows.length > 0 ? (
                progressRows.map((row) => {
                  const width = Math.max(6, Math.min(100, row.value || 0));

                  return (
                    <div key={row.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-slate-700">{row.subject}</span>
                        <span className="text-xs font-semibold text-slate-700">{row.value.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-slate-700" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState text="Progress data will show after your first graded work." />
              )}
            </div>
          </Panel>

          <Panel title="Quick actions" icon={CheckCircle2}>
            <div className="grid grid-cols-1 gap-2">
              <QuickLink href="/dash/student/live" label="Join class" />
              <QuickLink href="/dash/student/assignments" label="Submit homework" />
              <QuickLink href="/dash/student/exam-prep" label="Practice tests" />
              <QuickLink href="/dash/student/notes" label="Study notes" />
            </div>
          </Panel>

          <Panel title="Subscription" icon={Target}>
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                Access: <span className="font-semibold">{billingSummary.entitlement.hasAccess ? 'Enabled' : 'Blocked'}</span>
              </p>
              <p>
                Plan: <span className="font-semibold">{planName}</span>
              </p>
              <p>
                Price: <span className="font-semibold">{planAmount}</span>
              </p>
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-500" />
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-slate-500">{label}</span>
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
    >
      {label}
      <span className="text-xs text-slate-500">Open</span>
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">{text}</div>;
}
