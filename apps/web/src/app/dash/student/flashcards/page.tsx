import { requireAppViewer } from '@/lib/app-context';
import { createClient } from '@/utils/supabase/server';
import FlashcardClient from './FlashcardClient';
import { getFlashcardSubjectSuggestions, getFlashcardTopicSuggestions } from '@/lib/student-practice/practiceLibrary';

type StudentLearningProfileRow = {
  grade_level?: {
    display_name?: string | null;
  } | null;
} | null;

export default async function FlashcardPage() {
  const viewer = await requireAppViewer();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('grade_level:grade_levels!grade_level_id(code, display_name)')
    .eq('user_id', viewer.currentUser.userId)
    .single();

  const gradeLevelName = ((profile as StudentLearningProfileRow)?.grade_level?.display_name ?? 'Primary').trim() || 'Primary';

  return (
    <FlashcardClient 
      gradeLevel={gradeLevelName}
      subjectSuggestions={getFlashcardSubjectSuggestions(gradeLevelName)}
      topicSuggestions={getFlashcardTopicSuggestions(gradeLevelName)}
    />
  );
}
