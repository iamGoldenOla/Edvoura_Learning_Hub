import { getStudentDashboardData, requireAppViewer } from '@/lib/app-context';

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export default async function LivePage() {
  const viewer = await requireAppViewer();
  let dashboard;

  try {
    dashboard = await getStudentDashboardData(viewer.accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load live sessions.';
    return (
      <div className="max-w-3xl mx-auto bg-white border-[4px] border-dark rounded-[28px] p-10 shadow-[10px_10px_0px_#060E1C]">
        <h1 className="text-3xl font-heading font-black text-dark mb-4">Live sessions unavailable</h1>
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

  return (
    <div className="space-y-8 max-w-[1320px]">
      <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-8">
        <h1 className="text-4xl font-heading tracking-tight text-dark">Live Sessions</h1>
        <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
          Upcoming scheduled classes pulled from the backend. Join links appear when the session provider has already provisioned one.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Metric label="Upcoming" value={String(dashboard.stats.upcomingLessons)} />
        <Metric label="Active Classes" value={String(dashboard.stats.activeClasses)} />
        <Metric label="Attendance" value={dashboard.stats.attendanceRate ? `${Number(dashboard.stats.attendanceRate).toFixed(0)}%` : '--'} />
      </div>

      <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
        <div className="space-y-4">
          {dashboard.upcomingLessons.length > 0 ? (
            dashboard.upcomingLessons.map((lesson) => (
              <article key={lesson.id} className="border-[3px] border-dark rounded-2xl bg-white p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <p className="text-[11px] tracking-[0.25em] text-dark/40">{lesson.subjectName}</p>
                    <h2 className="text-2xl font-black text-dark">{lesson.title}</h2>
                    <p className="text-sm normal-case text-dark/70 font-semibold">{lesson.classTitle}</p>
                  </div>
                  <div className="text-sm font-black text-dark">{formatDateTime(lesson.scheduledStartAt)}</div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-[11px]">
                  <span className="px-3 py-2 border-[2px] border-dark bg-off-white">
                    Ends {formatDateTime(lesson.scheduledEndAt)}
                  </span>
                  <span className="px-3 py-2 border-[2px] border-dark bg-off-white">
                    {lesson.provider.replace('_', ' ')}
                  </span>
                  <span className="px-3 py-2 border-[2px] border-dark bg-off-white">{lesson.status}</span>
                  {lesson.joinUrl ? (
                    <a
                      href={lesson.joinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-3 border-[3px] border-dark bg-yellow font-black uppercase text-[12px] tracking-widest shadow-[4px_4px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all animate-bounce"
                    >
                      Join Session Now
                    </a>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <div className="border-[3px] border-dashed border-dark/30 rounded-2xl p-6 text-sm normal-case text-dark/60">
              No live sessions are scheduled yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-[4px] border-dark bg-white rounded-[24px] shadow-[6px_6px_0px_#060E1C] p-5">
      <p className="text-[11px] tracking-[0.25em] text-dark/40">{label}</p>
      <p className="mt-3 text-3xl font-black text-dark">{value}</p>
    </div>
  );
}
