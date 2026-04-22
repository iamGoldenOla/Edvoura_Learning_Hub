import ParentDashboardClient from '@/components/dashboards/ParentDashboardClient';
import { getBillingSummary, getParentDashboardData, requireAppViewer, type BillingSummary } from '@/lib/app-context';

export default async function ParentDashboardPage() {
  const viewer = await requireAppViewer();

  const parentData = await getParentDashboardData();
  const billingSummary = await getBillingSummary(viewer.accessToken).catch(() => null as BillingSummary | null);

  return (
    <ParentDashboardClient
      parentName={parentData.parentName}
      linkedChildren={parentData.children}
      billingSummary={billingSummary}
    />
  );
}
