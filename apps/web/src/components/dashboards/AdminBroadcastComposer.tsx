'use client';

import { useState } from 'react';

import type { DashboardRole } from '@/lib/dashboard/interactionMatrix';

const TARGET_ROLES: Array<{ role: DashboardRole; label: string }> = [
  { role: 'student', label: 'Students' },
  { role: 'parent', label: 'Parents' },
  { role: 'tutor', label: 'Tutors' },
  { role: 'admin', label: 'Admins' },
  { role: 'super_admin', label: 'Super Admins' },
];

export default function AdminBroadcastComposer() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<DashboardRole[]>(['student', 'parent']);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleRole = (role: DashboardRole) => {
    setSelectedRoles((current) =>
      current.includes(role) ? current.filter((entry) => entry !== role) : [...current, role],
    );
  };

  const submit = async () => {
    if (!title.trim() || !body.trim() || selectedRoles.length === 0) {
      setStatus({ type: 'error', message: 'Add a title, message, and at least one target role.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch('/api/dashboard/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          targetRoles: selectedRoles,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to queue broadcast.');
      }

      setStatus({
        type: 'success',
        message: `Broadcast queued for ${payload.recipientCount ?? 0} dashboard recipients.`,
      });
      setTitle('');
      setBody('');
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to queue broadcast.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border-[3px] border-dark bg-off-white p-4 shadow-[3px_3px_0px_#060E1C] sm:p-5 sm:shadow-[4px_4px_0px_#060E1C]">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-dark/60">Queue Broadcast</p>
          <p className="mt-1 text-sm font-bold text-dark/70">
            Send a cross-dashboard announcement through the shared delivery layer.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Title</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-xl border-[3px] border-dark bg-white px-3 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
            placeholder="Platform alert title"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Message</label>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            className="w-full rounded-xl border-[3px] border-dark bg-white px-3 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
            placeholder="What should the selected dashboards know?"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Target Roles</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {TARGET_ROLES.map((item) => {
              const active = selectedRoles.includes(item.role);
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => toggleRole(item.role)}
                  className={`rounded-xl border-[3px] px-3 py-3 text-left text-sm font-black shadow-[2px_2px_0px_#060E1C] transition-all ${
                    active
                      ? 'border-dark bg-yellow text-dark'
                      : 'border-dark bg-white text-dark/70'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {status.message ? (
          <div
            className={`rounded-xl border-[2px] px-3 py-2 text-sm font-black ${
              status.type === 'success'
                ? 'border-emerald-500 bg-emerald-100 text-emerald-900'
                : 'border-rose-500 bg-rose-100 text-rose-900'
            }`}
          >
            {status.message}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void submit()}
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-xl border-[3px] border-dark bg-dark px-5 py-3 text-sm font-black text-white shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Queueing Broadcast...' : 'Queue Broadcast'}
        </button>
      </div>
    </div>
  );
}
