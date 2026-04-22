'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { emitDashboardToast } from '@/lib/dashboard-toast';

const actionCopy: Record<string, { title: string; description: string }> = {
  'sync-calendar': {
    title: 'Calendar sync queued',
    description: 'Connect your Google calendar in the live sessions phase to sync tutor slots automatically.',
  },
  'open-slot': {
    title: 'Open slot panel ready',
    description: 'Use the live session scheduler below to publish a new class slot and optional Google Meet link.',
  },
  join: {
    title: 'Live session launch',
    description: 'This lesson is ready to open once a Google Meet join link has been attached.',
  },
  'review-requests': {
    title: 'Request review ready',
    description: 'Pending tutor requests are loaded from the direct dashboard workflow.',
  },
  'view-summary': {
    title: 'Summary view ready',
    description: 'Session summaries will open from live lesson records as this dashboard phase tightens.',
  },
};

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

    const copy = actionCopy[action] ?? {
      title: 'Action ready',
      description: action.replace(/-/g, ' '),
    };

    emitDashboardToast({
      title: copy.title,
      description: copy.description,
      type: 'success',
    });
    router.replace(pathname);
  }, [pathname, router, searchParams]);

  return null;
}
