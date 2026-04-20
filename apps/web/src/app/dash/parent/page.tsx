import ParentDashboardClient from '@/components/dashboards/ParentDashboardClient';
import { apiClient } from '@/lib/api-client';
import { getBillingSummary, requireAppViewer, type BillingSummary } from '@/lib/app-context';

type ParentChild = {
  userId: string;
  fullName: string | null;
  relationship: string;
  gradeLevelCode: string;
  gradeLevelName: string;
  gradeBandCode: string;
  gradeBandName: string;
  schoolName: string | null;
};

export default async function ParentDashboardPage() {
  const viewer = await requireAppViewer();

  const children = await apiClient
    .get<ParentChild[]>('/parents/me/children', {
      token: viewer.accessToken,
      cache: 'no-store',
    })
    .catch(() => []);

  const billingSummary = await getBillingSummary(viewer.accessToken).catch(() => null as BillingSummary | null);

  return (
    <ParentDashboardClient
      parentName={viewer.currentUser.profile.fullName ?? 'Parent'}
      linkedChildren={children}
      billingSummary={billingSummary}
    />
  );
}
