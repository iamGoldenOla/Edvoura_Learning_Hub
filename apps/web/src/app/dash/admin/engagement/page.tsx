import { AdminNavHeader } from '@/components/dashboards/admin/AdminNavHeader';
import { AdminEngagementClient } from '@/components/dashboards/admin/AdminEngagementClient';
import { createClient } from '@/utils/supabase/server';

export default async function AdminEngagementPage() {
  const supabase = await createClient();

  const [
    { count: activitiesCount },
    { count: resourceUploadsCount },
    { count: spellingBeeCount },
  ] = await Promise.all([
    supabase.from('learning_activity_events').select('*', { count: 'exact', head: true }),
    supabase.from('learning_activity_events').select('*', { count: 'exact', head: true }).eq('event_type', 'lesson_resource_uploaded'),
    supabase.from('learning_activity_events').select('*', { count: 'exact', head: true }).eq('event_type', 'spelling_bee_created'),
  ]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-8 sm:space-y-10 p-4 sm:p-8 pb-24">
      <AdminNavHeader
        title="Engagement and Rewards"
        subtitle="Platform-wide gamification controls for XP, badges, streaks, rewards, and challenges."
      />
      <AdminEngagementClient
        activitiesCount={activitiesCount ?? 0}
        resourceUploadsCount={resourceUploadsCount ?? 0}
        spellingBeeCount={spellingBeeCount ?? 0}
      />
    </div>
  );
}
