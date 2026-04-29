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
      <div className="space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-700 w-full min-w-0">
        <header className="bg-white border-[3px] sm:border-[4px] border-dark rounded-[24px] sm:rounded-[40px] p-5 sm:p-8 md:p-12 shadow-[6px_6px_0px_#060E1C] sm:shadow-[12px_12px_0px_#060E1C] flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 max-w-full w-full min-w-0">
          <div className="text-center md:text-left min-w-0">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-heading font-black text-dark tracking-tight leading-none break-words">
              Hi, {dashboard.profile.fullName?.split(' ')[0] || 'Explorer'}! 👋
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-xl md:text-2xl font-bold text-dark/60 italic break-words">Ready for your magic missions today?</p>
          </div>
          <div className="flex gap-3 sm:gap-4 flex-wrap justify-center min-w-0 w-full md:w-auto">
             <div className="bg-yellow border-[3px] sm:border-[4px] border-dark rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] text-center flex-1 md:min-w-[120px]">
                <Star className="h-6 w-6 sm:h-8 sm:w-8 text-dark mx-auto mb-1 sm:mb-2 fill-current" />
                <p className="text-2xl sm:text-3xl font-black text-dark">{stars}</p>
             </div>
             <div className="bg-orange-400 border-[3px] sm:border-[4px] border-dark rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] text-center flex-1 md:min-w-[120px]">
                <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-white mx-auto mb-1 sm:mb-2 fill-current" />
                <p className="text-2xl sm:text-3xl font-black text-white">{streak}</p>
             </div>
          </div>
        </header>

        {/* Quick Fun Links */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          <FunCard icon="📚" label="Subjects" href="/dash/student/subjects" color="bg-emerald-300" />
          <FunCard icon="📝" label="Notes" href="/dash/student/notes" color="bg-indigo-300" />
          <FunCard icon="🐝" label="Spelling Bee" href="/dash/student/spelling-bee" color="bg-yellow" />
          <FunCard icon="🎮" label="Play Zone" href="/dash/student/games" color="bg-green-400" />
          <FunCard icon="📖" label="Read Corner" href="/dash/student/read" color="bg-blue-400" />
          <FunCard icon="📺" label="Stories" href="/dash/student/stories" color="bg-red-400" />
        </div>

        <div className="grid grid-cols-1 gap-6 pt-2 sm:gap-8 lg:grid-cols-3 sm:pt-4">
           {/* Active Missions */}
           <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl sm:text-3xl font-black text-dark uppercase tracking-tight">Today&apos;s Missions</h2>
                <Link href="/dash/student/homework" className="text-sm font-black text-indigo-600 uppercase tracking-widest hover:underline">See All</Link>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                {featuredAssignments.map((hw) => (
                  <div key={hw.id} className="bg-white border-[4px] border-dark rounded-[28px] sm:rounded-[40px] p-5 sm:p-8 shadow-[6px_6px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] hover:translate-y-[-4px] transition-all flex flex-col">
                     <div className="h-14 w-14 rounded-2xl bg-indigo-50 border-[3px] border-dark flex items-center justify-center text-3xl mb-6">
                        📚
                     </div>
                     <p className="text-[10px] font-black uppercase text-dark/30 tracking-widest mb-1">{hw.subjectName}</p>
                     <h3 className="text-2xl font-black text-dark mb-6 flex-1">{hw.title}</h3>
                     <Link 
                       href="/dash/student/homework"
                       className="w-full py-4 bg-indigo-600 text-white border-[3px] border-dark rounded-2xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#060E1C] text-center"
                     >
                       Start Now!
                     </Link>
                  </div>
                ))}
              </div>
           </div>

           {/* Live Now / Next */}
           <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black text-dark uppercase tracking-tight">Live Class</h2>
              {nextLesson ? (
                <div className="bg-white border-[4px] border-dark rounded-[28px] sm:rounded-[40px] shadow-[6px_6px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] overflow-hidden">
                   <div className="bg-red-500 p-4 border-b-[4px] border-dark text-center">
                      <span className="text-xs font-black text-white uppercase tracking-widest animate-pulse">
                         Live in {countdownText(nextLesson.scheduledStartAt)}
                      </span>
                   </div>
                   <div className="p-5 sm:p-8 text-center space-y-4">
                      <div className="h-20 w-20 rounded-full bg-slate-50 border-[3px] border-dark flex items-center justify-center text-4xl mx-auto">
                         👨‍🏫
                      </div>
                      <h3 className="text-2xl font-black text-dark">{nextLesson.title}</h3>
                      <p className="text-sm font-bold text-dark/40">{nextLesson.classTitle}</p>
                      
                      {nextLesson.joinUrl ? (
                        <a
                          href={nextLesson.joinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block w-full py-5 bg-yellow text-dark border-[4px] border-dark rounded-2xl font-black uppercase text-sm tracking-widest shadow-[6px_6px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                        >
                          Join Class Now
                        </a>
                      ) : (
                        <div className="py-4 text-sm font-bold text-dark/30 italic">Getting the room ready...</div>
                      )}
                   </div>
                </div>
              ) : (
                <div className="bg-slate-50 border-[4px] border-dark border-dashed rounded-[28px] sm:rounded-[40px] p-8 sm:p-12 text-center">
                   <p className="font-bold text-dark/30 italic">No classes today. Take a break!</p>
                </div>
              )}
           </div>
        </div>
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
