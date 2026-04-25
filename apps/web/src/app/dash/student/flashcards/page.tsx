import { requireAppViewer } from '@/lib/app-context';
import { createClient } from '@/utils/supabase/server';
import FlashcardClient from './FlashcardClient';

export default async function FlashcardPage() {
  const viewer = await requireAppViewer();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('student_learning_profiles')
    .select('grade_level:grade_levels(code, name)')
    .eq('student_id', viewer.currentUser.userId)
    .single();

  return (
    <FlashcardClient 
      gradeLevel={(profile?.grade_level as any)?.name || 'Primary'} 
    />
  );
}
