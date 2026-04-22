import ParentChildrenManager from '@/components/dashboards/ParentChildrenManager';
import { getParentDashboardData, requireAppViewer } from '@/lib/app-context';

export default async function ParentChildrenPage() {
  await requireAppViewer();
  const parentData = await getParentDashboardData();

  return <ParentChildrenManager initialChildren={parentData.children} />;
}
