import Link from 'next/link';
import { getStudentDashboardData, requireAppViewer } from '@/lib/app-context';

const formatDateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'TBD';

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : 'No due date';

export default async function PlannerPage() {
  const viewer = await requireAppViewer();
  let dashboard;

  try {
    dashboard = await getStudentDashboardData(viewer.accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load planner.';
    return (
      <div className="max-w-5xl mx-auto bg-white border-[4px] border-dark rounded-[28px] p-10 shadow-[10px_10px_0px_#060E1C]">
        <h1 className="text-3xl font-heading font-black text-dark mb-4">Planner unavailable</h1>
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

  const lessons = [...dashboard.upcomingLessons]
    .sort(
      (left, right) =>
        new Date(left.scheduledStartAt).getTime() - new Date(right.scheduledStartAt).getTime(),
    )
    .slice(0, 8);
  const pendingAssignments = dashboard.assignments.filter(
    (assignment) =>
      !assignment.submissionStatus ||
      assignment.submissionStatus === 'draft' ||
      assignment.submissionStatus === 'submitted' ||
      assignment.submissionStatus === 'late',
  );
  const todayAgenda = pendingAssignments.slice(0, 4);

  return (
    <div className="space-y-8 max-w-[1320px]">
      <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-8">
        <h1 className="text-4xl font-heading tracking-tight text-dark">Academic Planner</h1>
        <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
          Manage your daily agenda, lesson schedule, and assignment timeline in one view.
        </p>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6 xl:col-span-2">
          <h2 className="text-2xl font-black text-dark">Today&apos;s Agenda</h2>
          <div className="mt-4 space-y-3">
            {todayAgenda.length > 0 ? (
              todayAgenda.map((assignment) => (
                <article key={assignment.id} className="border-[3px] border-dark rounded-2xl bg-white p-4">
                  <p className="text-[11px] tracking-[0.25em] text-dark/40">{assignment.subjectName}</p>
                  <h3 className="text-lg font-black text-dark">{assignment.title}</h3>
                  <p className="text-sm normal-case text-dark/70 font-semibold">Due {formatDate(assignment.dueAt)}</p>
                  <div className="mt-3">
                    <Link
                      href="/dash/student/assignments"
                      className="inline-flex items-center justify-center px-4 py-2 border-[2px] border-dark bg-yellow text-dark font-black uppercase text-[10px] tracking-widest"
                    >
                      Open Task
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="border-[3px] border-dashed border-dark/30 rounded-2xl p-6 text-sm normal-case text-dark/60">
                No urgent agenda item is available.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">Weekly Goals</h2>
            <div className="mt-4 space-y-3">
              <GoalRow label="Assignments planned" value={`${pendingAssignments.length}`} />
              <GoalRow label="Lessons this week" value={`${lessons.length}`} />
              <GoalRow label="Completed work" value={`${dashboard.stats.completedAssignments}`} />
            </div>
          </section>
          <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">Quick Actions</h2>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <Link
                href="/dash/student/classes"
                className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest"
              >
                View Lesson Plan
              </Link>
              <Link
                href="/dash/student/exam-prep"
                className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-white text-dark font-black uppercase text-xs tracking-widest"
              >
                Open Tests & Drills
              </Link>
            </div>
          </section>
        </section>
      </div>

      <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
        <h2 className="text-2xl font-black text-dark">Upcoming Lessons Timeline</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {lessons.length > 0 ? (
            lessons.map((lesson) => (
              <article key={lesson.id} className="border-[3px] border-dark rounded-2xl bg-off-white p-4">
                <p className="text-[11px] tracking-[0.25em] text-dark/40">{lesson.subjectName}</p>
                <h3 className="text-lg font-black text-dark">{lesson.title}</h3>
                <p className="text-sm normal-case text-dark/70 font-semibold">{lesson.classTitle}</p>
                <p className="mt-2 text-sm font-black text-dark">{formatDateTime(lesson.scheduledStartAt)}</p>
              </article>
            ))
          ) : (
            <div className="md:col-span-2 border-[3px] border-dashed border-dark/30 rounded-2xl p-6 text-sm normal-case text-dark/60">
              No scheduled lesson found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function GoalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border-[2px] border-dark bg-white px-3 py-2">
      <span className="text-[11px] tracking-[0.2em] text-dark/50">{label}</span>
      <span className="text-sm font-black text-dark">{value}</span>
    </div>
  );
}

