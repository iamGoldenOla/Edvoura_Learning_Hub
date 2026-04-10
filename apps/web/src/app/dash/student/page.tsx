import { createClient } from '@/utils/supabase/server';
import { apiClient } from '@/lib/api-client';
import StudentBandClientWrapper from '@/components/dashboards/StudentBandClientWrapper';

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  
  // Example fetching logic via the unified API Client.
  const enrollments = await apiClient.get<any[]>('/classes/my-enrollments', { token: session?.access_token }).catch(() => []);
  const assignments = await apiClient.get<any[]>('/assignments/me', { token: session?.access_token }).catch(() => []);
  const upcomingLessons = await apiClient.get<any[]>('/lessons/upcoming', { token: session?.access_token }).catch(() => []);

  // Use the backend DB metadata if available, otherwise default.
  const initialBand = user?.user_metadata?.learner_band || '7-12';

  return (
    <StudentBandClientWrapper 
      enrollments={enrollments}
      assignments={assignments}
      upcomingLessons={upcomingLessons}
      initialBand={initialBand}
    />
  );
}
