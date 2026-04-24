import { getStudentDashboardData, requireAppViewer } from '@/lib/app-context';
import { PlayCircle, Clock, Video, Sparkles } from 'lucide-react';

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
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded text-[9px] font-black uppercase tracking-widest">{lesson.subjectName}</span>
                       <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded text-[9px] font-black uppercase tracking-widest">{lesson.status}</span>
                    </div>
                    <h2 className="text-3xl font-black text-dark tracking-tight">{lesson.title}</h2>
                    <p className="text-sm normal-case text-dark/50 font-bold">{lesson.classTitle}</p>
                  </div>
                  
                  <div className="bg-slate-50 border-[3px] border-dark rounded-2xl p-4 flex flex-col items-center justify-center min-w-[140px]">
                    <div className="text-[10px] font-black uppercase tracking-widest text-dark/30 mb-1">Starts At</div>
                    <div className="text-lg font-black text-dark">{new Date(lesson.scheduledStartAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs font-bold text-dark/40">
                     <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(lesson.scheduledStartAt).toLocaleDateString()}</div>
                     <div className="flex items-center gap-1"><Video className="h-3 w-3" /> {lesson.provider.replace('_', ' ')}</div>
                  </div>
                  
                  {lesson.joinUrl ? (
                    <a
                      href={lesson.joinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-10 py-4 border-[4px] border-dark bg-yellow font-black uppercase text-sm tracking-widest shadow-[6px_6px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all animate-pulse flex items-center gap-3"
                    >
                      <PlayCircle className="h-6 w-6" />
                      Join Now!
                    </a>
                  ) : (
                    <div className="px-8 py-3 border-[3px] border-dark bg-slate-100 text-slate-400 font-black uppercase text-xs tracking-widest">
                      Getting Ready...
                    </div>
                  )}
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
