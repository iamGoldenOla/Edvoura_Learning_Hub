import Link from 'next/link';
import { getStudentDashboardData, requireAppViewer } from '@/lib/app-context';
import { supabaseAdmin } from '@/utils/supabase/admin';
import StudentNotesWorkspace from './StudentNotesWorkspace';
import { filterPublishedContentForStudentAudience } from '@/lib/dashboard/studentAudience';
import { OFFICIAL_CURRICULUM_DATABASE, PRIMARY_3_OFFICIAL_NOTES } from '@/app/dash/tutor/lesson-notes/page';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NotesPage() {
  const viewer = await requireAppViewer();
  let dashboard;

  try {
    dashboard = await getStudentDashboardData(viewer.accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load notes and resources.';
    return (
      <div className="max-w-5xl mx-auto bg-white border-[4px] border-dark rounded-[28px] p-10 shadow-[10px_10px_0px_#060E1C]">
        <h1 className="text-3xl font-heading font-black text-dark mb-4">Notes and resources unavailable</h1>
        <p className="text-sm text-dark/70 font-semibold normal-case mb-6">{message}</p>
        <Link
          href="/dash/student"
          className="inline-flex items-center justify-center px-6 py-3 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#060E1C]"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const resources = dashboard.enrollments.slice(0, 8).map((enrollment) => ({
    id: enrollment.id,
    subject: enrollment.subjectName,
    title: `${enrollment.classTitle} study guide`,
    tutor: enrollment.tutorName ?? 'Tutor pending',
  }));

  const revisionList = dashboard.progress.slice(0, 5).map((entry) => ({
    id: entry.id,
    subject: entry.subjectName ?? 'General',
    note: entry.masteryNotes ?? 'Review latest class notes and solve practice questions.',
  }));

  // Fetch published AI & tutor lesson notes for the student from Supabase
  const { data: publishedNotes } = await supabaseAdmin
    .from('ai_generated_content')
    .select('id, title, subject, topic, grade, content_json, created_at')
    .in('task_type', ['GENERATE_LESSON_NOTE', 'GENERATE_LESSON', 'GENERATE_FINANCIAL_LITERACY', 'GENERATE_COMMUNICATION_SKILL', 'LESSON_NOTE_PUSHED'])
    .eq('status', 'PUBLISHED')
    .order('created_at', { ascending: false })
    .limit(20);

  const filteredNotes = filterPublishedContentForStudentAudience(publishedNotes ?? [], {
    gradeLevelName: dashboard.profile.gradeLevelName,
    gradeLevelCode: dashboard.profile.gradeLevelCode,
    subjectNames: dashboard.enrollments.map((entry) => entry.subjectName),
  });

  const dbLessonNotes = filteredNotes.map((note) => ({
    id: note.id,
    title: note.title ?? `${note.subject}: ${note.topic}`,
    subject: note.subject ?? 'General',
    topic: note.topic ?? '',
    grade: note.grade ?? '',
    content: (note.content_json as Record<string, unknown>) || {},
    createdAt: note.created_at,
  }));

  // Master Official Curriculum Notes for the student's grade (e.g. Primary 3 Basic Science, Math, English, etc.)
  const gradeCode = dashboard.profile.gradeLevelCode || 'grade_3';
  const officialNotesForGrade = OFFICIAL_CURRICULUM_DATABASE[gradeCode] ?? PRIMARY_3_OFFICIAL_NOTES;

  const officialFormattedNotes = officialNotesForGrade.map((note) => ({
    id: note.id,
    title: note.title,
    subject: note.subjectName,
    topic: note.title,
    grade: note.gradeName,
    content: {
      lesson_summary: note.description,
      explanation: note.description,
      key_points: [
        `Complete term-by-term curriculum study note for ${note.subjectName}.`,
        `Covering core learning objectives, key vocabulary, and practice concepts.`,
      ],
      official_file_url: note.fileUrl,
      file_name: note.fileName,
    },
    createdAt: new Date().toISOString(),
  }));

  // Merge and deduplicate by title
  const notesMap = new Map<string, typeof dbLessonNotes[0]>();
  officialFormattedNotes.forEach((n) => notesMap.set(n.title.toLowerCase().trim(), n));
  dbLessonNotes.forEach((n) => notesMap.set(n.title.toLowerCase().trim(), n));

  const aiLessonNotes = Array.from(notesMap.values());

  return (
    <StudentNotesWorkspace
      resources={resources}
      revisionList={revisionList}
      aiLessonNotes={aiLessonNotes}
      studentGradeCode={dashboard.profile.gradeLevelCode || 'grade_1'}
      studentGradeName={dashboard.profile.gradeLevelName || 'Grade 1'}
    />
  );
}
