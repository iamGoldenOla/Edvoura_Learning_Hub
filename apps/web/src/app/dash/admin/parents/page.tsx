import Link from 'next/link';
import { Bell, CreditCard, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminParentsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">Parent Management</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage parent accounts, child links, billing visibility, and engagement notifications.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5"><Users className="h-5 w-5 text-blue-600" /><p className="mt-2 text-xs text-slate-500">Active Parents</p><p className="text-2xl font-bold text-slate-900">902</p></CardContent></Card>
        <Card><CardContent className="p-5"><Bell className="h-5 w-5 text-amber-600" /><p className="mt-2 text-xs text-slate-500">Alert Subscriptions</p><p className="text-2xl font-bold text-slate-900">1,734</p></CardContent></Card>
        <Card><CardContent className="p-5"><CreditCard className="h-5 w-5 text-emerald-600" /><p className="mt-2 text-xs text-slate-500">Billing Access Enabled</p><p className="text-2xl font-bold text-slate-900">97%</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Actions</CardTitle>
          <Link href="/dash/admin/parents?export=csv" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
            Export Parent Directory
          </Link>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/dash/admin/parents?action=link-manager" className="inline-flex items-center justify-center rounded-md bg-edvoura-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-edvoura-navy-light">
            Open Parent Link Manager
          </Link>
          <Link href="/dash/admin/parents?action=resolve-link-conflicts" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
            Resolve Child-Link Conflicts
          </Link>
          <Link href="/dash/admin/notifications?action=parent-broadcast" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
            Send Parent Broadcast
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
