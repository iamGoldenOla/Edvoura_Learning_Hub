"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  CreditCard,
  MessageCircle,
  ClipboardList,
  Layers,
  LineChart,
  ShieldAlert,
  Settings,
  ArrowRight,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

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

type ChildSummary = {
  childUserId: string;
  alerts: Array<{
    id: string;
    title: string;
    detail: string;
  }>;
  upcomingLessons: number;
  attendanceRate: number | null;
  pendingAssignments: number;
  completionRate: number | null;
  activeClasses: number;
  gradedSubmissions: number;
  averageScore: number | null;
  snapshotCount: number;
};

const formatPercent = (value: number | null) =>
  value != null ? `${Math.round(value)}%` : "--";

export default function ParentDashboardClient({
  parentName,
  linkedChildren,
  billingSummary,
  childSummaries,
}: {
  parentName: string;
  linkedChildren: ParentChild[];
  billingSummary: BillingSummary | null;
  childSummaries: ChildSummary[];
}) {
  const [activeChildId, setActiveChildId] = useState<string>(
    linkedChildren[0]?.userId ?? "",
  );
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [insightData, setInsightData] = useState<any>(null);
  const [insightError, setInsightError] = useState("");

  const activeChild = useMemo(
    () =>
      linkedChildren.find((child) => child.userId === activeChildId) ??
      linkedChildren[0] ??
      null,
    [linkedChildren, activeChildId],
  );

  const activeSummary = useMemo(
    () =>
      childSummaries.find(
        (summary) => summary.childUserId === activeChild?.userId,
      ) ??
      childSummaries[0] ??
      null,
    [activeChild?.userId, childSummaries],
  );

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
                  onClick={() => {
                    setActiveChildId(child.userId);
                    setInsightData(null);
                    setInsightError("");
                  }}
                  className={`rounded-xl border-[3px] px-4 py-2 text-sm font-black transition-all hover:translate-x-[1px] hover:translate-y-[1px] ${
                    activeChild?.userId === child.userId
                      ? "border-dark bg-dark text-white shadow-[3px_3px_0px_#060E1C] hover:shadow-none"
                      : "border-dark bg-white text-dark shadow-[3px_3px_0px_#060E1C] hover:shadow-none"
                  }`}
                >
                  {child.fullName ?? "Unnamed Child"}{" "}
                  <span className="opacity-60 font-bold ml-1">
                    ({child.gradeLevelName})
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs font-bold text-dark/60">
              No children linked yet. Use Manage Children to add one.
            </p>
          )}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Child Snapshot */}
        <div className="lg:col-span-2 border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-amber-100">
            <h2 className="text-2xl font-black text-dark tracking-tight">
              Child Snapshot
            </h2>
          </div>
          <div className="p-6 sm:p-8">
            {activeChild ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
                    Child Name
                  </p>
                  <p className="mt-1 text-xl font-black text-dark">
                    {activeChild.fullName ?? "Unnamed Child"}
                  </p>
                </div>
                <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
                    Grade
                  </p>
                  <p className="mt-1 text-xl font-black text-dark">
                    {activeChild.gradeLevelName}
                  </p>
                </div>
                <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
                    Learner Band
                  </p>
                  <p className="mt-1 text-xl font-black text-dark">
                    {activeChild.gradeBandName}
                  </p>
                </div>
                <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
                    School
                  </p>
                  <p className="mt-1 text-xl font-black text-dark truncate">
                    {activeChild.schoolName ?? "Not set"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-8 text-center text-sm font-bold text-dark/60">
                Add a child profile to unlock this parent dashboard.
              </div>
            )}
          </div>
        </div>

        {/* Z.Ai Insights Card */}
        {activeChild && activeSummary && (
          <div className="lg:col-span-3 border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden mt-2 mb-2">
            <div className="p-6 border-b-[4px] border-dark bg-yellow/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white border-[3px] border-dark rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#060E1C]">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-black text-dark tracking-tight">
                  Z.Ai Weekly Insights
                </h2>
              </div>

              <Button
                disabled={isGeneratingInsight}
                onClick={async () => {
                  setIsGeneratingInsight(true);
                  setInsightError("");
                  try {
                    const res = await fetch("/api/ai/parent-report", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        childName: activeChild.fullName ?? "Your child",
                        reportPeriod: "This Week",
                        performanceSummary: `Attendance: ${activeSummary.attendanceRate}%, Avg Score: ${activeSummary.averageScore}%, Completed: ${activeSummary.completionRate}%`,
                        highlights: [
                          "Consistent attendance",
                          "Good quiz participation",
                        ],
                        concerns: activeSummary.alerts.map((a) => a.detail),
                      }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setInsightData(data.content);
                    } else {
                      setInsightError(
                        data.error || "Failed to generate insight.",
                      );
                    }
                  } catch (err: any) {
                    setInsightError(err.message || "Unknown error");
                  } finally {
                    setIsGeneratingInsight(false);
                  }
                }}
                className="bg-yellow border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-2 h-auto"
              >
                {isGeneratingInsight
                  ? "Z.Ai is analyzing..."
                  : "Generate AI Report"}
              </Button>
            </div>

            {(insightData || insightError) && (
              <div className="p-6 sm:p-8 bg-blue-50/50">
                {insightError ? (
                  <p className="text-rose-600 font-bold">{insightError}</p>
                ) : insightData ? (
                  <div className="space-y-6">
                    <p className="text-lg font-bold text-dark/80 leading-relaxed">
                      {insightData.summary}
                    </p>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="rounded-2xl border-[3px] border-dark bg-emerald-100 p-5 shadow-[4px_4px_0px_#060E1C]">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60 mb-3">
                          Highlights
                        </p>
                        <ul className="list-disc pl-5 space-y-1 font-bold text-dark text-sm">
                          {insightData.praisePoints.map(
                            (point: string, i: number) => (
                              <li key={i}>{point}</li>
                            ),
                          )}
                        </ul>
                      </div>
                      <div className="rounded-2xl border-[3px] border-dark bg-amber-100 p-5 shadow-[4px_4px_0px_#060E1C]">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60 mb-3">
                          Areas to Focus On
                        </p>
                        <ul className="list-disc pl-5 space-y-1 font-bold text-dark text-sm">
                          {insightData.improvementAreas.map(
                            (point: string, i: number) => (
                              <li key={i}>{point}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>
                    <div className="rounded-2xl border-[3px] border-dark bg-white p-5 shadow-[4px_4px_0px_#060E1C]">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60 mb-3">
                        Suggested Question to ask your child
                      </p>
                      <p className="font-bold text-dark italic">
                        "{insightData.suggestedConversationStarter}"
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* Notifications */}
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-rose-100 flex items-center justify-between">
            <h2 className="text-2xl font-black text-dark tracking-tight">
              Alerts
            </h2>
            <div className="h-10 w-10 bg-white border-[3px] border-dark rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#060E1C]">
              <Bell className="h-5 w-5 text-dark" />
            </div>
          </div>
          <div className="p-6 space-y-4">
            {activeSummary?.alerts.length ? (
              activeSummary.alerts.map((alertItem) => (
                <div
                  key={alertItem.title}
                  className="rounded-2xl border-[3px] border-dark bg-rose-50 p-4 shadow-[4px_4px_0px_#060E1C]"
                >
                  <p className="flex items-center gap-2 text-sm font-black text-rose-600 uppercase tracking-widest">
                    <ShieldAlert className="h-4 w-4" />
                    {alertItem.title}
                  </p>
                  <p className="mt-2 text-sm font-bold text-dark/80">
                    {alertItem.detail}
                  </p>
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
            <h2 className="text-2xl font-black text-dark tracking-tight">
              Lessons & Attendance
            </h2>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
                  Upcoming Lessons
                </p>
                <p className="mt-2 text-4xl font-black text-dark">
                  {activeSummary?.upcomingLessons ?? 0}
                </p>
              </div>
              <div className="rounded-2xl border-[3px] border-dark bg-emerald-100 p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
                  Attendance Rate
                </p>
                <p className="mt-2 text-4xl font-black text-emerald-800">
                  {formatPercent(activeSummary?.attendanceRate ?? null)}
                </p>
              </div>
            </div>
            <Link
              href="/dash/parent/monitor"
              className="flex items-center justify-between rounded-xl border-[3px] border-dark bg-dark text-white px-5 py-4 text-sm font-black hover:bg-yellow hover:text-dark shadow-[4px_4px_0px_#060E1C] hover:shadow-[4px_4px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] transition-all hover:shadow-none active:scale-95"
            >
              <span>View Timetable & History</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Homework & Progress */}
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-blue-100 flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">
              Homework & Progress
            </h2>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
                  Assignments Due
                </p>
                <p className="mt-2 text-4xl font-black text-dark">
                  {activeSummary?.pendingAssignments ?? 0}
                </p>
              </div>
              <div className="rounded-2xl border-[3px] border-dark bg-blue-100 p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
                  Completion Rate
                </p>
                <p className="mt-2 text-4xl font-black text-blue-800">
                  {formatPercent(activeSummary?.completionRate ?? null)}
                </p>
              </div>
            </div>
            <Link
              href="/dash/parent/reports"
              className="flex items-center justify-between rounded-xl border-[3px] border-dark bg-dark text-white px-5 py-4 text-sm font-black hover:bg-yellow hover:text-dark shadow-[4px_4px_0px_#060E1C] hover:shadow-[4px_4px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] transition-all hover:shadow-none active:scale-95"
            >
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
            <LineChart className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">
              Progress Signals
            </h2>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border-[3px] border-dark bg-purple-100 p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
                  <ClipboardList className="h-4 w-4" /> Graded Work
                </p>
                <p className="mt-2 text-3xl font-black text-dark">
                  {activeSummary?.gradedSubmissions ?? 0}
                </p>
              </div>
              <div className="rounded-2xl border-[3px] border-dark bg-blue-100 p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
                  <Layers className="h-4 w-4" /> Active Classes
                </p>
                <p className="mt-2 text-3xl font-black text-dark">
                  {activeSummary?.activeClasses ?? 0}
                </p>
              </div>
              <div className="rounded-2xl border-[3px] border-dark bg-rose-100 p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
                  <BookOpen className="h-4 w-4" /> Avg Score
                </p>
                <p className="mt-2 text-3xl font-black text-dark">
                  {formatPercent(activeSummary?.averageScore ?? null)}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
                  Unread Alerts
                </p>
                <p className="mt-2 text-2xl font-black text-dark">
                  {activeSummary?.alerts.length ?? 0}
                </p>
              </div>
              <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
                  Progress Snapshots
                </p>
                <p className="mt-2 text-2xl font-black text-dark">
                  {activeSummary?.snapshotCount ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Billing */}
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-emerald-100 flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">
              Billing
            </h2>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              <div className="rounded-2xl border-[3px] border-dark bg-white p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
                  Plan
                </p>
                <p className="mt-1 text-lg font-black text-dark">
                  {subscription?.planName ?? "No active plan"}
                </p>
                <p className="mt-1 text-xs font-bold text-dark/60">
                  Status: {subscription?.status ?? "inactive"}
                </p>
              </div>
              <div className="rounded-2xl border-[3px] border-dark bg-white p-5 shadow-[4px_4px_0px_#060E1C]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
                  Latest Invoice
                </p>
                <p className="mt-1 text-xl font-black text-dark">
                  {latestInvoice
                    ? `${(latestInvoice.amountDueMinor / 100).toLocaleString()} ${subscription?.planCurrencyCode ?? "NGN"}`
                    : "No invoice yet"}
                </p>
                <p
                  className={`mt-1 inline-flex rounded-md border-[2px] border-dark px-2 py-1 text-[10px] font-black uppercase tracking-widest ${latestInvoice?.status === "paid" ? "bg-emerald-300 text-dark" : "bg-slate-200 text-dark"}`}
                >
                  {latestInvoice?.status ?? "n/a"}
                </p>
              </div>
            </div>
            <Link
              href="/dash/parent/billing"
              className="flex items-center justify-between rounded-xl border-[3px] border-dark bg-dark text-white px-5 py-4 text-sm font-black hover:bg-yellow hover:text-dark shadow-[4px_4px_0px_#060E1C] hover:shadow-[4px_4px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] transition-all hover:shadow-none active:scale-95"
            >
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
            <h2 className="text-2xl font-black text-dark tracking-tight">
              Messages
            </h2>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm font-bold text-dark/70 mb-6">
              Message tutors for lesson concerns, progress checks, and support
              follow-up.
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
            <h2 className="text-2xl font-black text-dark tracking-tight">
              Consent & Settings
            </h2>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm font-bold text-dark/70 mb-6">
              Keep account preferences, alerts, and child access controls up to
              date.
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
