import { Bell, CheckCircle2, Clock } from 'lucide-react';

import { requireAppViewer } from '@/lib/app-context';
import { createClient } from '@/utils/supabase/server';

type NotificationItem = {
  id: string;
  kind: string;
  title: string;
  body: string;
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
};

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export default async function ParentNotificationsPage() {
  await requireAppViewer();

  let notifications: NotificationItem[] = [];
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      const { data } = await supabase
        .from('notifications')
        .select('id, kind, title, body, status, created_at')
        .eq('recipient_user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      notifications = (data ?? []).map((n) => ({
        id: n.id,
        kind: n.kind,
        title: n.title,
        body: n.body,
        status: n.status as 'unread' | 'read' | 'archived',
        createdAt: n.created_at,
      }));
    }
  } catch {
    notifications = [];
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-5 p-3 pb-24 sm:space-y-8 sm:p-6 lg:p-8">
      <div className="overflow-hidden rounded-[24px] border-[4px] border-dark bg-white shadow-[6px_6px_0px_#060E1C] sm:rounded-[28px] sm:shadow-[10px_10px_0px_#060E1C]">
        <div className="border-b-[4px] border-dark bg-rose-100 p-5 sm:p-8">
          <h1 className="text-[2rem] font-black leading-[0.92] tracking-tight text-dark sm:text-4xl md:text-5xl">
            Notifications
          </h1>
          <p className="mt-3 max-w-xl text-sm font-bold text-dark/70 sm:mt-4 md:text-base">
            Real-time updates from tutor activity, assignments, and engagement alerts.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border-[4px] border-dark bg-white shadow-[6px_6px_0px_#060E1C] sm:rounded-[28px] sm:shadow-[10px_10px_0px_#060E1C]">
        <div className="flex flex-col gap-3 border-b-[4px] border-dark bg-amber-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-6">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-dark sm:h-6 sm:w-6" />
            <h2 className="text-xl font-black tracking-tight text-dark sm:text-2xl">Recent Alerts</h2>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[3px] border-dark bg-white shadow-[2px_2px_0px_#060E1C]">
            <Bell className="h-5 w-5 text-dark" />
          </div>
        </div>
        <div className="space-y-3 p-4 sm:space-y-4 sm:p-6 lg:p-8">
          {notifications.length === 0 ? (
            <div className="rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-6 text-center text-sm font-bold text-dark/60 sm:p-8">
              No notifications yet.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border-[3px] border-dark p-4 shadow-[3px_3px_0px_#060E1C] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#060E1C] sm:p-5 sm:shadow-[4px_4px_0px_#060E1C] ${
                  item.status === 'unread'
                    ? 'bg-blue-50'
                    : 'bg-off-white'
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-base font-black text-dark sm:text-lg">{item.title}</p>
                    <p className="mt-2 text-sm font-bold leading-relaxed text-dark/70">{item.body}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:items-end sm:gap-3">
                    <span className="inline-flex items-center gap-2 self-start rounded-xl border-[2px] border-dark bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_#060E1C] sm:self-auto">
                      <Clock className="h-4 w-4 text-dark" />
                      {formatWhen(item.createdAt)}
                    </span>
                    {item.status === 'unread' ? (
                      <span className="inline-flex items-center gap-2 rounded-xl border-[2px] border-dark bg-blue-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-900 shadow-[2px_2px_0px_#060E1C]">
                        <Bell className="h-4 w-4" />
                        Unread
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-xl border-[2px] border-dark bg-emerald-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900 shadow-[2px_2px_0px_#060E1C]">
                        <CheckCircle2 className="h-4 w-4" />
                        Read
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
