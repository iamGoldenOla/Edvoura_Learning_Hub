import Link from 'next/link';
import { Bell, Megaphone, Send } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminNotificationsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">Notification Center</h1>
        <p className="mt-1 text-sm text-slate-600">
          Platform notification management for students, parents, tutors, and admins.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5"><Bell className="h-5 w-5 text-blue-600" /><p className="mt-2 text-xs text-slate-500">Queued Notifications</p><p className="text-2xl font-bold text-slate-900">147</p></CardContent></Card>
        <Card><CardContent className="p-5"><Send className="h-5 w-5 text-emerald-600" /><p className="mt-2 text-xs text-slate-500">Sent Today</p><p className="text-2xl font-bold text-slate-900">2,943</p></CardContent></Card>
        <Card><CardContent className="p-5"><Megaphone className="h-5 w-5 text-indigo-600" /><p className="mt-2 text-xs text-slate-500">Broadcasts</p><p className="text-2xl font-bold text-slate-900">9</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/dash/admin/notifications?action=create-broadcast" className="inline-flex items-center justify-center rounded-md bg-edvoura-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-edvoura-navy-light">
            Create Broadcast
          </Link>
          <Link href="/dash/admin/notifications?action=failed-deliveries" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
            Review Failed Deliveries
          </Link>
          <Link href="/dash/admin/notifications?action=pause-campaign" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
            Pause Campaign
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
