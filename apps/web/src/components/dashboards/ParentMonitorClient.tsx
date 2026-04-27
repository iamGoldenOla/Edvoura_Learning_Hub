'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CalendarDays, CheckCircle2, Clock4, XCircle, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ParentChild = {
  userId: string;
  fullName: string | null;
  gradeLevelName: string;
};

type LessonItem = {
  id: string;
  title: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  status: string;
  classTitle: string;
  subjectName: string;
  tutorName: string;
  childUserId: string;
};

type AttendanceItem = {
  id: string;
  lessonTitle: string;
  classTitle: string;
  scheduledAt: string;
  status: string;
  childUserId: string;
};

const formatDate = (iso: string) => {
  if (!iso) return '--';
  try {
    return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return '--';
  }
};

const formatTime = (iso: string) => {
  if (!iso) return '--';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--';
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'scheduled': return 'upcoming';
    case 'live': return 'live';
    case 'completed': return 'completed';
    case 'cancelled': return 'cancelled';
    default: return status;
  }
};

const statusColor = (status: string) => {
  const normalized = statusLabel(status);
  switch (normalized) {
    case 'upcoming':
    case 'live':
      return 'bg-amber-100 text-amber-900';
    case 'completed':
      return 'bg-emerald-100 text-emerald-900';
    default:
      return 'bg-rose-100 text-rose-900';
  }
};

const attendanceColor = (status: string) => {
  switch (status) {
    case 'present': return 'bg-emerald-100 text-emerald-900';
    case 'late': return 'bg-amber-100 text-amber-900';
    default: return 'bg-rose-100 text-rose-900';
  }
};

export default function ParentMonitorClient({
  linkedChildren,
  lessons,
  attendance,
}: {
  linkedChildren: ParentChild[];
  lessons: LessonItem[];
  attendance: AttendanceItem[];
}) {
  const [activeChildId, setActiveChildId] = useState<string>(linkedChildren[0]?.userId ?? '');
  const activeChild = useMemo(
    () => linkedChildren.find((child) => child.userId === activeChildId) ?? linkedChildren[0] ?? null,
    [linkedChildren, activeChildId],
  );

  // Filter data for active child
  const childLessons = useMemo(
    () => (activeChild ? lessons.filter((l) => l.childUserId === activeChild.userId) : []),
    [lessons, activeChild],
  );
  const childAttendance = useMemo(
    () => (activeChild ? attendance.filter((a) => a.childUserId === activeChild.userId) : []),
    [attendance, activeChild],
  );

  const upcomingCount = childLessons.filter((l) => l.status === 'scheduled' || l.status === 'live').length;
  const presentCount = childAttendance.filter((a) => a.status === 'present').length;
  const absentCount = childAttendance.filter((a) => a.status === 'absent').length;

  return (
    <div className="mx-auto max-w-[1680px] space-y-10 p-6 sm:p-8 pb-24">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-yellow/20">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
            Lessons & Attendance
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Monitor timetable, lesson participation, and attendance risk for each child.
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

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[28px] border-[4px] border-dark bg-blue-100 p-6 shadow-[6px_6px_0px_#060E1C]">
          <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Upcoming Lessons</p>
          <p className="mt-2 text-4xl font-black text-dark">{upcomingCount}</p>
        </div>
        <div className="rounded-[28px] border-[4px] border-dark bg-emerald-100 p-6 shadow-[6px_6px_0px_#060E1C]">
          <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Present in Recent Lessons</p>
          <p className="mt-2 text-4xl font-black text-dark">{presentCount}</p>
        </div>
        <div className="rounded-[28px] border-[4px] border-dark bg-rose-100 p-6 shadow-[6px_6px_0px_#060E1C]">
          <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Absence Alerts</p>
          <p className="mt-2 text-4xl font-black text-rose-700">{absentCount}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Timetable / Lessons */}
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-amber-100 flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">Lessons</h2>
          </div>
          <div className="p-6 sm:p-8">
            {childLessons.length > 0 ? (
              <div className="space-y-4">
                {childLessons.map((lesson) => (
                  <div key={lesson.id} className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#060E1C]">
                    <p className="text-lg font-black text-dark">{lesson.title}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60 mt-1">
                      {lesson.subjectName} — {lesson.classTitle} | Tutor: {lesson.tutorName}
                    </p>
                    <p className="text-xs font-bold text-dark/50 mt-2">
                      {formatDate(lesson.scheduledStartAt)} at {formatTime(lesson.scheduledStartAt)}
                    </p>
                    <span className={`mt-3 inline-block rounded-xl border-[2px] border-dark px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_#060E1C] ${statusColor(lesson.status)}`}>
                      {statusLabel(lesson.status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-10 text-center flex flex-col items-center">
                <CalendarDays className="h-8 w-8 text-dark/30 mb-4" />
                <p className="text-sm font-bold text-dark/60 italic">No lessons scheduled yet. They will appear here once a tutor creates lessons.</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance History */}
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-blue-100 flex items-center gap-3">
            <Clock4 className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">Attendance History</h2>
          </div>
          <div className="p-6 sm:p-8">
            {childAttendance.length > 0 ? (
              <div className="space-y-4">
                {childAttendance.map((entry) => (
                  <div key={entry.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#060E1C]">
                    <div>
                      <p className="text-lg font-black text-dark">{entry.lessonTitle}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60 mt-1">
                        {entry.classTitle} — {formatDate(entry.scheduledAt)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-2 rounded-xl border-[2px] border-dark px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_#060E1C] ${attendanceColor(entry.status)}`}
                    >
                      {entry.status === 'present' ? <CheckCircle2 className="h-4 w-4" /> : null}
                      {entry.status === 'late' ? <AlertTriangle className="h-4 w-4" /> : null}
                      {entry.status === 'absent' ? <XCircle className="h-4 w-4" /> : null}
                      {entry.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-10 text-center flex flex-col items-center">
                <Clock4 className="h-8 w-8 text-dark/30 mb-4" />
                <p className="text-sm font-bold text-dark/60 italic">No attendance records yet. Records will appear after lessons are held.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-6 border-t-[4px] border-dark/10">
        <Link href="/dash/parent/messages">
          <Button className="bg-yellow border-[3px] border-dark !text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 h-auto text-base">
            Message Tutor About Attendance
          </Button>
        </Link>
        <Link href="/dash/parent/reports">
          <Button className="bg-white border-[3px] border-dark !text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 h-auto text-base">
            Open Homework & Progress Reports
          </Button>
        </Link>
      </div>
    </div>
  );
}
