'use client';

import { CalendarClock, CircleCheck, CreditCard, Rocket, ShieldAlert, Trophy } from 'lucide-react';

import { useBand } from './BandContext';
import type { BillingSummary, StudentDashboardData } from '@/lib/app-context';

const bandThemes = {
  '1-3': {
    eyebrow: 'Adventure Park',
    titleAccent: 'Playful Momentum',
    subtitle: 'Small wins, clear routines, and visible encouragement for young learners.',
    panelTone: 'bg-pink-50',
  },
  '4-6': {
    eyebrow: 'Explorer Hub',
    titleAccent: 'Mission Control',
    subtitle: 'Balanced challenge, progress visibility, and class readiness for growing learners.',
    panelTone: 'bg-blue-50',
  },
  '7-12': {
    eyebrow: 'Senior Cockpit',
    titleAccent: 'Performance Grid',
    subtitle: 'Academic focus, upcoming deadlines, and disciplined session readiness.',
    panelTone: 'bg-yellow/10',
  },
} as const;

const formatPercent = (value: string | null) => {
  if (!value) return '--';
  return `${Number(value).toFixed(0)}%`;
};

const formatMoney = (amountMinor: number | null, currencyCode: string | null) => {
  if (amountMinor === null || !currencyCode) return 'Pending';
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

export default function StudentBandClientWrapper({
  dashboard,
  billingSummary,
}: {
  dashboard: StudentDashboardData;
  billingSummary: BillingSummary;
}) {
  const { band } = useBand();
  const theme = bandThemes[band];
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

  return (
    <div className="space-y-10 max-w-[1520px] mx-auto pb-24">
      <section className="border-[4px] border-dark bg-white shadow-[10px_10px_0px_#060E1C] rounded-[28px] overflow-hidden">
        <div className={`p-10 md:p-14 border-b-[4px] border-dark ${theme.panelTone}`}>
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-3 px-4 py-2 text-[10px] tracking-[0.35em] border-[3px] border-dark bg-white shadow-[4px_4px_0px_#060E1C]">
                {theme.eyebrow}
              </span>
              <div>
                <h1 className="text-4xl md:text-6xl font-heading tracking-tight text-dark leading-[0.9]">
                  {dashboard.profile.fullName ?? 'Student'} <span className="text-info">{theme.titleAccent}</span>
                </h1>
                <p className="mt-4 max-w-3xl text-sm md:text-base text-dark/70 font-bold normal-case">
                  {theme.subtitle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full xl:w-auto">
              <StatCard label="Active Classes" value={String(dashboard.stats.activeClasses)} icon={Rocket} />
              <StatCard label="Pending Tasks" value={String(dashboard.stats.pendingAssignments)} icon={ShieldAlert} />
              <StatCard label="Upcoming Lessons" value={String(dashboard.stats.upcomingLessons)} icon={CalendarClock} />
              <StatCard label="Average Score" value={formatPercent(dashboard.stats.averageScore)} icon={Trophy} />
            </div>
          </div>
        </div>

        <div className="p-10 md:p-14 grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-8">
            <Panel title="Learning Snapshot" icon={CircleCheck}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricBox label="Grade Level" value={dashboard.profile.gradeLevelName} />
                <MetricBox label="Attendance Rate" value={formatPercent(dashboard.stats.attendanceRate)} />
                <MetricBox
                  label="Completion Rate"
                  value={formatPercent(dashboard.stats.assignmentCompletionRate)}
                />
              </div>
              <p className="mt-5 text-sm normal-case text-dark/70 font-semibold">
                {dashboard.profile.academicGoalNotes ||
                  'No academic goal note has been saved yet. Add one during onboarding or profile completion.'}
              </p>
            </Panel>

            <Panel title="Upcoming Live Lessons" icon={CalendarClock}>
              <div className="space-y-4">
                {dashboard.upcomingLessons.length > 0 ? (
                  dashboard.upcomingLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="border-[3px] border-dark rounded-2xl p-5 bg-off-white shadow-[4px_4px_0px_#060E1C]"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <p className="text-xs tracking-[0.25em] text-dark/40">{lesson.subjectName}</p>
                          <h3 className="text-xl font-black text-dark">{lesson.title}</h3>
                          <p className="text-sm normal-case text-dark/70 font-semibold">{lesson.classTitle}</p>
                        </div>
                        <div className="text-sm font-black text-dark">
                          {formatDateTime(lesson.scheduledStartAt)}
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <span className="px-3 py-2 border-[2px] border-dark bg-white text-[11px]">
                          {lesson.provider.replace('_', ' ')}
                        </span>
                        <span className="px-3 py-2 border-[2px] border-dark bg-white text-[11px]">
                          Ends {formatDateTime(lesson.scheduledEndAt)}
                        </span>
                        {lesson.joinUrl ? (
                          <a
                            href={lesson.joinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 border-[2px] border-dark bg-yellow text-[11px] shadow-[3px_3px_0px_#060E1C]"
                          >
                            Join Session
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState text="No upcoming lessons are scheduled yet." />
                )}
              </div>
            </Panel>

            <Panel title="Assignments" icon={CircleCheck}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AssignmentColumn title="Needs Attention" items={pendingAssignments} />
                <AssignmentColumn title="Graded Work" items={gradedAssignments} graded />
              </div>
            </Panel>
          </div>

          <div className="xl:col-span-4 space-y-8">
            <Panel title="Subscription" icon={CreditCard}>
              <div className="space-y-4">
                <MetricBox
                  label="Access"
                  value={billingSummary.entitlement.hasAccess ? 'Enabled' : 'Blocked'}
                />
                <MetricBox
                  label="Plan"
                  value={billingSummary.subscription?.planName ?? billingSummary.plans[0]?.name ?? 'Not Set'}
                />
                <MetricBox
                  label="Price"
                  value={formatMoney(
                    billingSummary.subscription?.planAmountMinor ?? billingSummary.plans[0]?.amountMinor ?? null,
                    billingSummary.subscription?.planCurrencyCode ?? billingSummary.plans[0]?.currencyCode ?? null,
                  )}
                />
                <MetricBox
                  label="Cycle Ends"
                  value={billingSummary.subscription?.currentPeriodEnd ? formatDateTime(billingSummary.subscription.currentPeriodEnd) : 'No active cycle'}
                />
              </div>
            </Panel>

            <Panel title="Enrolled Classes" icon={Rocket}>
              <div className="space-y-4">
                {dashboard.enrollments.length > 0 ? (
                  dashboard.enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="border-[3px] border-dark rounded-2xl p-4 bg-white">
                      <p className="text-[11px] tracking-[0.25em] text-dark/40">{enrollment.subjectName}</p>
                      <h3 className="text-lg font-black text-dark">{enrollment.classTitle}</h3>
                      <p className="text-sm normal-case text-dark/70 font-semibold">
                        {enrollment.tutorName ? `Tutor: ${enrollment.tutorName}` : 'Tutor assignment pending'}
                      </p>
                    </div>
                  ))
                ) : (
                  <EmptyState text="No active class enrollments yet." />
                )}
              </div>
            </Panel>

            <Panel title="Progress Feed" icon={Trophy}>
              <div className="space-y-4">
                {dashboard.progress.length > 0 ? (
                  dashboard.progress.map((entry) => (
                    <div key={entry.id} className="border-[3px] border-dark rounded-2xl p-4 bg-white">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-base font-black text-dark">{entry.subjectName ?? 'Overall Progress'}</h3>
                        <span className="text-[11px] text-dark/50">{entry.snapshotDate}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                        <MetricBox compact label="Score" value={formatPercent(entry.averageScore)} />
                        <MetricBox compact label="Attendance" value={formatPercent(entry.attendanceRate)} />
                        <MetricBox compact label="Tasks" value={formatPercent(entry.assignmentCompletionRate)} />
                      </div>
                      {entry.masteryNotes ? (
                        <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">{entry.masteryNotes}</p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <EmptyState text="Progress snapshots will appear here once the worker has generated them." />
                )}
              </div>
            </Panel>
          </div>
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
    <section className="border-[4px] border-dark rounded-[26px] p-6 md:p-8 bg-white shadow-[8px_8px_0px_#060E1C]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 border-[3px] border-dark bg-yellow rounded-2xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-dark" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-dark">{title}</h2>
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
    <div className="border-[3px] border-dark rounded-2xl bg-white p-4 shadow-[4px_4px_0px_#060E1C]">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[11px] tracking-[0.25em] text-dark/50">{label}</span>
        <Icon className="w-5 h-5 text-info" />
      </div>
      <div className="mt-3 text-3xl font-black text-dark">{value}</div>
    </div>
  );
}

function MetricBox({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className={`border-[3px] border-dark rounded-2xl bg-off-white ${compact ? 'p-3' : 'p-4'}`}>
      <p className={`text-dark/50 ${compact ? 'text-[10px]' : 'text-[11px]'} tracking-[0.2em]`}>{label}</p>
      <p className={`${compact ? 'text-lg' : 'text-2xl'} mt-2 font-black text-dark`}>{value}</p>
    </div>
  );
}

function AssignmentColumn({
  title,
  items,
  graded = false,
}: {
  title: string;
  items: StudentDashboardData['assignments'];
  graded?: boolean;
}) {
  return (
    <div className="border-[3px] border-dark rounded-2xl p-5 bg-off-white">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-black text-dark">{title}</h3>
        <span className="text-[11px] tracking-[0.25em] text-dark/50">{items.length}</span>
      </div>
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="border-[2px] border-dark rounded-2xl p-4 bg-white">
              <p className="text-[11px] tracking-[0.2em] text-dark/40">{item.subjectName}</p>
              <h4 className="text-base font-black text-dark">{item.title}</h4>
              <p className="text-sm normal-case text-dark/70 font-semibold">{item.classTitle}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
                <span className="px-3 py-1 border-[2px] border-dark bg-off-white">
                  {item.dueAt ? `Due ${formatDateTime(item.dueAt)}` : 'No due date'}
                </span>
                <span className="px-3 py-1 border-[2px] border-dark bg-off-white">
                  {item.submissionStatus ?? 'not started'}
                </span>
                {graded && item.score ? (
                  <span className="px-3 py-1 border-[2px] border-dark bg-yellow">
                    Score {Number(item.score).toFixed(0)}%
                  </span>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <EmptyState text={graded ? 'No graded submissions yet.' : 'No pending assignments right now.'} />
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="border-[3px] border-dashed border-dark/30 rounded-2xl p-6 text-sm normal-case text-dark/60">{text}</div>;
}
