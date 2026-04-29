'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Clock3, Target, TrendingUp, Video, Sparkles, PlayCircle, Star, Flame, ArrowRight } from 'lucide-react';

import { useBand } from './BandContext';
import StudentLiveContentPanel from './StudentLiveContentPanel';
import type { BillingSummary, StudentDashboardData } from '@/lib/app-context';

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
  const featuredAssignments = dashboard.assignments.slice(0, 2);
  const [uploadedSubmissions, setUploadedSubmissions] = useState<Record<string, string>>({});
  const [spellingInput, setSpellingInput] = useState('');
  const [, setSpellingFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const checkSpelling = (word: string) => {
    if (spellingInput.toLowerCase().trim() === word.toLowerCase().trim()) {
      setSpellingFeedback({ type: 'success', message: 'Perfect! Well done! 🎉' });
      speakWord('Perfect! Well done!');
      setSpellingInput('');
      setTimeout(() => setSpellingFeedback({ type: null, message: '' }), 3000);
    } else {
      setSpellingFeedback({ type: 'error', message: 'Try again, you can do it!' });
      setTimeout(() => setSpellingFeedback({ type: null, message: '' }), 2000);
    }
  };

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

  if (band === '1-3') {
    const stars = dashboard.stats.completedAssignments * 8 + dashboard.stats.activeClasses * 4;
    const stickers = Math.max(2, dashboard.stats.completedAssignments);
    const streak = Math.max(1, dashboard.progress.length);

    return (
      <div className="w-full min-w-0 animate-in fade-in duration-500">
        {/* ── Profile Card (LinkedIn-inspired) ── */}
        <div className="bg-white sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-sm overflow-hidden">
          {/* Cover gradient */}
          <div className="h-20 sm:h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wOCIvPjwvc3ZnPg==')] opacity-60" />
          </div>
          <div className="px-4 sm:px-6 pb-5 -mt-10">
            <div className="flex items-end gap-3">
              <div className="h-[72px] w-[72px] rounded-full ring-4 ring-white overflow-hidden bg-white shrink-0">
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(dashboard.profile.fullName ?? 'Explorer')}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                  {dashboard.profile.fullName?.split(' ')[0] || 'Explorer'} 👋
                </h1>
                <p className="text-xs font-semibold text-slate-500 truncate">
                  {dashboard.profile.gradeLevelName} · {copy.label}
                </p>
              </div>
            </div>
            {/* Stats row */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2.5">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg font-black text-slate-900 leading-none">{stars}</p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Stars</p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2 bg-orange-50 rounded-xl px-3 py-2.5">
                <Flame className="h-5 w-5 text-orange-500 fill-orange-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg font-black text-slate-900 leading-none">{streak}</p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Streak</p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2.5">
                <Target className="h-5 w-5 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg font-black text-slate-900 leading-none">{formatPercent(dashboard.stats.averageScore)}</p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Avg</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Actions (horizontal scroll) ── */}
        <div className="mt-3 sm:mt-5 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 px-4 sm:px-0 min-w-max">
            <QuickPill icon="📚" label="Subjects" href="/dash/student/subjects" color="bg-indigo-50 text-indigo-700 border-indigo-200" />
            <QuickPill icon="🐝" label="Spelling" href="/dash/student/spelling-bee" color="bg-amber-50 text-amber-700 border-amber-200" />
            <QuickPill icon="🎮" label="Play" href="/dash/student/games" color="bg-emerald-50 text-emerald-700 border-emerald-200" />
            <QuickPill icon="📖" label="Read" href="/dash/student/read" color="bg-sky-50 text-sky-700 border-sky-200" />
            <QuickPill icon="📺" label="Stories" href="/dash/student/stories" color="bg-rose-50 text-rose-700 border-rose-200" />
            <QuickPill icon="✨" label="Flashcards" href="/dash/student/flashcards" color="bg-purple-50 text-purple-700 border-purple-200" />
          </div>
        </div>

        {/* ── Feed Cards ── */}
        <div className="mt-3 sm:mt-5 space-y-3 sm:space-y-5 px-0 sm:px-0">

          {/* Live Class Card */}
          {nextLesson ? (
            <div className="bg-white sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Live Class · {countdownText(nextLesson.scheduledStartAt)}</span>
              </div>
              <div className="p-4 flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shrink-0 shadow-md">
                  👨‍🏫
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900 truncate">{nextLesson.title}</h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{nextLesson.classTitle}</p>
                </div>
              </div>
              <div className="px-4 pb-4">
                {nextLesson.joinUrl ? (
                  <a
                    href={nextLesson.joinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm transition-all shadow-sm"
                  >
                    <PlayCircle className="h-5 w-5" />
                    Join Class Now
                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 text-slate-500 rounded-xl font-medium text-sm">
                    <Clock3 className="h-4 w-4" />
                    Preparing room...
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Today's Missions */}
          <div className="bg-white sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Today&apos;s Missions</h2>
              </div>
              <Link href="/dash/student/homework" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">See all</Link>
            </div>
            {featuredAssignments.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {featuredAssignments.map((hw) => (
                  <Link key={hw.id} href="/dash/student/homework" className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 border border-indigo-200/60 flex items-center justify-center text-xl shrink-0">
                      📝
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{hw.title}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">{hw.subjectName} · Due {formatDate(hw.dueAt)}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-4 py-10 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-400">All caught up! 🎉</p>
              </div>
            )}
          </div>

          {/* Subject Progress */}
          {progressRows.length > 0 && (
            <div className="bg-white sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Subject Progress</h2>
              </div>
              <div className="p-4 space-y-4">
                {progressRows.map((row) => {
                  const width = Math.max(8, Math.min(100, row.value || 0));
                  return (
                    <div key={row.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-slate-700">{row.subject}</span>
                        <span className="text-sm font-bold text-slate-900">{row.value.toFixed(0)}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Content from Tutor */}
          <div className="bg-white sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <Video className="h-4 w-4 text-rose-600" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Live from Tutor</h2>
            </div>
            <div className="p-4">
              <StudentLiveContentPanel />
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-amber-600" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Explore</h2>
            </div>
            <div className="grid grid-cols-2 gap-px bg-slate-100">
              <MobileLink icon="🎓" label="Join Lesson" href="/dash/student/live" />
              <MobileLink icon="📤" label="Submit Work" href="/dash/student/assignments" />
              <MobileLink icon="🧪" label="Practice Tests" href="/dash/student/exam-prep" />
              <MobileLink icon="📒" label="Study Notes" href="/dash/student/notes" />
            </div>
          </div>
        </div>

        {/* Bottom spacer for safe area */}
        <div className="h-4 sm:h-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-8 pb-14 sm:space-y-10">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-5 sm:p-8 border-b-[4px] border-dark bg-yellow/20">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60 mb-2">{copy.label}</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark break-words">
            Hello, {dashboard.profile.fullName ?? 'Student'}
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            {copy.subtitle}
          </p>
        </div>
        
        <div className="p-4 sm:p-8 bg-off-white grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard label="Upcoming lessons" value={String(dashboard.stats.upcomingLessons)} icon={Clock3} color="bg-emerald-100" />
          <StatCard label="Pending tasks" value={String(dashboard.stats.pendingAssignments)} icon={CheckCircle2} color="bg-blue-100" />
          <StatCard label="Average score" value={formatPercent(dashboard.stats.averageScore)} icon={TrendingUp} color="bg-rose-100" />
          <StatCard label="Attendance" value={formatPercent(dashboard.stats.attendanceRate)} icon={Target} color="bg-amber-100" />
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-12">
        <div className="space-y-6 sm:space-y-8 xl:col-span-8">
          <Panel title="Live from tutor" icon={Video} color="bg-rose-100">
            <StudentLiveContentPanel />
          </Panel>

          <Panel title="Next lesson" icon={Clock3} color="bg-amber-100">
            {nextLesson ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-2xl border-[3px] border-dark bg-off-white p-6 shadow-[4px_4px_0px_#060E1C]">
                <div>
                  <h3 className="text-xl font-black text-dark">{nextLesson.title}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60 mt-2">
                    {nextLesson.subjectName} - {nextLesson.classTitle}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="inline-flex rounded-xl border-[2px] border-dark bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_#060E1C]">
                      {formatDateTime(nextLesson.scheduledStartAt)}
                    </span>
                    <span className="inline-flex rounded-xl border-[2px] border-dark bg-rose-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-rose-900 shadow-[2px_2px_0px_#060E1C] animate-pulse">
                      {countdownText(nextLesson.scheduledStartAt)}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  {nextLesson.joinUrl ? (
                    <a
                      href={nextLesson.joinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center bg-emerald-400 border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 animate-pulse"
                    >
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Join Class Now
                    </a>
                  ) : (
                    <Link
                      href="/dash/student/live"
                      className="inline-flex items-center justify-center bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4"
                    >
                      Wait for teacher...
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState text="No live classes right now." icon={Video} />
            )}
          </Panel>

          <Panel title="Pending assignments" icon={BookOpen} color="bg-blue-100">
            <div className="space-y-4">
              {pendingAssignments.length > 0 ? (
                pendingAssignments.map((assignment) => (
                  <article key={assignment.id} className="rounded-2xl border-[3px] border-dark bg-off-white p-6 shadow-[4px_4px_0px_#060E1C] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#060E1C]">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex rounded-md border-[2px] border-dark bg-yellow px-2 py-1 text-[10px] font-black uppercase tracking-widest text-dark shadow-[2px_2px_0px_#060E1C]">
                          {assignment.subjectName}
                        </span>
                        <h3 className="mt-3 text-xl font-black text-dark">{assignment.title}</h3>
                        <p className="mt-2 text-xs font-bold text-dark/70">Due {formatDate(assignment.dueAt)}</p>
                      </div>
                      <span className="inline-flex items-center rounded-xl border-[2px] border-dark bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-dark shadow-[2px_2px_0px_#060E1C]">
                        {assignment.submissionStatus ?? 'not started'}
                      </span>
                    </div>

                    <div className="mt-6 rounded-xl border-[3px] border-dark bg-white p-4 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.05)]">
                      <p className="text-xs font-black uppercase tracking-widest text-dark/60">Upload Submission</p>
                      <input
                        type="file"
                        onChange={(event) => {
                          const fileName = event.target.files?.[0]?.name ?? '';
                          if (!fileName) return;
                          setUploadedSubmissions((current) => ({ ...current, [assignment.id]: fileName }));
                        }}
                        className="mt-3 block w-full text-sm font-bold text-dark file:mr-4 file:rounded-xl file:border-[3px] file:border-dark file:bg-slate-100 file:px-4 file:py-2 file:font-black file:text-dark hover:file:bg-slate-200 transition-all"
                      />
                      {uploadedSubmissions[assignment.id] ? (
                        <p className="mt-3 inline-flex rounded-xl border-[2px] border-dark bg-emerald-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-900 shadow-[2px_2px_0px_#060E1C]">
                          Uploaded: {uploadedSubmissions[assignment.id]}
                        </p>
                      ) : null}
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState text="No pending assignments right now." icon={CheckCircle2} />
              )}
            </div>
            <Link
              href="/dash/student/assignments"
              className="mt-6 inline-flex items-center justify-between w-full bg-dark border-[3px] border-dark text-white font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4"
            >
              <span>Open all assignments</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Panel>
        </div>

        <div className="space-y-6 sm:space-y-8 xl:col-span-4 flex flex-col">
          <Panel title="Subject progress" icon={TrendingUp} color="bg-emerald-100">
            <div className="space-y-4">
              {progressRows.length > 0 ? (
                progressRows.map((row) => {
                  const width = Math.max(6, Math.min(100, row.value || 0));

                  return (
                    <div key={row.id} className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <span className="text-sm font-black text-dark tracking-tight">{row.subject}</span>
                        <span className="inline-flex rounded-xl border-[2px] border-dark bg-white px-2 py-1 text-[10px] font-black shadow-[2px_2px_0px_#060E1C]">{row.value.toFixed(0)}%</span>
                      </div>
                      <div className="h-4 w-full rounded-full border-[3px] border-dark bg-white overflow-hidden shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)]">
                        <div className="h-full bg-emerald-400 border-r-[3px] border-dark" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState text="Progress data will show after your first graded work." icon={TrendingUp} />
              )}
            </div>
          </Panel>

          <Panel title="Quick actions" icon={Sparkles} color="bg-yellow/40">
            <div className="grid grid-cols-1 gap-3">
              <QuickLink href="/dash/student/live" label="Join class" />
              <QuickLink href="/dash/student/assignments" label="Submit homework" />
              <QuickLink href="/dash/student/exam-prep" label="Practice tests" />
              <QuickLink href="/dash/student/notes" label="Study notes" />
            </div>
          </Panel>

          <Panel title="Subscription" icon={Target} color="bg-purple-100" className="mt-auto">
            <div className="rounded-2xl border-[3px] border-dark bg-white p-5 shadow-[4px_4px_0px_#060E1C] space-y-4">
              <div className="flex justify-between items-center border-b-[3px] border-dark/10 pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-dark/60">Access</span>
                <span className={`inline-flex rounded-md border-[2px] border-dark px-2 py-1 text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_#060E1C] ${billingSummary.entitlement.hasAccess ? 'bg-emerald-300 text-dark' : 'bg-rose-100 text-rose-900'}`}>
                  {billingSummary.entitlement.hasAccess ? 'Enabled' : 'Blocked'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b-[3px] border-dark/10 pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-dark/60">Plan</span>
                <span className="text-sm font-black text-dark">{planName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-dark/60">Price</span>
                <span className="text-sm font-black text-dark">{planAmount}</span>
              </div>
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}

function FunCard({ icon, label, href, color }: { icon: string; label: string; href: string; color: string }) {
  return (
    <Link 
      href={href}
      className={`${color} border-[4px] border-dark rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex flex-col items-center text-center group min-w-0`}
    >
       <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-125 transition-transform">{icon}</div>
       <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-dark break-words">{label}</span>
    </Link>
  );
}function Panel({
  title,
  icon: Icon,
  children,
  color,
  className = '',
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  color: string;
  className?: string;
}) {
  return (
    <section className={`rounded-[24px] sm:rounded-[28px] border-[4px] border-dark bg-white shadow-[6px_6px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden flex flex-col ${className}`}>
      <div className={`p-4 sm:p-6 border-b-[4px] border-dark ${color} flex items-center gap-3`}>
        <Icon className="h-6 w-6 text-dark" />
        <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight break-words">{title}</h2>
      </div>
      <div className="p-4 sm:p-8 flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className={`rounded-2xl border-[3px] border-dark ${color} p-5 shadow-[4px_4px_0px_#060E1C] flex flex-col`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-dark/70">{label}</span>
        <Icon className="h-4 w-4 text-dark/50" />
      </div>
      <p className="mt-4 text-3xl md:text-4xl font-black text-dark">{value}</p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-between rounded-xl border-[3px] border-dark bg-white px-5 py-4 text-sm font-black text-dark transition-all hover:bg-slate-50 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[4px_4px_0px_#060E1C]"
    >
      <span>{label}</span>
      <ArrowRight className="h-5 w-5" />
    </Link>
  );
}

function EmptyState({ text, icon: Icon }: { text: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-10 text-center flex flex-col items-center">
      <Icon className="h-8 w-8 text-dark/30 mb-4" />
      <p className="text-sm font-bold text-dark/60 italic">{text}</p>
    </div>
  );
}

function QuickPill({ icon, label, href, color }: { icon: string; label: string; href: string; color: string }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold transition-all hover:shadow-sm active:scale-95 shrink-0 ${color}`}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function MobileLink({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 bg-white px-4 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <ArrowRight className="h-4 w-4 text-slate-400 ml-auto shrink-0" />
    </Link>
  );
}
