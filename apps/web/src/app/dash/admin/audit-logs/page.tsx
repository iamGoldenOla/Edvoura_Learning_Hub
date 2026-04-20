import Link from 'next/link';
import { ClipboardList, Eye, Lock, UserCog } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSuperAdminAccess } from '../_lib/role-guard';

const auditRows = [
  {
    event: 'role.granted',
    actor: 'super_admin@edvoura.com',
    target: '3plef101@gmail.com',
    when: '2026-04-15 13:04 UTC',
  },
  {
    event: 'tutor.approved',
    actor: 'super_admin@edvoura.com',
    target: 'newtutor@edvoura.com',
    when: '2026-04-15 12:40 UTC',
  },
  {
    event: 'settings.updated',
    actor: 'ops_admin@edvoura.com',
    target: 'reward_rules',
    when: '2026-04-15 11:55 UTC',
  },
];

export default async function AdminAuditLogsPage() {
  await requireSuperAdminAccess();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-600">
          Immutable operational history for users, permissions, and platform configuration changes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <ClipboardList className="h-5 w-5 text-slate-700" />
            <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Events (24h)</p>
            <p className="text-2xl font-bold text-slate-900">1,902</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <UserCog className="h-5 w-5 text-slate-700" />
            <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Role Changes</p>
            <p className="text-2xl font-bold text-slate-900">37</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <Lock className="h-5 w-5 text-slate-700" />
            <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Security Actions</p>
            <p className="text-2xl font-bold text-slate-900">9</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Events</CardTitle>
          <Link
            href="/dash/admin/audit-logs?view=full"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            <Eye className="mr-2 h-4 w-4" />
            View Full Trail
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {auditRows.map((row) => (
            <div key={`${row.event}-${row.when}`} className="rounded-lg border border-slate-200 p-3 text-sm">
              <p className="font-semibold text-slate-900">{row.event}</p>
              <p className="text-slate-600">actor: {row.actor}</p>
              <p className="text-slate-600">target: {row.target}</p>
              <p className="text-slate-500">{row.when}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
