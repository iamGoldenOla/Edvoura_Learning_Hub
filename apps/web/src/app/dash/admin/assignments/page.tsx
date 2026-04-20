import Link from 'next/link';
import { ClipboardCheck, FileText, Timer } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminAssignmentsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">Assignment Oversight</h1>
        <p className="mt-1 text-sm text-slate-600">
          Monitor assignment publication, submissions, grading queues, and overdue workload.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5"><FileText className="h-5 w-5 text-blue-600" /><p className="mt-2 text-xs text-slate-500">Active Assignments</p><p className="text-2xl font-bold text-slate-900">518</p></CardContent></Card>
        <Card><CardContent className="p-5"><ClipboardCheck className="h-5 w-5 text-indigo-600" /><p className="mt-2 text-xs text-slate-500">Pending Grading</p><p className="text-2xl font-bold text-slate-900">84</p></CardContent></Card>
        <Card><CardContent className="p-5"><Timer className="h-5 w-5 text-rose-600" /><p className="mt-2 text-xs text-slate-500">Overdue Reviews</p><p className="text-2xl font-bold text-slate-900">12</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/dash/admin/assignments?action=grading-queue" className="inline-flex items-center justify-center rounded-md bg-edvoura-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-edvoura-navy-light">
            Open Global Grading Queue
          </Link>
          <Link href="/dash/admin/assignments?action=overdue-submissions" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
            Review Overdue Submissions
          </Link>
          <Link href="/dash/admin/assignments?export=report" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
            Export Assignment Report
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
