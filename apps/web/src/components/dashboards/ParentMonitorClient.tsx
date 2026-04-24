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
  date: string;
  time: string;
  tutor: string;
  status: 'upcoming' | 'completed' | 'missed';
};

type AttendanceItem = {
  id: string;
  date: string;
  classTitle: string;
  status: 'present' | 'late' | 'absent';
};

const buildLessons = (child: ParentChild | null, seed: number): LessonItem[] => {
  if (!child) return [];
  return [
    {
      id: `${child.userId}-lesson-1`,
      title: `${child.gradeLevelName} Mathematics`,
      date: 'Mon',
      time: '16:00',
      tutor: 'Mrs. Adekunle',
      status: 'upcoming',
    },
    {
      id: `${child.userId}-lesson-2`,
      title: 'English Composition',
      date: 'Wed',
      time: '15:30',
      tutor: 'Mr. Olatunji',
      status: seed % 3 === 0 ? 'missed' : 'completed',
    },
    {
      id: `${child.userId}-lesson-3`,
      title: 'Science Lab Skills',
      date: 'Fri',
      time: '17:00',
      tutor: 'Ms. Bassey',
      status: 'upcoming',
    },
  ];
};

const buildAttendance = (child: ParentChild | null, seed: number): AttendanceItem[] => {
  if (!child) return [];
  return [
    { id: `${child.userId}-a1`, date: '2026-04-11', classTitle: 'Mathematics', status: 'present' },
    { id: `${child.userId}-a2`, date: '2026-04-10', classTitle: 'English', status: seed % 4 === 0 ? 'late' : 'present' },
    { id: `${child.userId}-a3`, date: '2026-04-09', classTitle: 'Science', status: seed % 3 === 0 ? 'absent' : 'present' },
  ];
};

export default function ParentMonitorClient({ linkedChildren }: { linkedChildren: ParentChild[] }) {
  const [activeChildId, setActiveChildId] = useState<string>(linkedChildren[0]?.userId ?? '');
  const activeChild = useMemo(
    () => linkedChildren.find((child) => child.userId === activeChildId) ?? linkedChildren[0] ?? null,
    [linkedChildren, activeChildId],
  );
  const activeIndex = Math.max(0, linkedChildren.findIndex((child) => child.userId === activeChild?.userId));

  const lessons = useMemo(() => buildLessons(activeChild, activeIndex + 2), [activeChild, activeIndex]);
  const attendance = useMemo(() => buildAttendance(activeChild, activeIndex + 5), [activeChild, activeIndex]);
  const presentCount = attendance.filter((item) => item.status === 'present').length;
  const absentCount = attendance.filter((item) => item.status === 'absent').length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-6 sm:p-8 pb-20">
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
          <p className="mt-2 text-4xl font-black text-dark">{lessons.filter((lesson) => lesson.status === 'upcoming').length}</p>
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
        {/* Timetable */}
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-amber-100 flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">Upcoming Lessons / Timetable</h2>
          </div>
          <div className="p-6 sm:p-8">
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#060E1C]">
                  <p className="text-lg font-black text-dark">{lesson.title}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60 mt-1">
                    {lesson.date} at {lesson.time} | Tutor: {lesson.tutor}
                  </p>
                  <span className={`mt-3 inline-block rounded-xl border-[2px] border-dark px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_#060E1C] ${lesson.status === 'upcoming' ? 'bg-amber-100 text-amber-900' : lesson.status === 'completed' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                    {lesson.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-blue-100 flex items-center gap-3">
            <Clock4 className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">Attendance History</h2>
          </div>
          <div className="p-6 sm:p-8">
            <div className="space-y-4">
              {attendance.map((entry) => (
                <div key={entry.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#060E1C]">
                  <div>
                    <p className="text-lg font-black text-dark">{entry.classTitle}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60 mt-1">{entry.date}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-xl border-[2px] border-dark px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_#060E1C] ${
                      entry.status === 'present'
                        ? 'bg-emerald-100 text-emerald-900'
                        : entry.status === 'late'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {entry.status === 'present' ? <CheckCircle2 className="h-4 w-4" /> : null}
                    {entry.status === 'late' ? <AlertTriangle className="h-4 w-4" /> : null}
                    {entry.status === 'absent' ? <XCircle className="h-4 w-4" /> : null}
                    {entry.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-6 border-t-[4px] border-dark/10">
        <Link href="/dash/parent/messages">
          <Button className="bg-yellow border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 h-auto text-base">
            Message Tutor About Attendance
          </Button>
        </Link>
        <Link href="/dash/parent/reports">
          <Button className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 h-auto text-base">
            Open Homework & Progress Reports
          </Button>
        </Link>
      </div>
    </div>
  );
}
