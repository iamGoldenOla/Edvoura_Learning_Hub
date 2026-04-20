import ParentChildrenManager from '@/components/dashboards/ParentChildrenManager';
import { apiClient } from '@/lib/api-client';
import { requireAppViewer } from '@/lib/app-context';

type ParentChild = {
  userId: string;
  fullName: string | null;
  email?: string | null;
  relationship: string;
  isPrimaryGuardian?: boolean;
  gradeLevelCode: string;
  gradeLevelName: string;
  gradeBandCode: string;
  gradeBandName: string;
  schoolName: string | null;
};

export default async function ParentChildrenPage() {
  const viewer = await requireAppViewer();

  const children = await apiClient
    .get<ParentChild[]>('/parents/me/children', {
      token: viewer.accessToken,
      cache: 'no-store',
    })
    .catch(() => []);

  return <ParentChildrenManager initialChildren={children} />;
}
