import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import type { AppViewer } from '@/lib/app-context';

type ActionItem = {
  id: string;
  actionKey: string;
  label: string;
  scope: string;
  createdAt: string;
};

export default async function RecentUiActionsPanel({
  viewer,
  scope,
  title = 'Recent Action Log',
}: {
  viewer: AppViewer;
  scope?: string;
  title?: string;
}) {
  const actions = await apiClient
    .get<ActionItem[]>('/platform/ui-actions', {
      token: viewer.accessToken,
      params: scope ? { scope, limit: '10' } : { limit: '10' },
      cache: 'no-store',
    })
    .catch(() => []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.length === 0 ? (
          <p className="text-sm text-slate-500">No recent actions logged yet.</p>
        ) : (
          actions.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-600">{item.actionKey}</p>
              <p className="text-[11px] text-slate-500">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

