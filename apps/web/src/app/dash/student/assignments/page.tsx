import { getStudentDashboardData, requireAppViewer } from '@/lib/app-context';
import StudentHomeworkWorkspace from '@/components/dashboards/StudentHomeworkWorkspace';
import Link from 'next/link';

export default async function StudentAssignmentsPage() {
  const viewer = await requireAppViewer();
  let dashboard;

  try {
    dashboard = await getStudentDashboardData(viewer.accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load assignments.';
    return (
      <div className="max-w-5xl mx-auto bg-white border-[4px] border-dark rounded-[28px] p-10 shadow-[10px_10px_0px_#060E1C]">
        <h1 className="text-3xl font-heading font-black text-dark mb-4">Assignments unavailable</h1>
        <p className="text-sm text-dark/70 font-semibold normal-case mb-6">{message}</p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/dash/student"
            className="inline-flex items-center justify-center px-6 py-3 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#060E1C]"
          >
            Back to Overview
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1320px]">
      <StudentHomeworkWorkspace assignments={dashboard.assignments} />
    </div>
  );
}
