import Link from 'next/link';
import { Bell, LifeBuoy, MessageSquareWarning, ShieldAlert, UserRoundCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export default async function AdminSupportModerationPage() {
  const supabase = await createClient();

  const [
    { count: unreadNotifications },
  ] = await Promise.all([
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('status', 'unread'),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-6 sm:p-8 pb-20">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-sky-100">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
            Support and Moderation
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Support tickets, moderation queue, and notification management across all dashboards.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border-[4px] border-dark bg-blue-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <LifeBuoy className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Open Tickets</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">0</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-rose-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <MessageSquareWarning className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">High Priority</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">0</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-amber-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Content Flags</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">0</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-emerald-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Unread Alerts</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{unreadNotifications ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden flex flex-col">
        <div className="p-6 border-b-[4px] border-dark bg-purple-100 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-dark tracking-tight">Moderation and Escalation</h2>
          <UserRoundCheck className="h-6 w-6 text-dark" />
        </div>
        <div className="p-6 sm:p-8 space-y-4 flex-1">
          <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">Tutor-parent conversation moderation</div>
          <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">Grade 7-12 messaging policy enforcement</div>
          <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">Support SLA monitoring and overdue escalation</div>
          <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">Broadcast notification health checks</div>
        </div>
      </div>

      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-6 border-b-[4px] border-dark bg-amber-100 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-dark tracking-tight">Actions</h2>
        </div>
        <div className="p-6 sm:p-8 flex flex-wrap gap-4">
          <Link href="/dash/admin/support?action=ticket-queue" className="bg-dark border-[3px] border-dark text-white font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 inline-flex items-center">
            Open Ticket Queue
          </Link>
          <Link href="/dash/admin/support?action=moderation-sweep" className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 inline-flex items-center">
            Run Moderation Sweep
          </Link>
          <Link href="/dash/admin/notifications?action=platform-alert" className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 inline-flex items-center">
            Send Platform Alert
          </Link>
        </div>
      </div>
    </div>
  );
}
