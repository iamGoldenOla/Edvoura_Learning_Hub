import Link from 'next/link';
import { Bell, Megaphone, Send } from 'lucide-react';

import { getFeedRulesForRole } from '@/lib/dashboard/feedRules';
import { createClient } from '@/utils/supabase/server';

export default async function AdminNotificationsPage() {
  const supabase = await createClient();
  const studentFeedRules = getFeedRulesForRole('student');
  const parentFeedRules = getFeedRulesForRole('parent');
  const tutorFeedRules = getFeedRulesForRole('tutor');

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [{ count: queuedCount }, { count: sentTodayCount }, { count: failedDeliveriesCount }] =
    await Promise.all([
      supabase
        .from('notification_deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('delivery_status', 'queued'),
      supabase
        .from('notification_deliveries')
        .select('*', { count: 'exact', head: true })
        .in('delivery_status', ['sent', 'delivered'])
        .gte('created_at', todayStart.toISOString()),
      supabase
        .from('notification_deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('delivery_status', 'failed'),
    ]);

  const feedRuleGroups = [
    { label: 'Students', rules: studentFeedRules },
    { label: 'Parents', rules: parentFeedRules },
    { label: 'Tutors', rules: tutorFeedRules },
  ];

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-5 p-3 pb-24 sm:space-y-8 sm:p-6 lg:p-8">
      <div className="border-[3px] border-dark rounded-[24px] bg-white shadow-[4px_4px_0px_#060E1C] overflow-hidden min-w-0 sm:border-[4px] sm:rounded-[28px] sm:shadow-[10px_10px_0px_#060E1C]">
        <div className="p-5 sm:p-8 border-b-[4px] border-dark bg-rose-100">
          <h1 className="text-[2rem] sm:text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
            Notification Center
          </h1>
          <p className="mt-3 sm:mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
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

      <div className="border-[3px] border-dark rounded-[24px] bg-white shadow-[4px_4px_0px_#060E1C] overflow-hidden min-w-0 sm:border-[4px] sm:rounded-[28px] sm:shadow-[10px_10px_0px_#060E1C]">
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

      <div className="border-[3px] border-dark rounded-[24px] bg-white shadow-[4px_4px_0px_#060E1C] overflow-hidden min-w-0 sm:border-[4px] sm:rounded-[28px] sm:shadow-[10px_10px_0px_#060E1C]">
        <div className="p-4 sm:p-6 border-b-[4px] border-dark bg-sky-100">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-dark">Inbox Routing Rules</h2>
          <p className="mt-2 max-w-2xl text-sm font-bold text-dark/70">
            Broadcasts and alerts should land in predictable role feeds instead of relying on page-local assumptions.
          </p>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-3 sm:gap-5 sm:p-6">
          {feedRuleGroups.map((group) => (
            <div key={group.label} className="rounded-2xl border-[3px] border-dark bg-off-white p-4 shadow-[3px_3px_0px_#060E1C] sm:p-5 sm:shadow-[4px_4px_0px_#060E1C]">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-dark/60">{group.label}</p>
              <div className="mt-3 space-y-3">
                {group.rules.slice(0, 3).map((rule) => (
                  <div key={rule.feedKey} className="rounded-xl border-[2px] border-dark bg-white p-3">
                    <p className="text-sm font-black text-dark">{rule.label}</p>
                    <p className="mt-1 text-xs font-bold leading-relaxed text-dark/65">{rule.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
