import Link from 'next/link';
import { redirect } from 'next/navigation';
import StudentBandClientWrapper from '@/components/dashboards/StudentBandClientWrapper';
import { getBillingSummary, getStudentDashboardData, requireAppViewer, roleToDashboardPath } from '@/lib/app-context';
import { buildFeedCountMapFromNotificationData } from '@/lib/dashboard/feedRules';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border-[3px] border-dark bg-white text-dark font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#060E1C]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  let dashboard;
  let billingSummary;
  let feedCounts: Record<string, number> = {};

  try {
    [dashboard, billingSummary] = await Promise.all([
      getStudentDashboardData(viewer.accessToken),
      getBillingSummary(viewer.accessToken),
    ]);
    const supabase = await createClient();
    const { data: notifications = [] } = await supabase
      .from('notifications')
      .select('data')
      .eq('recipient_user_id', viewer.currentUser.userId)
      .eq('status', 'unread')
      .limit(20);
    const notificationFeedCounts = buildFeedCountMapFromNotificationData(notifications ?? [], 'platform_announcements');
    feedCounts = {
      learning_content: dashboard.upcomingLessons.length,
      practice_and_assessment: dashboard.assignments.filter((assignment) => {
        const normalized = (assignment.submissionStatus ?? '').toLowerCase();
        return !normalized || normalized === 'draft' || normalized === 'submitted' || normalized === 'late';
      }).length,
      classroom_resources: dashboard.stats.activeClasses,
      platform_announcements: notificationFeedCounts.get('platform_announcements') ?? 0,
    };
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
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border-[3px] border-dark bg-white text-dark font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#060E1C]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <StudentBandClientWrapper 
      dashboard={dashboard}
      billingSummary={billingSummary}
      feedCounts={feedCounts}
    />
  );
}
