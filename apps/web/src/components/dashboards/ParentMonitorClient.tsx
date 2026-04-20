'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CalendarDays, CheckCircle2, Clock4, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-edvoura-navy">Lessons & Attendance</h1>
        <p className="mt-2 text-sm text-slate-600">
          Monitor timetable, lesson participation, and attendance risk for each child.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
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
                {child.fullName ?? 'Unnamed Child'}
              </button>
            ))
          ) : (
            <p className="text-xs text-slate-600">No child profiles linked yet.</p>
          )}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Upcoming Lessons</p>
            <p className="text-2xl font-bold text-slate-900">{lessons.filter((lesson) => lesson.status === 'upcoming').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Present in Recent Lessons</p>
            <p className="text-2xl font-bold text-slate-900">{presentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Absence Alerts</p>
            <p className="text-2xl font-bold text-rose-700">{absentCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-600" />
              Upcoming Lessons / Timetable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="font-semibold text-slate-900">{lesson.title}</p>
                <p className="text-xs text-slate-600">
                  {lesson.date} at {lesson.time} | Tutor: {lesson.tutor}
                </p>
                <p className="mt-1 text-xs text-slate-500 capitalize">Status: {lesson.status}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock4 className="h-4 w-4 text-slate-600" />
              Attendance History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {attendance.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="font-semibold text-slate-900">{entry.classTitle}</p>
                  <p className="text-xs text-slate-600">{entry.date}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                    entry.status === 'present'
                      ? 'bg-emerald-100 text-emerald-700'
                      : entry.status === 'late'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {entry.status === 'present' ? <CheckCircle2 className="h-3 w-3" /> : null}
                  {entry.status === 'late' ? <AlertTriangle className="h-3 w-3" /> : null}
                  {entry.status === 'absent' ? <XCircle className="h-3 w-3" /> : null}
                  {entry.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/dash/parent/messages">
          <Button variant="primary" className="text-xs">
            Message Tutor About Attendance
          </Button>
        </Link>
        <Link href="/dash/parent/reports">
          <Button variant="outline" className="text-xs">
            Open Homework & Progress Reports
          </Button>
        </Link>
      </div>
    </div>
  );
}
