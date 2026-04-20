import ParentReportsClient from '@/components/dashboards/ParentReportsClient';
import { apiClient } from '@/lib/api-client';
import { requireAppViewer } from '@/lib/app-context';

type ParentChild = {
  userId: string;
  fullName: string | null;
  gradeLevelName: string;
};

export default async function ReportsPage() {
  const viewer = await requireAppViewer();

  const children = await apiClient
    .get<ParentChild[]>('/parents/me/children', {
      token: viewer.accessToken,
      cache: 'no-store',
    })
    .catch(() => []);

  return <ParentReportsClient linkedChildren={children} />;
}
