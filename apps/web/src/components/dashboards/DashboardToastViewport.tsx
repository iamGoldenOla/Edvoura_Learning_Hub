'use client';

import { useEffect, useMemo, useState } from 'react';

import { DASHBOARD_TOAST_EVENT, type DashboardToastPayload } from '@/lib/dashboard-toast';

type ToastItem = DashboardToastPayload & { id: string };

export default function DashboardToastViewport() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onToast = (event: Event) => {
      const custom = event as CustomEvent<DashboardToastPayload>;
      const payload = custom.detail;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setItems((prev) => [...prev, { ...payload, id }].slice(-4));

      setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }, 3500);
    };

    window.addEventListener(DASHBOARD_TOAST_EVENT, onToast as EventListener);
    return () => window.removeEventListener(DASHBOARD_TOAST_EVENT, onToast as EventListener);
  }, []);

  const tone = useMemo(
    () => ({
      success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
      error: 'border-rose-200 bg-rose-50 text-rose-900',
      info: 'border-slate-200 bg-white text-slate-900',
    }),
    [],
  );

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-full max-w-sm flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto rounded-lg border px-3 py-2 shadow-sm ${tone[item.type ?? 'info']}`}
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-semibold">{item.title}</p>
          {item.description ? <p className="mt-0.5 text-xs opacity-90">{item.description}</p> : null}
        </div>
      ))}
    </div>
  );
}

