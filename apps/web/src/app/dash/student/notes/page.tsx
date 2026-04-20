import Link from 'next/link';
import { getStudentDashboardData, requireAppViewer } from '@/lib/app-context';

export default async function NotesPage() {
  const viewer = await requireAppViewer();
  let dashboard;

  try {
    dashboard = await getStudentDashboardData(viewer.accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load notes and resources.';
    return (
      <div className="max-w-3xl mx-auto bg-white border-[4px] border-dark rounded-[28px] p-10 shadow-[10px_10px_0px_#060E1C]">
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

  return (
    <div className="space-y-8 max-w-[1320px]">
      <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-8">
        <h1 className="text-4xl font-heading tracking-tight text-dark">Notes and Resources</h1>
        <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
          Keep study materials, tutor notes, and revision references organized in one academic base.
        </p>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6 xl:col-span-2">
          <h2 className="text-2xl font-black text-dark">Tutor Notes and Study Guides</h2>
          <div className="mt-4 space-y-3">
            {resources.length > 0 ? (
              resources.map((resource) => (
                <article key={resource.id} className="border-[3px] border-dark rounded-2xl bg-white p-4">
                  <p className="text-[11px] tracking-[0.25em] text-dark/40">{resource.subject}</p>
                  <h3 className="text-lg font-black text-dark">{resource.title}</h3>
                  <p className="text-sm normal-case text-dark/70 font-semibold">{resource.tutor}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href="/dash/student/classes"
                      className="inline-flex items-center justify-center px-3 py-2 border-[2px] border-dark bg-yellow text-dark font-black uppercase text-[10px] tracking-widest"
                    >
                      Open Class
                    </Link>
                    <Link
                      href="/dash/student/exam-prep"
                      className="inline-flex items-center justify-center px-3 py-2 border-[2px] border-dark bg-white text-dark font-black uppercase text-[10px] tracking-widest"
                    >
                      Open Drill
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="border-[3px] border-dashed border-dark/30 rounded-2xl p-6 text-sm normal-case text-dark/60">
                No uploaded resource is available yet.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">Revision Focus</h2>
            <div className="mt-4 space-y-2">
              {revisionList.length > 0 ? (
                revisionList.map((item) => (
                  <div key={item.id} className="rounded-xl border-[2px] border-dark bg-off-white p-3">
                    <p className="text-sm font-black text-dark">{item.subject}</p>
                    <p className="text-xs text-dark/70 font-semibold mt-1">{item.note}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm normal-case text-dark/70 font-semibold">
                  Revision recommendations will appear after progress updates.
                </p>
              )}
            </div>
          </section>

          <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">Exam Prep Quick Links</h2>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <Link
                href="/dash/student/exam-prep"
                className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest"
              >
                Test & Drill Center
              </Link>
              <Link
                href="/dash/student/past-questions"
                className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-white text-dark font-black uppercase text-xs tracking-widest"
              >
                Revision Hub
              </Link>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

