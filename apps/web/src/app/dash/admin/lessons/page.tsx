import Link from 'next/link';
import { CalendarClock, ShieldCheck, Video } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLessonsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">Lesson Oversight</h1>
        <p className="mt-1 text-sm text-slate-600">
          Oversight for scheduled/live lessons, attendance integrity, and delivery compliance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5"><CalendarClock className="h-5 w-5 text-blue-600" /><p className="mt-2 text-xs text-slate-500">Lessons Today</p><p className="text-2xl font-bold text-slate-900">342</p></CardContent></Card>
        <Card><CardContent className="p-5"><Video className="h-5 w-5 text-indigo-600" /><p className="mt-2 text-xs text-slate-500">Live Sessions</p><p className="text-2xl font-bold text-slate-900">28</p></CardContent></Card>
        <Card><CardContent className="p-5"><ShieldCheck className="h-5 w-5 text-emerald-600" /><p className="mt-2 text-xs text-slate-500">Compliance Score</p><p className="text-2xl font-bold text-slate-900">94%</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/dash/admin/lessons?action=live-monitor" className="inline-flex items-center justify-center rounded-md bg-edvoura-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-edvoura-navy-light">
            Open Live Session Monitor
          </Link>
          <Link href="/dash/admin/lessons?action=missed-lessons" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
            Review Missed Lessons
          </Link>
          <Link href="/dash/admin/notifications?action=lesson-reminders" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
            Trigger Lesson Reminder Notifications
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
