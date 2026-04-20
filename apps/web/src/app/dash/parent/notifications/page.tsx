import { Bell, CheckCircle2, Clock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { requireAppViewer } from '@/lib/app-context';

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
  const viewer = await requireAppViewer();
  const notifications = await apiClient
    .get<NotificationItem[]>('/notifications/me', {
      token: viewer.accessToken,
      cache: 'no-store',
    })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-edvoura-navy">Notifications</h1>
        <p className="mt-2 text-sm text-slate-600">
          Real-time updates from tutor activity, assignments, and engagement alerts.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-edvoura-navy" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-600">No notifications yet.</p>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border p-4 ${
                  item.status === 'unread'
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-600">{item.body}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                    <Clock className="h-3 w-3" />
                    {formatWhen(item.createdAt)}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  {item.status === 'unread' ? (
                    <span className="inline-flex items-center gap-1">
                      <Bell className="h-3 w-3 text-blue-600" />
                      Unread
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Read
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
