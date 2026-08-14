import Link from 'next/link';
import { Bell, LifeBuoy, MessageSquareWarning, ShieldAlert, UserRoundCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { AdminNavHeader } from '@/components/dashboards/admin/AdminNavHeader';

export default async function AdminSupportModerationPage() {
  const supabase = await createClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [{ count: unreadNotifications }, { count: notificationsToday }, { count: failedDeliveries }, { count: queuedDeliveries }] =
    await Promise.all([
      supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('status', 'unread'),
      supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString()),
      supabase
        .from('notification_deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('delivery_status', 'failed'),
      supabase
        .from('notification_deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('delivery_status', 'queued'),
    ]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-5 p-3 pb-24 sm:space-y-8 sm:p-6 lg:p-8">
      <AdminNavHeader
        title="Support and Moderation"
        subtitle="Support tickets, moderation queue, and notification management across all dashboards."
      />

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-blue-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <LifeBuoy className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Queued Deliveries</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{queuedDeliveries ?? 0}</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-rose-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <MessageSquareWarning className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Failed Deliveries</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{failedDeliveries ?? 0}</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-amber-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Notifications Today</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{notificationsToday ?? 0}</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-emerald-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Unread Alerts</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{unreadNotifications ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="border-[3px] sm:border-[4px] border-dark rounded-[24px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0 flex flex-col">
        <div className="p-4 sm:p-6 border-b-[4px] border-dark bg-purple-100 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-dark tracking-tight">Moderation and Escalation</h2>
          <UserRoundCheck className="h-6 w-6 text-dark" />
        </div>
        <div className="p-4 sm:p-8 space-y-3 sm:space-y-4 flex-1">
          <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">Tutor-parent conversation moderation</div>
          <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">Grade 7-12 messaging policy enforcement</div>
          <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">Support SLA monitoring and overdue escalation</div>
          <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">Broadcast notification health checks</div>
        </div>
      </div>

      <div className="border-[3px] sm:border-[4px] border-dark rounded-[24px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-4 sm:p-6 border-b-[4px] border-dark bg-amber-100 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-dark tracking-tight">Actions</h2>
        </div>
        <div className="grid gap-3 p-4 sm:flex sm:flex-wrap sm:gap-4 sm:p-8">
          <Link href="/dash/admin/support?action=ticket-queue" className="bg-dark border-[3px] border-dark text-white font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 inline-flex items-center justify-center">
            Open Ticket Queue
          </Link>
          <Link href="/dash/admin/support?action=moderation-sweep" className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 inline-flex items-center justify-center">
            Run Moderation Sweep
          </Link>
          <Link href="/dash/admin/notifications?action=platform-alert" className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 inline-flex items-center justify-center">
            Send Platform Alert
          </Link>
        </div>
      </div>
    </div>
  );
}
