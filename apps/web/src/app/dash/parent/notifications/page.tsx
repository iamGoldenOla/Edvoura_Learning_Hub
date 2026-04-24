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
        .eq('user_id', session.user.id)
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
    <div className="mx-auto max-w-[1400px] space-y-8 p-6 sm:p-8 pb-20">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-rose-100">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
            Notifications
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Real-time updates from tutor activity, assignments, and engagement alerts.
          </p>
        </div>
      </div>

      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-6 border-b-[4px] border-dark bg-amber-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">Recent Alerts</h2>
          </div>
          <div className="h-10 w-10 bg-white border-[3px] border-dark rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#060E1C] shrink-0">
            <Bell className="h-5 w-5 text-dark" />
          </div>
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          {notifications.length === 0 ? (
            <div className="rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-8 text-center text-sm font-bold text-dark/60">
              No notifications yet.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border-[3px] border-dark p-5 shadow-[4px_4px_0px_#060E1C] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#060E1C] ${
                  item.status === 'unread'
                    ? 'bg-blue-50'
                    : 'bg-off-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-black text-dark">{item.title}</p>
                    <p className="mt-2 text-sm font-bold text-dark/70 leading-relaxed">{item.body}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <span className="inline-flex items-center gap-2 rounded-xl border-[2px] border-dark bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_#060E1C]">
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
