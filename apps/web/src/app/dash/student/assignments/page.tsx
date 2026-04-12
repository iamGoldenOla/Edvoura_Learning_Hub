import { getStudentDashboardData, requireAppViewer } from '@/lib/app-context';

const formatDate = (value: string | null) => {
  if (!value) return 'No due date';
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

export default async function StudentAssignmentsPage() {
  const viewer = await requireAppViewer();
  let dashboard;

  try {
    dashboard = await getStudentDashboardData(viewer.accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load assignments.';
    return (
      <div className="max-w-3xl mx-auto bg-white border-[4px] border-dark rounded-[28px] p-10 shadow-[10px_10px_0px_#060E1C]">
        <h1 className="text-3xl font-heading font-black text-dark mb-4">Assignments unavailable</h1>
        <p className="text-sm text-dark/70 font-semibold normal-case mb-6">{message}</p>
        <div className="flex flex-wrap gap-4">
          <a
            href="/dash/student"
            className="inline-flex items-center justify-center px-6 py-3 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#060E1C]"
          >
            Back to Overview
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border-[3px] border-dark bg-white text-dark font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#060E1C]"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const pending = dashboard.assignments.filter(
    (assignment) =>
      !assignment.submissionStatus ||
      assignment.submissionStatus === 'draft' ||
      assignment.submissionStatus === 'submitted' ||
      assignment.submissionStatus === 'late',
  );
  const graded = dashboard.assignments.filter(
    (assignment) =>
      assignment.submissionStatus === 'graded' || assignment.submissionStatus === 'returned',
  );

  return (
    <div className="space-y-8 max-w-[1320px]">
      <div className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-8">
        <h1 className="text-4xl font-heading tracking-tight text-dark">Assignments Workspace</h1>
        <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
          Real assignment data from the API, grouped by what still needs attention and what has already been graded.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <AssignmentBucket title="Needs Attention" items={pending} />
        <AssignmentBucket title="Graded Work" items={graded} graded />
      </div>
    </div>
  );
}

function AssignmentBucket({
  title,
  items,
  graded = false,
}: {
  title: string;
  items: Awaited<ReturnType<typeof getStudentDashboardData>>['assignments'];
  graded?: boolean;
}) {
  return (
    <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-black text-dark">{title}</h2>
        <span className="text-[11px] tracking-[0.25em] text-dark/50">{items.length}</span>
      </div>

      <div className="space-y-4">
        {items.length > 0 ? (
          items.map((item) => (
            <article key={item.id} className="border-[3px] border-dark rounded-2xl bg-white p-5">
              <p className="text-[11px] tracking-[0.25em] text-dark/40">{item.subjectName}</p>
              <h3 className="text-xl font-black text-dark">{item.title}</h3>
              <p className="text-sm normal-case text-dark/70 font-semibold">{item.classTitle}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-[11px]">
                <span className="px-3 py-2 border-[2px] border-dark bg-off-white">
                  {formatDate(item.dueAt)}
                </span>
                <span className="px-3 py-2 border-[2px] border-dark bg-off-white">
                  {item.submissionStatus ?? 'not started'}
                </span>
                {graded && item.score ? (
                  <span className="px-3 py-2 border-[2px] border-dark bg-yellow">
                    Score {Number(item.score).toFixed(0)}%
                  </span>
                ) : null}
              </div>
              {graded && item.feedbackText ? (
                <p className="mt-4 text-sm normal-case text-dark/70 font-semibold">{item.feedbackText}</p>
              ) : null}
            </article>
          ))
        ) : (
          <div className="border-[3px] border-dashed border-dark/30 rounded-2xl p-6 text-sm normal-case text-dark/60">
            {graded ? 'No graded work yet.' : 'Nothing is waiting on you right now.'}
          </div>
        )}
      </div>
    </section>
  );
}
