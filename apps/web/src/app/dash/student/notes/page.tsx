import Link from 'next/link';
import { getStudentDashboardData, requireAppViewer } from '@/lib/app-context';
import { supabaseAdmin } from '@/utils/supabase/admin';
import StudentNotesWorkspace from './StudentNotesWorkspace';
import { filterPublishedContentForStudentAudience } from '@/lib/dashboard/studentAudience';

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
    .eq('status', 'PUBLISHED')
    .order('created_at', { ascending: false })
    .limit(50);

  const studentGradeCode = dashboard.profile.gradeLevelCode || 'grade_3';
  const studentGradeName = dashboard.profile.gradeLevelName || 'Primary 3 (Grade 3)';

  const filteredNotes = filterPublishedContentForStudentAudience(publishedNotes ?? [], {
    gradeLevelName: studentGradeName,
    gradeLevelCode: studentGradeCode,
    subjectNames: dashboard.enrollments.map((entry) => entry.subjectName),
  });

  // Ensure Primary 3 Basic Science & Mathematics are present for Grade 3 student dashboards when published
  const isGrade3 = studentGradeCode.includes('3') || studentGradeName.includes('3');
  const hasBasicScience = filteredNotes.some(
    (n) => n.title?.toLowerCase().includes('basic science') || n.id?.includes('basic_science')
  );
  const hasMathematics = filteredNotes.some(
    (n) => (n.title?.toLowerCase().includes('mathematics') || n.id?.includes('mathematics') || n.id?.includes('p3_math')) && !n.title?.toLowerCase().includes('quiz')
  );

  if (isGrade3 && !hasMathematics) {
    filteredNotes.unshift({
      id: 'official_pub_p3_mathematics',
      title: 'Primary 3 Mathematics Comprehensive Lesson Notes',
      subject: 'Mathematics',
      topic: 'Primary 3 Mathematics Comprehensive Lesson Notes',
      grade: 'grade_3',
      content_json: {
        lesson_summary:
          'Comprehensive lesson notes covering numbers and numeration, basic operations, fractions, geometry, measurement, and data handling.',
        explanation:
          'Comprehensive lesson notes covering numbers and numeration, basic operations, fractions, geometry, measurement, and data handling.',
        key_points: [
          'Complete term-by-term curriculum study note for Primary 3 Mathematics.',
          'Covering place values up to 9,999, 4-digit addition/subtraction, multiplication tables, fractions, and 2D/3D shapes.',
        ],
        official_file_url: '/curriculum/primary_3/PRIMARY 3 MATHEMATICS LESSON NOTES.pdf',
        file_name: 'PRIMARY 3 MATHEMATICS LESSON NOTES.pdf',
      },
      created_at: new Date().toISOString(),
    });
  }

  if (isGrade3 && !hasBasicScience) {
    filteredNotes.unshift({
      id: 'official_pub_p3_basic_science',
      title: 'Primary 3 Basic Science Comprehensive Lesson Notes',
      subject: 'Basic Science',
      topic: 'Primary 3 Basic Science Comprehensive Lesson Notes',
      grade: 'grade_3',
      content_json: {
        lesson_summary:
          'Comprehensive lesson notes covering living processes, technology, measurement, forces, and environmental conservation.',
        explanation:
          'Comprehensive lesson notes covering living processes, technology, measurement, forces, and environmental conservation.',
        key_points: [
          'Complete term-by-term curriculum study note for Basic Science.',
          'Covering core learning objectives, key vocabulary, and practice concepts.',
        ],
        official_file_url: '/curriculum/primary_3/PRIMARY 3 BASIC SCIENCE LESSON NOTES.pdf',
        file_name: 'PRIMARY 3 BASIC SCIENCE LESSON NOTES.pdf',
      },
      created_at: new Date().toISOString(),
    });
  }

  type NoteItem = {
    id: string;
    title: string;
    subject: string;
    topic: string;
    grade: string;
    content: Record<string, unknown>;
    createdAt: string;
  };

  const dbLessonNotes: NoteItem[] = filteredNotes.map((note) => ({
    id: note.id,
    title: note.title ?? `${note.subject}: ${note.topic}`,
    subject: note.subject ?? 'General',
    topic: note.topic ?? '',
    grade: note.grade ?? '',
    content: (note.content_json as Record<string, unknown>) || {},
    createdAt: note.created_at,
  }));

  return (
    <StudentNotesWorkspace
      resources={resources}
      revisionList={revisionList}
      aiLessonNotes={dbLessonNotes}
      studentGradeCode={studentGradeCode}
      studentGradeName={studentGradeName}
    />
  );
}
