import Link from 'next/link';
import { ClipboardList, Eye, Lock, UserCog } from 'lucide-react';

import { requireSuperAdminAccess } from '../_lib/role-guard';
import { supabaseAdmin } from '@/utils/supabase/admin';

type AuditLogRow = {
  id: string;
  actor_user_id: string | null;
  action: string;
  entity_table: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export default async function AdminAuditLogsPage() {
  await requireSuperAdminAccess();

  const now = new Date();
  const last24HoursDate = new Date(now);
  last24HoursDate.setHours(last24HoursDate.getHours() - 24);
  const last24Hours = last24HoursDate.toISOString();

  const { data: auditLogsData = [] } = await supabaseAdmin
    .schema('audit')
    .from('audit_logs')
    .select('id, actor_user_id, action, entity_table, entity_id, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  const auditLogs = (auditLogsData ?? []) as AuditLogRow[];
  const actorIds = [...new Set(auditLogs.map((item) => item.actor_user_id).filter(Boolean))] as string[];
  const { data: profilesData = [] } = actorIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', actorIds)
    : { data: [] as Array<{ id: string; full_name: string | null; email: string }> };

  const profileById = new Map((profilesData ?? []).map((entry) => [entry.id, entry]));

  const recent24h = auditLogs.filter((item) => item.created_at >= last24Hours);
  const roleChanges = recent24h.filter(
    (item) => item.action.includes('role') || item.entity_table === 'user_roles',
  );
  const securityActions = recent24h.filter(
    (item) =>
      item.action.startsWith('admin.') ||
      item.action.includes('auth') ||
      item.action.includes('security'),
  );

  return (
    <div className="mx-auto max-w-[1680px] space-y-10 p-6 sm:p-8 pb-24">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-purple-100">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
            Audit Logs
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Immutable operational history for users, permissions, and platform configuration changes.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[28px] border-[4px] border-dark bg-sky-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Events (24h)</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{recent24h.length}</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-amber-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <UserCog className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Role Changes</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{roleChanges.length}</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-emerald-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <Lock className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Security Actions</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{securityActions.length}</p>
          </div>
        </div>
      </div>

      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-6 border-b-[4px] border-dark bg-rose-100 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-dark tracking-tight">Recent Events</h2>
          <Link
            href="/dash/admin/audit-logs?view=full"
            className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-4 py-2 inline-flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Full Trail
          </Link>
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          {auditLogs.length > 0 ? (
            auditLogs.map((entry) => {
              const actor = entry.actor_user_id ? profileById.get(entry.actor_user_id) : null;
              const actorLabel = actor?.full_name ?? actor?.email ?? 'System';
              const metadataPreview = Object.keys(entry.metadata ?? {}).length
                ? JSON.stringify(entry.metadata)
                : 'No metadata recorded';

              return (
                <div key={entry.id} className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <p className="text-lg font-black text-dark">{entry.action}</p>
                      <div className="flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-widest text-dark/60">
                        <span>Actor: {actorLabel}</span>
                        <span>Entity: {entry.entity_table}</span>
                        {entry.entity_id ? <span>Ref: {entry.entity_id.slice(0, 8)}</span> : null}
                      </div>
                      <p className="text-sm font-bold text-dark/70 break-all">{metadataPreview}</p>
                    </div>
                    <p className="text-xs font-bold text-dark/50 shrink-0">
                      {new Date(entry.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm font-bold text-dark/50">No audit events have been recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
