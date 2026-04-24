import { getStudentDashboardData, requireAppViewer, gradeBandCodeToUiBand } from '@/lib/app-context';
import StudentLiveWaitingRoom from '@/components/dashboards/StudentLiveWaitingRoom';

export default async function LivePage() {
  const viewer = await requireAppViewer();
  const dashboard = await getStudentDashboardData(viewer.accessToken);
  const band = gradeBandCodeToUiBand(viewer.currentUser.learnerProfile?.gradeBandCode);

  return (
    <div className="max-w-[1400px] mx-auto">
      <StudentLiveWaitingRoom dashboard={dashboard} band={band} />
    </div>
  );
}
