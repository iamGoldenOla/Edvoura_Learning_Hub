'use client';

import { useState } from 'react';
import { toggleParentPortalAccess } from '@/app/dash/admin/actions';

export default function ParentAccessToggle({
  userId,
  initialBlocked,
}: {
  userId: string;
  initialBlocked: boolean;
}) {
  const [blocked, setBlocked] = useState(initialBlocked);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const nextState = !blocked;
    const actionWord = nextState ? 'suspend' : 'restore';
    if (!confirm(`Are you sure you want to ${actionWord} portal access for this parent?`)) {
      return;
    }

    setLoading(true);
    try {
      await toggleParentPortalAccess(userId, nextState);
      setBlocked(nextState);
    } catch (err) {
      console.error(err);
      alert('Failed to update parent access status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`h-10 px-4 rounded-xl border-[2px] border-dark font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-[2px_2px_0px_#060E1C] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center ${
        blocked
          ? 'bg-emerald-400 text-dark hover:bg-emerald-500'
          : 'bg-rose-400 text-dark hover:bg-rose-500'
      }`}
    >
      {loading ? 'Saving...' : blocked ? 'Restore Access' : 'Suspend Access'}
    </button>
  );
}
