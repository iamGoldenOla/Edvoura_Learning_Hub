import ParentMonitorClient from '@/components/dashboards/ParentMonitorClient';
import { getParentDashboardData, requireAppViewer } from '@/lib/app-context';

export default async function MonitorPage() {
  await requireAppViewer();
  const parentData = await getParentDashboardData();

  return <ParentMonitorClient linkedChildren={parentData.children} />;
}
