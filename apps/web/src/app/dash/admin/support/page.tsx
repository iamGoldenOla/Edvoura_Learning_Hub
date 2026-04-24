import Link from 'next/link';
import { Bell, LifeBuoy, MessageSquareWarning, ShieldAlert, UserRoundCheck } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/server';

export default async function AdminSupportModerationPage() {
  const supabase = await createClient();

  const [
    { count: unreadNotifications },
  ] = await Promise.all([
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('status', 'unread'),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">Support and Moderation</h1>
        <p className="mt-1 text-sm text-slate-600">
          Support tickets, moderation queue, and notification management across all dashboards.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Open Tickets', value: 0, icon: LifeBuoy },
          { label: 'High Priority', value: 0, icon: MessageSquareWarning },
          { label: 'Content Flags', value: 0, icon: ShieldAlert },
          { label: 'Unread Alerts', value: unreadNotifications ?? 0, icon: Bell },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <item.icon className="h-5 w-5 text-rose-600" />
              <p className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-bold">{item.label}</p>
              <p className="text-2xl font-bold text-slate-900">{item.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Moderation and Escalation</CardTitle>
          <UserRoundCheck className="h-5 w-5 text-slate-500" />
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="rounded-lg border border-slate-200 p-3">Tutor-parent conversation moderation</div>
          <div className="rounded-lg border border-slate-200 p-3">Grade 7-12 messaging policy enforcement</div>
          <div className="rounded-lg border border-slate-200 p-3">Support SLA monitoring and overdue escalation</div>
          <div className="rounded-lg border border-slate-200 p-3">Broadcast notification health checks</div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/dash/admin/support?action=ticket-queue" className="inline-flex items-center justify-center rounded-md bg-edvoura-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-edvoura-navy-light">
          Open Ticket Queue
        </Link>
        <Link href="/dash/admin/support?action=moderation-sweep" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
          Run Moderation Sweep
        </Link>
        <Link href="/dash/admin/notifications?action=platform-alert" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
          Send Platform Alert
        </Link>
      </div>
    </div>
  );
}
