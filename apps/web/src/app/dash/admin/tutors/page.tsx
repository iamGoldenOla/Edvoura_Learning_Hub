import Link from 'next/link';
import { ShieldCheck, UserCheck, UserX } from 'lucide-react';

import AdminTutorQueueActions from '@/components/dashboards/AdminTutorQueueActions';
import { apiClient } from '@/lib/api-client';
import { requireAdminAccess } from '../_lib/role-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PendingTutor = {
  userId: string;
  fullName: string | null;
  email: string;
  expertiseSummary: string | null;
  approvalStatus: string;
};

export default async function AdminTutorsApprovalsPage() {
  const { viewer } = await requireAdminAccess();
  const queue = await apiClient
    .get<PendingTutor[]>('/admin/tutors/pending', { token: viewer.accessToken, cache: 'no-store' })
    .catch(() => []);
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">Tutors and Approvals</h1>
        <p className="mt-1 text-sm text-slate-600">
          Tutor approval workflow, quality assurance, and teaching compliance controls.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Approved Tutors</p>
            <p className="text-2xl font-bold text-slate-900">146</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <UserCheck className="h-5 w-5 text-blue-600" />
            <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Pending Approvals</p>
            <p className="text-2xl font-bold text-slate-900">5</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <UserX className="h-5 w-5 text-rose-600" />
            <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Suspended</p>
            <p className="text-2xl font-bold text-slate-900">2</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tutor Moderation Queue</CardTitle>
          <Link href="/dash/admin/tutors?view=full-queue" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
            View Full Queue
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {queue.length === 0 ? (
            <p className="text-sm text-slate-500">No pending tutor applications.</p>
          ) : null}
          {queue.map((item) => (
            <div key={item.userId} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm">
              <div>
                <p className="font-semibold text-slate-900">{item.fullName || item.email}</p>
                <p className="text-slate-600">{item.expertiseSummary || 'Tutor application pending review'}</p>
              </div>
              <AdminTutorQueueActions userId={item.userId} fullName={item.fullName || item.email} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
