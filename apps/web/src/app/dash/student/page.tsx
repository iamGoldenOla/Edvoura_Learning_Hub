import StudentBandClientWrapper from '@/components/dashboards/StudentBandClientWrapper';
import { getBillingSummary, getStudentDashboardData, requireAppViewer } from '@/lib/app-context';

export default async function StudentDashboard() {
  const viewer = await requireAppViewer();
  const [dashboard, billingSummary] = await Promise.all([
    getStudentDashboardData(viewer.accessToken),
    getBillingSummary(viewer.accessToken),
  ]);

  return (
    <StudentBandClientWrapper 
      dashboard={dashboard}
      billingSummary={billingSummary}
    />
  );
}
