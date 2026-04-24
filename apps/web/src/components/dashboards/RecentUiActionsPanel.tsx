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
    <div className="flex h-full flex-col">
      <div className="p-6 border-b-[4px] border-dark bg-slate-100 flex items-center justify-between">
        <h2 className="text-2xl font-black text-dark tracking-tight">{title}</h2>
      </div>
      <div className="p-6 space-y-4">
        {actions.length === 0 ? (
          <div className="rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-6 text-center text-sm font-bold text-dark/60">
            No recent actions logged yet.
          </div>
        ) : (
          <div className="space-y-4">
            {actions.map((item) => (
              <div key={item.id} className="rounded-2xl border-[3px] border-dark bg-off-white p-4 shadow-[4px_4px_0px_#060E1C]">
                <p className="text-sm font-black text-dark uppercase tracking-widest">{item.action}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="inline-flex rounded-md border-[2px] border-dark bg-white px-2 py-1 text-[10px] font-black uppercase tracking-widest text-dark shadow-[2px_2px_0px_#060E1C]">
                    {item.entityTable}
                  </span>
                  <p className="text-xs font-bold text-dark/60">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
