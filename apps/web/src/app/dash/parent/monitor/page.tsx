import ParentMonitorClient from '@/components/dashboards/ParentMonitorClient';
import { apiClient } from '@/lib/api-client';
import { requireAppViewer } from '@/lib/app-context';

type ParentChild = {
  userId: string;
  fullName: string | null;
  gradeLevelName: string;
};

export default async function MonitorPage() {
  const viewer = await requireAppViewer();

  const children = await apiClient
    .get<ParentChild[]>('/parents/me/children', {
      token: viewer.accessToken,
      cache: 'no-store',
    })
    .catch(() => []);

  return <ParentMonitorClient linkedChildren={children} />;
}
