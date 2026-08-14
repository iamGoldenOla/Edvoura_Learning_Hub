'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BarChart3, BookOpenCheck, ClipboardList, Layers, Sparkles, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ParentChild = {
  userId: string;
  fullName: string | null;
  gradeLevelName: string;
};

export type SubjectReport = {
  subject: string;
  score: number | null;
  tutorFeedback: string | null;
  assignmentsDue: number;
  assignmentsSubmitted: number;
};

export type ParentChildReport = {
  childUserId: string;
  averageScore: number | null;
  totalAssignmentsDue: number;
  totalAssignmentsSubmitted: number;
  completionRate: number | null;
  activeClasses: number;
  gradedSubmissions: number;
  snapshotCount: number;
  latestAssignmentCompletionRate: number | null;
  subjectReports: SubjectReport[];
};

const formatPercent = (value: number | null) => (value != null ? `${value}%` : '--');

import { ParentNavHeader } from '@/components/dashboards/parent/ParentNavHeader';

export default function ParentReportsClient({
  linkedChildren,
  childReports,
}: {
  linkedChildren: ParentChild[];
  childReports: ParentChildReport[];
}) {
  const [activeChildId, setActiveChildId] = useState<string>(linkedChildren[0]?.userId ?? '');
  const activeChild = useMemo(
    () => linkedChildren.find((child) => child.userId === activeChildId) ?? linkedChildren[0] ?? null,
    [linkedChildren, activeChildId],
  );
  const activeReport = useMemo(
    () => childReports.find((report) => report.childUserId === activeChild?.userId) ?? childReports[0] ?? null,
    [activeChild?.userId, childReports],
  );
  const reports = activeReport?.subjectReports ?? [];
  const averageScore = activeReport?.averageScore ?? null;
  const totalDue = activeReport?.totalAssignmentsDue ?? 0;
  const totalSubmitted = activeReport?.totalAssignmentsSubmitted ?? 0;
  const completionRate = activeReport?.completionRate ?? null;
  const latestCompletion = activeReport?.latestAssignmentCompletionRate ?? null;

  return (
    <div className="mx-auto max-w-[1680px] space-y-10 p-6 sm:p-8 pb-24">
      <ParentNavHeader
        title="Homework & Progress"
        subtitle="Review assignments, grades, tutor feedback, and engagement progress for each child."
      />
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
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
          <p className="mt-2 text-4xl font-black text-dark">{formatPercent(averageScore)}</p>
        </div>
        <div className="rounded-[28px] border-[4px] border-dark bg-yellow p-6 shadow-[6px_6px_0px_#060E1C]">
          <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Assignments Submitted</p>
          <p className="mt-2 text-4xl font-black text-dark">
            {totalSubmitted}/{totalDue}
          </p>
        </div>
        <div className="rounded-[28px] border-[4px] border-dark bg-blue-100 p-6 shadow-[6px_6px_0px_#060E1C]">
          <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Completion Rate</p>
          <p className="mt-2 text-4xl font-black text-dark">{formatPercent(completionRate)}</p>
        </div>
        <div className="rounded-[28px] border-[4px] border-dark bg-amber-100 p-6 shadow-[6px_6px_0px_#060E1C]">
          <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Active Classes</p>
          <p className="mt-2 text-4xl font-black text-dark">{activeReport?.activeClasses ?? 0}</p>
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
            {reports.length > 0 ? (
              reports.map((report) => (
                <div key={report.subject} className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#060E1C]">
                  <div className="flex items-center justify-between border-b-[3px] border-dark/10 pb-3 mb-3">
                    <p className="text-xl font-black text-dark">{report.subject}</p>
                    <span
                      className={`inline-block rounded-xl border-[2px] border-dark px-3 py-1 text-sm font-black shadow-[2px_2px_0px_#060E1C] ${
                        report.score == null
                          ? 'bg-slate-200 text-dark'
                          : report.score >= 80
                            ? 'bg-emerald-100'
                            : report.score >= 60
                              ? 'bg-amber-100'
                              : 'bg-rose-100'
                      }`}
                    >
                      {formatPercent(report.score)}
                    </span>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-widest text-dark/60">
                    <span>Assignments: {report.assignmentsSubmitted}/{report.assignmentsDue}</span>
                  </div>
                  <p className="text-sm font-bold text-dark/80 leading-relaxed">
                    {report.tutorFeedback ?? 'No tutor feedback has been recorded yet for this subject.'}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-8 text-center text-sm font-bold text-dark/60">
                No graded work or subject-level report data is available yet for this child.
              </div>
            )}
          </div>
        </div>

        {/* Rewards & Engagement */}
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden flex flex-col">
          <div className="p-6 border-b-[4px] border-dark bg-yellow/20 flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">Progress Signals</h2>
          </div>
          <div className="p-6 sm:p-8 flex flex-col flex-1 gap-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl border-[3px] border-dark bg-purple-100 p-5 text-center shadow-[4px_4px_0px_#060E1C]">
                <ClipboardList className="mx-auto h-6 w-6 text-dark" />
                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-dark/60">Graded Work</p>
                <p className="mt-1 text-2xl font-black text-dark">{activeReport?.gradedSubmissions ?? 0}</p>
              </div>
              <div className="rounded-2xl border-[3px] border-dark bg-sky-100 p-5 text-center shadow-[4px_4px_0px_#060E1C]">
                <Layers className="mx-auto h-6 w-6 text-dark" />
                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-dark/60">Active Classes</p>
                <p className="mt-1 text-2xl font-black text-dark">{activeReport?.activeClasses ?? 0}</p>
              </div>
              <div className="rounded-2xl border-[3px] border-dark bg-rose-100 p-5 text-center shadow-[4px_4px_0px_#060E1C]">
                <Sparkles className="mx-auto h-6 w-6 text-dark" />
                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-dark/60">Snapshots</p>
                <p className="mt-1 text-2xl font-black text-dark">{activeReport?.snapshotCount ?? 0}</p>
              </div>
            </div>
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-6 shadow-[4px_4px_0px_#060E1C] mt-auto">
              <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Latest Assignment Completion</p>
              <div className="mt-3 h-4 w-full rounded-full border-[3px] border-dark bg-white overflow-hidden shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)]">
                <div
                  className="h-full bg-emerald-400 border-r-[3px] border-dark"
                  style={{ width: `${Math.max(0, Math.min(100, latestCompletion ?? 0))}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-bold text-dark/70 text-right">{formatPercent(latestCompletion)}</p>
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
