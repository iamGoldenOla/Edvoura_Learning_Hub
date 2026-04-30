import Link from 'next/link';
import { Bell, Megaphone, Send } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export default async function AdminNotificationsPage() {
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { count: queuedCount },
    { count: sentTodayCount },
    { count: failedDeliveriesCount },
  ] = await Promise.all([
    supabase.from('notification_deliveries').select('*', { count: 'exact', head: true }).eq('delivery_status', 'queued'),
    supabase.from('notification_deliveries').select('*', { count: 'exact', head: true }).in('delivery_status', ['sent', 'delivered']).gte('created_at', todayStart.toISOString()),
    supabase.from('notification_deliveries').select('*', { count: 'exact', head: true }).eq('delivery_status', 'failed'),
  ]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-8 p-4 pb-24 sm:space-y-10 sm:p-8">
      <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-5 sm:p-8 border-b-[4px] border-dark bg-rose-100">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
            Notification Center
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Platform notification management for students, parents, tutors, and admins.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <div className="flex flex-col justify-between rounded-[24px] border-[4px] border-dark bg-blue-100 p-4 shadow-[6px_6px_0px_#060E1C] sm:rounded-[28px] sm:p-6">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Queued Notifications</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{queuedCount ?? 0}</p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[24px] border-[4px] border-dark bg-emerald-100 p-4 shadow-[6px_6px_0px_#060E1C] sm:rounded-[28px] sm:p-6">
          <div className="flex items-center gap-3">
            <Send className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Sent Today</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{sentTodayCount ?? 0}</p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[24px] border-[4px] border-dark bg-purple-100 p-4 shadow-[6px_6px_0px_#060E1C] sm:rounded-[28px] sm:p-6">
          <div className="flex items-center gap-3">
            <Megaphone className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Failed Deliveries</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{failedDeliveriesCount ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="flex items-center justify-between gap-4 border-b-[4px] border-dark bg-amber-100 p-4 sm:p-6">
          <h2 className="text-xl font-black tracking-tight text-dark sm:text-2xl">Actions</h2>
        </div>
        <div className="grid gap-3 p-4 sm:flex sm:flex-wrap sm:gap-4 sm:p-8">
          <Link href="/dash/admin/notifications?action=create-broadcast" className="inline-flex items-center justify-center rounded-xl border-[3px] border-dark bg-dark px-6 py-4 font-black text-white shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95">
            Create Broadcast
          </Link>
          <Link href="/dash/admin/notifications?action=failed-deliveries" className="inline-flex items-center justify-center rounded-xl border-[3px] border-dark bg-white px-6 py-4 font-black text-dark shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95">
            Review Failed Deliveries
          </Link>
          <Link href="/dash/admin/notifications?action=pause-campaign" className="inline-flex items-center justify-center rounded-xl border-[3px] border-dark bg-white px-6 py-4 font-black text-dark shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95">
            Pause Campaign
          </Link>
        </div>
      </div>
    </div>
  );
}
