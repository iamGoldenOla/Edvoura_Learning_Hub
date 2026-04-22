'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useState } from 'react';

import { Button } from '@/components/ui/button';
import { emitDashboardToast } from '@/lib/dashboard-toast';

type Props = {
  label: string;
  actionKey: string;
  scope: string;
  nextPath?: string;
  metadata?: Record<string, unknown>;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  className?: string;
  icon?: ReactNode;
};

export default function DashboardActionButton({
  label,
  actionKey,
  scope,
  nextPath,
  metadata,
  variant = 'outline',
  className,
  icon,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);

    try {
      emitDashboardToast({
        title: 'Action completed',
        description: metadata?.note && typeof metadata.note === 'string' ? metadata.note : `${label} is now active.`,
        type: 'success',
      });
      if (nextPath) {
        router.push(nextPath);
      }
    } catch (error) {
      emitDashboardToast({
        title: 'Action failed',
        description: error instanceof Error ? error.message : 'Unexpected error.',
        type: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button type="button" variant={variant} className={className} onClick={() => void handleClick()} isLoading={busy}>
      {icon}
      {label}
    </Button>
  );
}
