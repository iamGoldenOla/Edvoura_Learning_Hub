import Link from 'next/link';
import { getStudentDashboardData, requireAppViewer } from '@/lib/app-context';
import StudentNotesWorkspace from './StudentNotesWorkspace';

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

  return <StudentNotesWorkspace resources={resources} revisionList={revisionList} />;
}
