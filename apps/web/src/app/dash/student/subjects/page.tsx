import { createClient } from '@/utils/supabase/server';
import { requireAppViewer, getStudentDashboardData } from '@/lib/app-context';
import StudentSubjectsClient from './components/StudentSubjectsClient';

export default async function SubjectsPage() {
  const viewer = await requireAppViewer();
  const supabase = await createClient();
  let dashboard;

  try {
    dashboard = await getStudentDashboardData(viewer.accessToken);
  } catch (error) {
    // ignore
  }

  // Fetch ALL published AI content
  const { data: publishedContent } = await supabase
    .from('ai_generated_content')
    .select('id, title, subject, topic, grade, task_type, content_json, created_at')
    .in('status', ['published', 'PUBLISHED'])
    .order('created_at', { ascending: false });

  // Map and group them by subject
  const contentItems = (publishedContent ?? []).map((note) => ({
    id: note.id,
    title: note.title ?? `${note.subject}: ${note.topic}`,
    subject: note.subject ?? 'General Studies',
    topic: note.topic ?? '',
    grade: note.grade ?? '',
    taskType: note.task_type ?? 'UNKNOWN',
    content: note.content_json as Record<string, unknown>,
    createdAt: note.created_at,
  }));

  // Also include the student's actual enrollments
  const enrollments = dashboard?.enrollments.map((en) => ({
    id: en.id,
    subjectName: en.subjectName,
    classTitle: en.classTitle,
    tutorName: en.tutorName ?? 'Assigned tutor',
  })) ?? [];

  return <StudentSubjectsClient contentItems={contentItems} enrollments={enrollments} />;
}
