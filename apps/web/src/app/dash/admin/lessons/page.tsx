import { createClient } from '@/utils/supabase/server';
import { AdminNavHeader } from '@/components/dashboards/admin/AdminNavHeader';
import { AdminLiveLessonsClient } from '@/components/dashboards/admin/AdminLiveLessonsClient';

export default async function AdminLessonsPage() {
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    { count: lessonsToday },
    { count: liveSessions },
  ] = await Promise.all([
    supabase.from('lessons').select('*', { count: 'exact', head: true }).gte('scheduled_start_at', todayStart.toISOString()).lte('scheduled_start_at', todayEnd.toISOString()),
    supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('status', 'live'),
  ]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-8 sm:space-y-10 p-4 sm:p-8 pb-24">
      <AdminNavHeader
        title="Lesson Oversight & Live Quality Monitor"
        subtitle="Supervise live teaching rooms, inspect tutor lesson notes, check attendance integrity, and trigger class reminders."
      />

      <AdminLiveLessonsClient
        lessonsToday={lessonsToday ?? 0}
        liveSessionsCount={liveSessions ?? 0}
      />
    </div>
  );
}
