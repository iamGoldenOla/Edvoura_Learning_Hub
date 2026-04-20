'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { apiClient } from '@/lib/api-client';
import { emitDashboardToast } from '@/lib/dashboard-toast';

export default function DashboardQueryActionBridge() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lastKeyRef = useRef<string>('');

  useEffect(() => {
    const action = searchParams.get('action');
    if (!action) return;

    const key = `${pathname}?${searchParams.toString()}`;
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;

    const scope = pathname.startsWith('/dash/admin')
      ? 'admin'
      : pathname.startsWith('/dash/tutor')
        ? 'tutor'
        : pathname.startsWith('/dash/parent')
          ? 'parent'
          : 'student';

    const metadata = Object.fromEntries(searchParams.entries());

    const run = async () => {
      if (scope === 'admin') {
        await apiClient.post('/admin/operations/run', {
          actionKey: action,
          context: metadata,
        });
      }

      await apiClient.post('/platform/ui-actions', {
        actionKey: `${scope}.${action}`,
        label: `Run ${action.replace(/-/g, ' ')}`,
        scope,
        nextPath: pathname,
        metadata,
      });
    };

    void run()
      .then(() => {
        emitDashboardToast({
          title: 'Action executed',
          description: action.replace(/-/g, ' '),
          type: 'success',
        });
        router.replace(pathname);
      })
      .catch((error) => {
        emitDashboardToast({
          title: 'Action failed',
          description: error instanceof Error ? error.message : 'Unexpected error.',
          type: 'error',
        });
      });
  }, [pathname, router, searchParams]);

  return null;
}
