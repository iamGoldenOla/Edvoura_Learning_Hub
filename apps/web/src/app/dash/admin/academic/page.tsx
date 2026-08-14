import { AdminNavHeader } from '@/components/dashboards/admin/AdminNavHeader';
import { AdminAcademicClient } from '@/components/dashboards/admin/AdminAcademicClient';
import { createClient } from '@/utils/supabase/server';

export default async function AdminAcademicSetupPage() {
  const supabase = await createClient();

  const [
    { count: subjectsCount },
    { count: bandsCount },
    { count: lessonsCount },
  ] = await Promise.all([
    supabase.from('subjects').select('*', { count: 'exact', head: true }),
    supabase.from('grade_bands').select('*', { count: 'exact', head: true }),
    supabase.from('lessons').select('*', { count: 'exact', head: true }).in('status', ['live', 'scheduled']),
  ]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-8 sm:space-y-10 p-4 sm:p-8 pb-24">
      <AdminNavHeader
        title="Academic Setup"
        subtitle="Configure subjects, curriculum, grade bands, and lesson quality controls."
      />
      <AdminAcademicClient
        subjectsCount={subjectsCount ?? 0}
        bandsCount={bandsCount ?? 0}
        lessonsCount={lessonsCount ?? 0}
      />
    </div>
  );
}
