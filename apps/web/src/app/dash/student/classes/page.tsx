import { CalendarClock, Layers, Rocket, Video } from 'lucide-react';
import { getStudentDashboardData, requireAppViewer } from '@/lib/app-context';

const formatDate = (value: string | null) => {
  if (!value) return 'TBD';
  return new Date(value).toLocaleDateString([], { dateStyle: 'medium' });
};

export default async function StudentClassesPage() {
  const viewer = await requireAppViewer();
  const dashboard = await getStudentDashboardData(viewer.accessToken);

  const enrollments = dashboard.enrollments.map((e) => ({
    id: e.id,
    classId: e.classId,
    title: e.classTitle,
    subject: e.subjectName,
    status: 'active',
    tutorName: e.tutorName,
    hasLiveLesson: dashboard.upcomingLessons.some(l => l.classTitle === e.classTitle && (l.status === 'live' || l.status === 'scheduled'))
  }));

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1680px] mx-auto pb-20 w-full min-w-0">
      <section className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[6px_6px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden w-full min-w-0">
        <div className="p-5 sm:p-8 md:p-12 border-b-[3px] sm:border-b-[4px] border-dark bg-blue-50">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 sm:gap-6">
            <div className="space-y-3 min-w-0">
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border-[2px] sm:border-[3px] border-dark bg-white text-[10px] tracking-[0.2em] font-black shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C]">
                Explorer Hub
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark break-words">
                My Classes
              </h1>
              <p className="text-xs sm:text-sm md:text-base font-semibold normal-case text-dark/70 max-w-3xl break-words">
                Track your active classes, schedule windows, and session readiness from one clean command center.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4 w-full lg:w-auto">
              <StatTile label="Active Classes" value={String(enrollments.length)} icon={Layers} />
              <StatTile
                label="Ready to Join"
                value={String(enrollments.filter((entry) => entry.status === 'active').length)}
                icon={Video}
              />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-8 md:p-12">
          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {enrollments.map((course) => (
                <article
                  key={course.id}
                  className="border-[3px] border-dark rounded-2xl bg-off-white p-5 md:p-6 shadow-[5px_5px_0px_#060E1C] min-w-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="text-[11px] tracking-[0.2em] text-dark/50">{course.subject}</p>
                      <h2 className="text-xl font-black text-dark leading-tight [overflow-wrap:anywhere]">
                        {course.title}
                      </h2>
                      <p className="text-sm font-semibold normal-case text-dark/70">
                        Tutor: {course.tutorName ?? 'Assigned tutor'}
                      </p>
                    </div>
                    <div className="w-11 h-11 rounded-xl border-[3px] border-dark bg-yellow flex items-center justify-center shrink-0">
                      <Rocket className="w-5 h-5 text-dark" />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {course.hasLiveLesson ? (
                      <a
                        href="/dash/student/live"
                        className="inline-flex items-center gap-2 px-4 py-2 border-[2px] border-dark bg-yellow text-[11px] font-black shadow-[3px_3px_0px_#060E1C] animate-pulse transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                      >
                        <Video className="w-4 h-4" />
                        Join Live Now
                      </a>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2 border-[2px] border-dark bg-slate-50 text-dark/30 text-[11px] font-black">
                        <Video className="w-4 h-4" />
                        Offline
                      </div>
                    )}
                    <a
                      href="/dash/student/assignments"
                      className="inline-flex items-center gap-2 px-4 py-2 border-[2px] border-dark bg-white text-[11px] font-black"
                    >
                      <CalendarClock className="w-4 h-4" />
                      View Tasks
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="border-[3px] border-dashed border-dark/30 rounded-2xl p-10 text-center bg-off-white">
              <h2 className="text-2xl font-black text-dark">No Active Classes Yet</h2>
              <p className="mt-3 text-sm font-semibold normal-case text-dark/60">
                You are not enrolled in any class right now. Once enrollment is set, classes will appear here.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="border-[3px] border-dark rounded-2xl bg-white p-4 shadow-[4px_4px_0px_#060E1C] min-w-0">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] tracking-[0.12em] text-dark/50">{label}</span>
        <Icon className="w-5 h-5 text-info shrink-0" />
      </div>
      <p className="mt-2 text-2xl md:text-3xl font-black text-dark leading-tight [overflow-wrap:anywhere]">{value}</p>
    </div>
  );
}
