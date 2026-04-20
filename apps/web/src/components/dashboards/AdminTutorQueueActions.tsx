'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { emitDashboardToast } from '@/lib/dashboard-toast';

export default function AdminTutorQueueActions({
  userId,
  fullName,
}: {
  userId: string;
  fullName: string;
}) {
  const router = useRouter();

  const run = async (type: 'approve' | 'reject') => {
    try {
      if (type === 'approve') {
        await apiClient.post(`/admin/tutors/${userId}/approve`, { notes: 'Approved from admin queue' });
      } else {
        await apiClient.post(`/admin/tutors/${userId}/reject`, { reason: 'Rejected from admin queue' });
      }
      await apiClient.post('/platform/ui-actions', {
        actionKey: `admin.tutor.${type}`,
        label: `${type === 'approve' ? 'Approve' : 'Reject'} tutor`,
        scope: 'admin',
        metadata: { userId, fullName },
      });
      emitDashboardToast({
        title: `Tutor ${type === 'approve' ? 'approved' : 'rejected'}`,
        description: fullName,
        type: 'success',
      });
      router.refresh();
    } catch (error) {
      emitDashboardToast({
        title: 'Action failed',
        description: error instanceof Error ? error.message : 'Unexpected error.',
        type: 'error',
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="h-9 border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700"
        onClick={() => void run('reject')}
      >
        Reject
      </Button>
      <Button
        variant="primary"
        className="h-9 bg-edvoura-navy px-4 py-2 text-sm font-medium text-white"
        onClick={() => void run('approve')}
      >
        <CheckCircle2 className="mr-1 h-4 w-4" />
        Approve
      </Button>
    </div>
  );
}
