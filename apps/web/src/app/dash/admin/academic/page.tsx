import Link from 'next/link';
import { BookMarked, BookOpenCheck, CalendarClock, Layers, ShieldCheck } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminAcademicSetupPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">Academic Setup</h1>
        <p className="mt-1 text-sm text-slate-600">
          Configure subjects, curriculum, grade bands, and lesson quality controls.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Subjects', value: '28', icon: BookMarked },
          { label: 'Curriculum Tracks', value: '9', icon: Layers },
          { label: 'Live Lessons This Week', value: '342', icon: CalendarClock },
          { label: 'Quality Flags', value: '6', icon: ShieldCheck },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <item.icon className="h-5 w-5 text-blue-600" />
              <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">{item.label}</p>
              <p className="text-2xl font-bold text-slate-900">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Curriculum and Grade-Band Controls</CardTitle>
          <Link
            href="/dash/admin/settings?tab=academic"
            className="inline-flex items-center justify-center rounded-md bg-edvoura-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-edvoura-navy-light"
          >
            Publish Changes
          </Link>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="rounded-lg border border-slate-200 p-3">Subject and syllabus mapping by grade band</div>
          <div className="rounded-lg border border-slate-200 p-3">Lesson oversight: completion rate and missed sessions</div>
          <div className="rounded-lg border border-slate-200 p-3">Assignment/report oversight across classes and tutors</div>
          <div className="rounded-lg border border-slate-200 p-3">Spelling bee event setup and monitor controls</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Operational Actions</CardTitle>
          <BookOpenCheck className="h-5 w-5 text-slate-500" />
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/dash/admin/academic?action=add-subject" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
            Add Subject
          </Link>
          <Link href="/dash/admin/academic?action=map-grade-band" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
            Map Grade Band
          </Link>
          <Link href="/dash/admin/lessons" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
            Review Lesson Compliance
          </Link>
          <Link href="/dash/admin/engagement?tab=spelling-bee" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
            Open Spelling Bee Console
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
