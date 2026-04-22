import ParentReportsClient from '@/components/dashboards/ParentReportsClient';
import { getParentDashboardData, requireAppViewer } from '@/lib/app-context';

export default async function ReportsPage() {
  await requireAppViewer();
  const parentData = await getParentDashboardData();

  return <ParentReportsClient linkedChildren={parentData.children} />;
}
