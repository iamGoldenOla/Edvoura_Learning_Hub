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
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-edvoura-navy to-slate-900 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Parent Dashboard</h1>
            <p className="mt-2 text-sm text-slate-200">
              Welcome, {parentName}. Track each child with confidence, visibility, and control.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dash/parent/messages">
              <Button variant="secondary" className="text-xs">
                Message Tutor
              </Button>
            </Link>
            <Link href="/dash/parent/children">
              <Button variant="outline" className="border-slate-500 text-xs text-white hover:bg-slate-800">
                Manage Children
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Users className="h-3.5 w-3.5" />
            Switch Child
          </span>
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
                {child.fullName ?? 'Unnamed Child'} ({child.gradeLevelName})
              </button>
            ))
          ) : (
            <p className="text-xs text-slate-600">No children linked yet. Use Manage Children to add one.</p>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Child Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            {activeChild ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Child Name</p>
                  <p className="font-semibold text-slate-900">{activeChild.fullName ?? 'Unnamed Child'}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Grade</p>
                  <p className="font-semibold text-slate-900">{activeChild.gradeLevelName}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Learner Band</p>
                  <p className="font-semibold text-slate-900">{activeChild.gradeBandName}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">School</p>
                  <p className="font-semibold text-slate-900">{activeChild.schoolName ?? 'Not set'}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">Add a child profile to unlock this parent dashboard.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alertItem) => (
              <div key={alertItem.title} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {alertItem.title}
                </p>
                <p className="mt-1 text-xs text-amber-800">{alertItem.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-600" />
              Lessons & Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Upcoming Lessons</p>
                <p className="text-xl font-bold text-slate-900">{2 + (activeIndex % 3)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Attendance Rate</p>
                <p className="text-xl font-bold text-slate-900">{engagement.attendanceRate}%</p>
              </div>
            </div>
            <Link href="/dash/parent/monitor">
              <Button variant="outline" className="w-full text-xs">
                View Lesson Timetable & Attendance History
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-slate-600" />
              Homework & Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Assignments Due</p>
                <p className="text-xl font-bold text-slate-900">{1 + (activeIndex % 4)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Completion Rate</p>
                <p className="text-xl font-bold text-slate-900">{engagement.assignmentCompletion}%</p>
              </div>
            </div>
            <Link href="/dash/parent/reports">
              <Button variant="outline" className="w-full text-xs">
                Review Grades, Feedback, and Report Cards
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-slate-600" />
              Rewards & Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <Trophy className="h-3.5 w-3.5" />
                  Child XP
                </p>
                <p className="text-xl font-bold text-slate-900">{engagement.xp}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <Star className="h-3.5 w-3.5" />
                  Badges
                </p>
                <p className="text-xl font-bold text-slate-900">{engagement.badges}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <Flame className="h-3.5 w-3.5" />
                  Streak
                </p>
                <p className="text-xl font-bold text-slate-900">{engagement.streak} days</p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Challenge Completions</p>
                <p className="text-xl font-bold text-slate-900">{engagement.challengesCompleted}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Achievement Progress</p>
                <p className="text-xl font-bold text-slate-900">{engagement.achievementProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-slate-600" />
              Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Plan</p>
              <p className="font-semibold text-slate-900">{subscription?.planName ?? 'No active plan'}</p>
              <p className="text-xs text-slate-600">Status: {subscription?.status ?? 'inactive'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Latest Invoice</p>
              <p className="font-semibold text-slate-900">
                {latestInvoice
                  ? `${(latestInvoice.amountDueMinor / 100).toLocaleString()} ${subscription?.planCurrencyCode ?? 'NGN'}`
                  : 'No invoice yet'}
              </p>
              <p className="text-xs text-slate-600">{latestInvoice?.status ?? 'n/a'}</p>
            </div>
            <Link href="/dash/parent/billing">
              <Button variant="outline" className="w-full text-xs">
                Manage Subscription & Payment History
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-slate-600" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Message tutors for lesson concerns, progress checks, and support follow-up.
            </p>
            <div className="mt-3">
              <Link href="/dash/parent/messages">
                <Button variant="primary" className="text-xs">
                  Open Parent Messaging
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-600" />
              Consent & Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">
              Keep account preferences, alerts, and child access controls up to date.
            </p>
            <Link href="/dash/profile">
              <Button variant="outline" className="text-xs">
                Open Profile and Availability
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
