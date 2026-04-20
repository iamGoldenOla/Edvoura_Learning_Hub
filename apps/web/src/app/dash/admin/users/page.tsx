import Link from 'next/link';
import { KeyRound, ShieldCheck, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSuperAdminAccess } from '../_lib/role-guard';

const rows = [
  { ref: 'USR-1001', role: 'student', status: 'active', updated: '2026-04-15 12:40 UTC' },
  { ref: 'USR-1002', role: 'parent', status: 'active', updated: '2026-04-15 12:31 UTC' },
  { ref: 'USR-1003', role: 'tutor', status: 'pending_review', updated: '2026-04-15 12:20 UTC' },
  { ref: 'USR-1004', role: 'admin', status: 'active', updated: '2026-04-15 11:58 UTC' },
];

export default async function AdminUsersRolesPage() {
  await requireSuperAdminAccess();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">Users and Roles</h1>
        <p className="mt-1 text-sm text-slate-600">
          Central user management, role permissions, and account access control.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <Users className="h-5 w-5 text-blue-600" />
            <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Total Users</p>
            <p className="text-2xl font-bold text-slate-900">2,996</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Active Roles</p>
            <p className="text-2xl font-bold text-slate-900">4</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <KeyRound className="h-5 w-5 text-indigo-600" />
            <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Permission Sets</p>
            <p className="text-2xl font-bold text-slate-900">18</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent User Actions</CardTitle>
          <div className="flex gap-2">
            <Link href="/dash/admin/users?export=csv" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
              Export
            </Link>
            <Link href="/dash/admin/users?action=create" className="inline-flex items-center justify-center rounded-md bg-edvoura-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-edvoura-navy-light">
              Create User
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.map((row) => (
            <div key={row.ref} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm">
              <div>
                <p className="font-semibold text-slate-900">{row.ref}</p>
                <p className="text-slate-600">role: {row.role}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-700">{row.status}</p>
                <p className="text-xs text-slate-500">{row.updated}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
