import Link from 'next/link';
import { BookOpen, TrendingUp, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminStudentsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">Student Management</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage student records, enrollment health, engagement alerts, and academic interventions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5"><Users className="h-5 w-5 text-blue-600" /><p className="mt-2 text-xs text-slate-500">Active Students</p><p className="text-2xl font-bold text-slate-900">1,248</p></CardContent></Card>
        <Card><CardContent className="p-5"><BookOpen className="h-5 w-5 text-indigo-600" /><p className="mt-2 text-xs text-slate-500">At-Risk Learners</p><p className="text-2xl font-bold text-slate-900">37</p></CardContent></Card>
        <Card><CardContent className="p-5"><TrendingUp className="h-5 w-5 text-emerald-600" /><p className="mt-2 text-xs text-slate-500">Engagement Growth</p><p className="text-2xl font-bold text-slate-900">+9.2%</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Actions</CardTitle>
          <Link href="/dash/admin/students?export=csv" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
            Export Student List
          </Link>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/dash/admin/students?action=open-profiles" className="inline-flex items-center justify-center rounded-md bg-edvoura-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-edvoura-navy-light">
            Open Student Profiles
          </Link>
          <Link href="/dash/admin/students?action=low-engagement" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
            Review Low Engagement
          </Link>
          <Link href="/dash/admin/students?action=attendance-alert-sweep" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
            Run Attendance Alert Sweep
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
