import { redirect } from 'next/navigation';
import StudentBandClientWrapper from '@/components/dashboards/StudentBandClientWrapper';
import { getBillingSummary, getStudentDashboardData, requireAppViewer, roleToDashboardPath } from '@/lib/app-context';

export default async function StudentDashboard() {
  const viewer = await requireAppViewer();
  const role = viewer.currentUser.primaryRole;

  if (role !== 'student') {
    redirect(roleToDashboardPath[role] || '/dash');
  }

  if (!viewer.currentUser.learnerProfile) {
    return (
      <div className="max-w-5xl mx-auto bg-white border-[4px] border-dark rounded-[28px] p-10 shadow-[10px_10px_0px_#060E1C]">
        <h1 className="text-3xl font-heading font-black text-dark mb-4">Complete your student profile</h1>
        <p className="text-sm text-dark/70 font-semibold normal-case mb-6">
          Your account does not have a student profile yet, so the dashboard cannot load. Finish
          student onboarding to continue.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="/signup?role=student"
            className="inline-flex items-center justify-center px-6 py-3 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#060E1C]"
          >
            Start Student Onboarding
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border-[3px] border-dark bg-white text-dark font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#060E1C]"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  let dashboard;
  let billingSummary;

  try {
    [dashboard, billingSummary] = await Promise.all([
      getStudentDashboardData(viewer.accessToken),
      getBillingSummary(viewer.accessToken),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load student dashboard.';

    return (
      <div className="max-w-5xl mx-auto bg-white border-[4px] border-dark rounded-[28px] p-10 shadow-[10px_10px_0px_#060E1C]">
        <h1 className="text-3xl font-heading font-black text-dark mb-4">Student dashboard unavailable</h1>
        <p className="text-sm text-dark/70 font-semibold normal-case mb-6">
          {message}
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="/signup?role=student"
            className="inline-flex items-center justify-center px-6 py-3 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#060E1C]"
          >
            Start Student Onboarding
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border-[3px] border-dark bg-white text-dark font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#060E1C]"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <StudentBandClientWrapper 
      dashboard={dashboard}
      billingSummary={billingSummary}
    />
  );
}
