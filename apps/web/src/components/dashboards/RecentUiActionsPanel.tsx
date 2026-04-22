import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/server';

type ActionItem = {
  id: string;
  action: string;
  entityTable: string;
  createdAt: string;
};

export default async function RecentUiActionsPanel({
  scope,
  title = 'Recent Action Log',
}: {
  viewer?: unknown;
  scope?: string;
  title?: string;
}) {
  let actions: ActionItem[] = [];

  try {
    const supabase = await createClient();
    let query = supabase.schema('audit').from('audit_logs')
      .select('id, action, entity_table, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (scope) {
      query = query.eq('entity_table', scope);
    }

    const { data } = await query;

    actions = (data ?? []).map(item => ({
      id: item.id,
      action: item.action,
      entityTable: item.entity_table,
      createdAt: item.created_at,
    }));
  } catch {
    actions = [];
  }

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
              <p className="text-sm font-semibold text-slate-900">{item.action}</p>
              <p className="text-xs text-slate-600">{item.entityTable}</p>
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
