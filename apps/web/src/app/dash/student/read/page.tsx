import { requireAppViewer } from '@/lib/app-context';
import { createClient } from '@/utils/supabase/server';
import ReadCornerClient from './ReadCornerClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type StudentLearningProfileRow = {
  grade_level?: {
    display_name?: string | null;
  } | null;
} | null;

export default async function ReadPage() {
  const viewer = await requireAppViewer();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('grade_level:grade_levels!grade_level_id(code, display_name)')
    .eq('user_id', viewer.currentUser.userId)
    .single();

  const gradeLevelName = ((profile as StudentLearningProfileRow)?.grade_level?.display_name ?? 'Primary').trim() || 'Primary';

  return (
    <ReadCornerClient gradeLevel={gradeLevelName} />
  );
}
