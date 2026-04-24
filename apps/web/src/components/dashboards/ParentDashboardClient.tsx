'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Bell,
  BookOpen,
  CalendarDays,
  CreditCard,
  Flame,
  MessageCircle,
  ShieldAlert,
  Sparkles,
  Star,
  Trophy,
  Users,
  Settings,
  ArrowRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

type ParentChild = {
  userId: string;
  fullName: string | null;
  relationship: string;
  gradeLevelCode: string;
  gradeLevelName: string;
  gradeBandCode: string;
  gradeBandName: string;
  schoolName: string | null;
};

type BillingSummary = {
  entitlement: {
    hasAccess: boolean;
    reason: string;
  };
  subscription: {
    id: string;
    status: string;
    currentPeriodEnd: string | null;
    planName: string | null;
    planAmountMinor: number | null;
    planCurrencyCode: string | null;
  } | null;
  invoices: Array<{
    id: string;
    status: string;
    amountDueMinor: number;
    amountPaidMinor: number;
    dueAt: string | null;
  }>;
};

export default function ParentDashboardClient({
  parentName,
  linkedChildren,
  billingSummary,
}: {
  parentName: string;
  linkedChildren: ParentChild[];
  billingSummary: BillingSummary | null;
}) {
  const [activeChildId, setActiveChildId] = useState<string>(linkedChildren[0]?.userId ?? '');

  const activeChild = useMemo(
    () => linkedChildren.find((child) => child.userId === activeChildId) ?? linkedChildren[0] ?? null,
    [linkedChildren, activeChildId],
  );

  const activeIndex = Math.max(
    0,
    linkedChildren.findIndex((child) => child.userId === activeChild?.userId),
  );

  const engagement = useMemo(() => {
    const base = (activeIndex + 3) * 7;
    return {
      xp: 940 + base * 5,
      badges: 8 + (activeIndex % 4),
      streak: 5 + (activeIndex % 5),
      challengesCompleted: 11 + (activeIndex % 6),
      achievementProgress: Math.min(96, 66 + base % 24),
      attendanceRate: Math.min(99, 84 + (base % 13)),
      assignmentCompletion: Math.min(98, 76 + (base % 18)),
    };
  }, [activeIndex]);

  const alerts = useMemo(() => {
    if (!activeChild) return [];
    return [
      {
        title: 'Low Engagement Alert',
        detail: `${activeChild.fullName ?? 'Child'} had lighter activity in the last 48 hours.`,
      },
      {
        title: 'Missed-Lesson Alert',
        detail: `1 scheduled lesson was marked absent this week for ${activeChild.fullName ?? 'this child'}.`,
      },
      {
        title: 'Overdue Assignment Alert',
        detail: `2 assignments are pending submission in ${activeChild.gradeLevelName}.`,
      },
    ];
  }, [activeChild]);

  const invoices = billingSummary?.invoices ?? [];
  const subscription = billingSummary?.subscription;
  const latestInvoice = invoices[0] ?? null;

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-6 sm:p-8 pb-20">
      
      {/* Header Section */}
      <section className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 md:p-12 border-b-[4px] border-dark bg-blue-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3 min-w-0">
              <span className="inline-flex items-center gap-2 px-4 py-2 border-[3px] border-dark bg-white text-[10px] tracking-[0.2em] font-black shadow-[4px_4px_0px_#060E1C]">
                PARENT PORTAL
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
                Welcome, {parentName}
              </h1>
              <p className="text-sm md:text-base font-semibold normal-case text-dark/70 max-w-xl">
                Track each child with confidence, visibility, and control.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/dash/parent/messages">
                <Button className="bg-yellow border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-3 h-auto">
                  Message Tutor
                </Button>
              </Link>
              <Link href="/dash/parent/children">
                <Button className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-3 h-auto">
                  Manage Children
                </Button>
              </Link>
            </div>
          </div>
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
                  {child.fullName ?? 'Unnamed Child'} <span className="opacity-60 font-bold ml-1">({child.gradeLevelName})</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs font-bold text-dark/60">No children linked yet. Use Manage Children to add one.</p>
          )}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Child Snapshot */}
        <div className="lg:col-span-2 border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-amber-100">
            <h2 className="text-2xl font-black text-dark tracking-tight">Child Snapshot</h2>
          </div>
          <div className="p-6 sm:p-8">
            {activeChild ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Child Name</p>
                  <p className="mt-1 text-xl font-black text-dark">{activeChild.fullName ?? 'Unnamed Child'}</p>
                </div>
                <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Grade</p>
                  <p className="mt-1 text-xl font-black text-dark">{activeChild.gradeLevelName}</p>
                </div>
                <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Learner Band</p>
                  <p className="mt-1 text-xl font-black text-dark">{activeChild.gradeBandName}</p>
                </div>
                <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">School</p>
                  <p className="mt-1 text-xl font-black text-dark truncate">{activeChild.schoolName ?? 'Not set'}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-8 text-center text-sm font-bold text-dark/60">
                Add a child profile to unlock this parent dashboard.
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-rose-100 flex items-center justify-between">
            <h2 className="text-2xl font-black text-dark tracking-tight">Alerts</h2>
            <div className="h-10 w-10 bg-white border-[3px] border-dark rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#060E1C]">
              <Bell className="h-5 w-5 text-dark" />
            </div>
          </div>
          <div className="p-6 space-y-4">
            {alerts.length > 0 ? (
              alerts.map((alertItem) => (
                <div key={alertItem.title} className="rounded-2xl border-[3px] border-dark bg-rose-50 p-4 shadow-[4px_4px_0px_#060E1C]">
                  <p className="flex items-center gap-2 text-sm font-black text-rose-600 uppercase tracking-widest">
                    <ShieldAlert className="h-4 w-4" />
                    {alertItem.title}
                  </p>
                  <p className="mt-2 text-sm font-bold text-dark/80">{alertItem.detail}</p>
                </div>
              ))
            ) : (
               <div className="rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-6 text-center text-sm font-bold text-dark/60">
                No active alerts.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Lessons & Attendance */}
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-yellow/20 flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">Lessons & Attendance</h2>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Upcoming Lessons</p>
                <p className="mt-2 text-4xl font-black text-dark">{2 + (activeIndex % 3)}</p>
              </div>
              <div className="rounded-2xl border-[3px] border-dark bg-emerald-100 p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Attendance Rate</p>
                <p className="mt-2 text-4xl font-black text-emerald-800">{engagement.attendanceRate}%</p>
              </div>
            </div>
            <Link href="/dash/parent/monitor" className="flex items-center justify-between rounded-xl border-[3px] border-dark bg-dark text-white px-5 py-4 text-sm font-black hover:bg-yellow hover:text-dark shadow-[4px_4px_0px_#060E1C] hover:shadow-[4px_4px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] transition-all hover:shadow-none active:scale-95">
              <span>View Timetable & History</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Homework & Progress */}
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-blue-100 flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">Homework & Progress</h2>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Assignments Due</p>
                <p className="mt-2 text-4xl font-black text-dark">{1 + (activeIndex % 4)}</p>
              </div>
              <div className="rounded-2xl border-[3px] border-dark bg-blue-100 p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Completion Rate</p>
                <p className="mt-2 text-4xl font-black text-blue-800">{engagement.assignmentCompletion}%</p>
              </div>
            </div>
            <Link href="/dash/parent/reports" className="flex items-center justify-between rounded-xl border-[3px] border-dark bg-dark text-white px-5 py-4 text-sm font-black hover:bg-yellow hover:text-dark shadow-[4px_4px_0px_#060E1C] hover:shadow-[4px_4px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] transition-all hover:shadow-none active:scale-95">
              <span>Review Grades & Reports</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Rewards & Engagement */}
        <div className="lg:col-span-2 border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-yellow/20 flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">Rewards & Engagement</h2>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border-[3px] border-dark bg-purple-100 p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
                  <Trophy className="h-4 w-4" /> Child XP
                </p>
                <p className="mt-2 text-3xl font-black text-dark">{engagement.xp}</p>
              </div>
              <div className="rounded-2xl border-[3px] border-dark bg-blue-100 p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
                  <Star className="h-4 w-4" /> Badges
                </p>
                <p className="mt-2 text-3xl font-black text-dark">{engagement.badges}</p>
              </div>
              <div className="rounded-2xl border-[3px] border-dark bg-rose-100 p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
                  <Flame className="h-4 w-4" /> Streak
                </p>
                <p className="mt-2 text-3xl font-black text-dark">{engagement.streak} days</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Challenge Completions</p>
                <p className="mt-2 text-2xl font-black text-dark">{engagement.challengesCompleted}</p>
              </div>
              <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Achievement Progress</p>
                <p className="mt-2 text-2xl font-black text-dark">{engagement.achievementProgress}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Billing */}
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-emerald-100 flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">Billing</h2>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              <div className="rounded-2xl border-[3px] border-dark bg-white p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Plan</p>
                <p className="mt-1 text-lg font-black text-dark">{subscription?.planName ?? 'No active plan'}</p>
                <p className="mt-1 text-xs font-bold text-dark/60">Status: {subscription?.status ?? 'inactive'}</p>
              </div>
              <div className="rounded-2xl border-[3px] border-dark bg-white p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Latest Invoice</p>
                <p className="mt-1 text-xl font-black text-dark">
                  {latestInvoice
                    ? `${(latestInvoice.amountDueMinor / 100).toLocaleString()} ${subscription?.planCurrencyCode ?? 'NGN'}`
                    : 'No invoice yet'}
                </p>
                <p className={`mt-1 inline-flex rounded-md border-[2px] border-dark px-2 py-1 text-[10px] font-black uppercase tracking-widest ${latestInvoice?.status === 'paid' ? 'bg-emerald-300 text-dark' : 'bg-slate-200 text-dark'}`}>{latestInvoice?.status ?? 'n/a'}</p>
              </div>
            </div>
            <Link href="/dash/parent/billing" className="flex items-center justify-between rounded-xl border-[3px] border-dark bg-dark text-white px-5 py-4 text-sm font-black hover:bg-yellow hover:text-dark shadow-[4px_4px_0px_#060E1C] hover:shadow-[4px_4px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] transition-all hover:shadow-none active:scale-95">
              <span>Manage Subscription</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Messages */}
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-sky-100 flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">Messages</h2>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm font-bold text-dark/70 mb-6">
              Message tutors for lesson concerns, progress checks, and support follow-up.
            </p>
            <Link href="/dash/parent/messages">
              <Button className="bg-yellow border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 h-auto w-full flex justify-between items-center">
                <span>Open Parent Messaging</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Settings */}
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-slate-100 flex items-center gap-3">
            <Settings className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">Consent & Settings</h2>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm font-bold text-dark/70 mb-6">
              Keep account preferences, alerts, and child access controls up to date.
            </p>
            <Link href="/dash/profile">
              <Button className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 h-auto w-full flex justify-between items-center">
                <span>Open Profile and Availability</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
