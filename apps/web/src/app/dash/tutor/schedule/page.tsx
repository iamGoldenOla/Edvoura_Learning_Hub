import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  Plus,
  Video,
  Info,
  CheckCircle2,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { createTutorLiveSlot } from '@/app/dash/tutor/schedule/actions';
import TutorLessonStartButton from '@/components/dashboards/TutorLessonStartButton';
import { requireAppViewer } from '@/lib/app-context';
import { createClient } from '@/utils/supabase/server';
import DeleteLessonButton from '@/components/dashboards/DeleteLessonButton';

type TutorLiveScheduleRow = {
  id: string;
  title: string;
  class_title: string;
  subject_name: string;
  grade_level_name: string;
  scheduled_start_at: string;
  scheduled_end_at: string;
  status: string;
  provider: string;
  join_url: string | null;
  host_url: string | null;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

export default async function TutorSchedulePage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAppViewer();
  const searchParams = (await props.searchParams) ?? {};
  const created = searchParams.created === '1';
  const errorParam = typeof searchParams.error === 'string' ? searchParams.error : null;

  const supabase = await createClient();
  const [
    { data: scheduleRows = [] },
    { data: gradeLevels = [] },
    { data: subjects = [] },
    { data: allStudentProfiles = [] }
  ] = await Promise.all([
    supabase.rpc('list_tutor_live_schedule'),
    supabase.from('grade_levels').select('id, display_name').order('display_name'),
    supabase.from('subjects').select('id, name').order('name'),
    supabase.from('student_profiles').select('user_id, grade_level_id'),
  ]);

  const studentUserIds = (allStudentProfiles ?? []).map((sp) => sp.user_id);
  const studentGradeIds = [...new Set((allStudentProfiles ?? []).map((sp) => sp.grade_level_id))];

  const [{ data: studentProfilesInfo = [] }, { data: studentGradesInfo = [] }] = await Promise.all([
    studentUserIds.length
      ? supabase.from('profiles').select('id, full_name, email').in('id', studentUserIds)
      : Promise.resolve({ data: [] }),
    studentGradeIds.length
      ? supabase.from('grade_levels').select('id, display_name').in('id', studentGradeIds)
      : Promise.resolve({ data: [] }),
  ]);

  const profilesMap = new Map<string, { full_name: string | null; email: string | null }>(
    (studentProfilesInfo ?? []).map((p) => [p.id, p])
  );
  const gradesMap = new Map<string, string>(
    (studentGradesInfo ?? []).map((g) => [g.id, g.display_name])
  );

  const studentOptions = (allStudentProfiles ?? []).map((sp) => {
    const profile = profilesMap.get(sp.user_id);
    const gradeName = gradesMap.get(sp.grade_level_id) ?? 'Grade pending';
    return {
      userId: sp.user_id,
      name: profile?.full_name || profile?.email || 'Unnamed student',
      gradeName,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  const typedSchedule = (scheduleRows ?? []) as TutorLiveScheduleRow[];
  const upcomingSessions = typedSchedule.filter((session) => new Date(session.scheduled_end_at) >= new Date());

  return (
    <div className="space-y-5 sm:space-y-8 w-full min-w-0 max-w-[1400px] mx-auto pb-20">
      <section className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[6px_6px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        
        {/* Header */}
        <div className="p-5 sm:p-8 md:p-12 border-b-[3px] sm:border-b-[4px] border-dark bg-blue-50">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8 min-w-0">
            <div className="space-y-3 min-w-0 w-full">
              <span className="inline-flex items-center justify-center text-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border-[2px] sm:border-[3px] border-dark bg-white text-[9px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] font-black shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] break-words max-w-full">
                TEACHING MANAGEMENT
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark break-words">
                Master Schedule
              </h1>
              <p className="text-sm md:text-base font-semibold normal-case text-dark/70 max-w-xl break-words">
                Organize your virtual classrooms and manage recurring sessions from one solid command center.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 sm:gap-4 w-full lg:w-auto">
              <div className="w-full sm:flex-1 lg:flex-none">
                <button disabled className="w-full h-12 sm:h-14 px-4 sm:px-6 bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] text-sm sm:text-base inline-flex items-center justify-center opacity-60 cursor-not-allowed">
                  <Clock className="mr-2 w-4 h-4" /> Sync Calendar <span className="ml-1 text-[9px] uppercase tracking-widest text-dark/50">(Soon)</span>
                </button>
              </div>
              <a href="#scheduler" className="w-full sm:flex-1 lg:flex-none">
                <button className="w-full h-12 sm:h-14 px-4 sm:px-8 bg-yellow border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 text-sm sm:text-base inline-flex items-center justify-center">
                  <Plus className="mr-2 w-5 h-5" /> New Session
                </button>
              </a>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 md:p-12 min-w-0">
          
          {/* Notifications */}
          <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
            {created && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 rounded-xl border-[3px] border-dark bg-emerald-100 p-4 sm:p-6 shadow-[3px_3px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C]">
                <div className="h-10 w-10 shrink-0 rounded-full border-[2px] border-dark bg-emerald-400 flex items-center justify-center text-dark">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-black text-dark">Session Published Successfully</p>
                  <p className="text-sm font-semibold text-dark/70">The lesson is now live on the student dashboards.</p>
                </div>
              </div>
            )}

            {errorParam && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 rounded-xl border-[3px] border-dark bg-rose-100 p-4 sm:p-6 shadow-[3px_3px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C]">
                <div className="h-10 w-10 shrink-0 rounded-full border-[2px] border-dark bg-rose-500 flex items-center justify-center text-white">
                  <Info className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-black text-dark">Creation Error</p>
                  <p className="text-sm font-bold text-dark/70">{decodeURIComponent(errorParam)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start min-w-0">
            
            {/* Session List Area */}
            <section className="lg:col-span-7 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 sm:px-2">
                <h2 className="text-xl sm:text-2xl font-black text-dark">Upcoming Live Sessions</h2>
                <span className="bg-yellow border-[2px] sm:border-[3px] border-dark px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black text-dark shadow-[2px_2px_0px_#060E1C] sm:shadow-[3px_3px_0px_#060E1C] self-start sm:self-auto">
                  {upcomingSessions.length} Active
                </span>
              </div>

              <div className="space-y-6">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => (
                    <article key={session.id} className="bg-off-white border-[3px] border-dark rounded-[20px] sm:rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0">
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 min-w-0">
                        {/* Date Label */}
                        <div className="flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-0 h-14 sm:h-20 w-full sm:w-20 bg-white rounded-xl border-[3px] border-dark shadow-[2px_2px_0px_#060E1C] shrink-0">
                          <span className="text-[10px] font-black uppercase tracking-widest text-dark/50">{new Date(session.scheduled_start_at).toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-xl sm:text-2xl font-black text-dark">{new Date(session.scheduled_start_at).getDate()}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-white text-dark text-[9px] font-black uppercase tracking-[0.1em] rounded-md border-[2px] border-dark">
                              {session.subject_name}
                            </span>
                            <span className="px-3 py-1 bg-white text-dark text-[9px] font-black uppercase tracking-[0.1em] rounded-md border-[2px] border-dark">
                              {session.grade_level_name}
                            </span>
                            {session.status === 'live' && (
                              <span className="px-3 py-1 bg-rose-500 border-[2px] border-dark text-white text-[9px] font-black uppercase tracking-[0.1em] rounded-md animate-pulse">
                                ● Live
                              </span>
                            )}
                          </div>
                          <h3 className="text-2xl md:text-3xl font-black text-dark tracking-tight leading-tight [overflow-wrap:anywhere]">{session.title}</h3>
                          <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-sm font-bold text-dark/60">
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-dark/40" /> {formatDateTime(session.scheduled_start_at)}</span>
                            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-dark/40" /> Class: {session.class_title}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t-[3px] border-dark/10 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
                          {session.status === 'live' ? (
                            (session.host_url || session.join_url) ? (
                              <a href={session.host_url || session.join_url || ''} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                                <Button className="w-full sm:w-auto h-12 px-4 sm:px-6 bg-emerald-400 border-[3px] border-dark text-dark rounded-xl font-black flex items-center justify-center gap-2 shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 text-sm sm:text-base">
                                  <Video className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> Join Classroom
                                </Button>
                              </a>
                            ) : (
                              <span className="text-xs font-bold text-amber-800 bg-amber-100 border-[3px] border-dark px-4 py-3 rounded-xl shadow-[2px_2px_0px_#060E1C]">
                                No link — please delete, recreate & paste Meet link.
                              </span>
                            )
                          ) : (
                            <>
                              <TutorLessonStartButton lessonId={session.id} status={session.status} />
                              {(session.host_url || session.join_url) && (
                                <a href={session.host_url || session.join_url || ''} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                                  <button className="w-full sm:w-auto h-12 px-4 sm:px-5 bg-white border-[3px] border-dark text-dark hover:bg-slate-50 rounded-xl font-black flex items-center justify-center gap-2 shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none text-sm sm:text-base">
                                    <ExternalLink className="w-4 h-4" /> Preview Link
                                  </button>
                                </a>
                              )}
                            </>
                          )}
                        </div>
                        <div className="w-full sm:w-auto mt-2 sm:mt-0 flex justify-end">
                          <DeleteLessonButton lessonId={session.id} />
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="bg-slate-50 rounded-[24px] sm:rounded-3xl border-[3px] border-dashed border-dark/20 p-8 sm:p-20 text-center min-w-0">
                    <div className="mx-auto mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border-[3px] border-dark bg-white shadow-[4px_4px_0px_#060E1C]">
                      <CalendarIcon className="h-8 w-8 text-dark" />
                    </div>
                    <h3 className="text-2xl font-black text-dark">Your schedule is clear</h3>
                    <p className="mt-2 text-dark/60 text-sm max-w-xs mx-auto font-bold">
                      Create your first live teaching slot using the form on the right.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Scheduler Form Area */}
            <section id="scheduler" className="lg:col-span-5 lg:sticky lg:top-10">
              <div className="bg-white rounded-[20px] sm:rounded-3xl border-[3px] sm:border-[4px] border-dark p-5 sm:p-8 shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] min-w-0">
                <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight">Publish Live Slot</h2>
                <p className="mt-2 text-dark/70 text-sm font-semibold">
                  Fill in the details below to sync a new session to the student portal.
                </p>

                <form action={createTutorLiveSlot} className="mt-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="subjectId" className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-dark/60">
                        Subject
                      </label>
                      <select
                        id="subjectId"
                        name="subjectId"
                        required
                        className="w-full h-12 rounded-xl border-[2px] sm:border-[3px] border-dark bg-off-white px-3 sm:px-4 text-sm font-bold text-dark outline-none transition-all focus:border-yellow focus:bg-white"
                      >
                        {(subjects || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="gradeLevelId" className="text-[11px] font-black uppercase tracking-widest text-dark/60">
                        Grade Level / Audience
                      </label>
                      <select
                        id="gradeLevelId"
                        name="gradeLevelId"
                        required
                        className="w-full h-12 rounded-xl border-[2px] sm:border-[3px] border-dark bg-off-white px-3 sm:px-4 text-sm font-bold text-dark outline-none transition-all focus:border-yellow focus:bg-white"
                      >
                        {(gradeLevels || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.display_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="studentId" className="text-[11px] font-black uppercase tracking-widest text-dark/60">
                      Target Student (Optional - for 1-on-1 Sessions)
                    </label>
                    <select
                      id="studentId"
                      name="studentId"
                      className="w-full h-12 rounded-xl border-[2px] sm:border-[3px] border-dark bg-off-white px-3 sm:px-4 text-sm font-bold text-dark outline-none transition-all focus:border-yellow focus:bg-white"
                    >
                      <option value="">Group Session (All students in selected Grade Level)</option>
                      {(studentOptions || []).map((item) => (
                        <option key={item.userId} value={item.userId}>
                          {item.name} ({item.gradeName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="title" className="text-[11px] font-black uppercase tracking-widest text-dark/60">
                      Session Title
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      required
                      placeholder="e.g. Mastering Algebraic Expressions"
                      className="w-full h-12 rounded-xl border-[2px] sm:border-[3px] border-dark bg-off-white px-3 sm:px-4 text-sm font-bold text-dark outline-none transition-all focus:border-yellow focus:bg-white placeholder:text-dark/30"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="scheduledStartAt" className="text-[11px] font-black uppercase tracking-widest text-dark/60">
                        Start Time
                      </label>
                        <input
                        id="scheduledStartAt"
                        name="scheduledStartAt"
                        type="datetime-local"
                        required
                        className="w-full h-12 rounded-xl border-[2px] sm:border-[3px] border-dark bg-off-white px-3 sm:px-4 text-sm font-bold text-dark outline-none transition-all focus:border-yellow focus:bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="scheduledEndAt" className="text-[11px] font-black uppercase tracking-widest text-dark/60">
                        End Time
                      </label>
                      <input
                        id="scheduledEndAt"
                        name="scheduledEndAt"
                        type="datetime-local"
                        required
                        className="w-full h-12 rounded-xl border-[2px] sm:border-[3px] border-dark bg-off-white px-3 sm:px-4 text-sm font-bold text-dark outline-none transition-all focus:border-yellow focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border-[2px] sm:border-[3px] border-dark bg-white shadow-[2px_2px_0px_#060E1C]">
                      <input
                        type="checkbox"
                        id="isRecurring"
                        name="isRecurring"
                        className="h-4 w-4 sm:h-5 sm:w-5 rounded border-[2px] border-dark text-dark accent-dark focus:ring-dark shrink-0"
                      />
                      <label htmlFor="isRecurring" className="text-xs font-black text-dark break-words">
                        Repeat Weekly
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="recurrenceWeeks" className="text-[11px] font-black uppercase tracking-widest text-dark/60">
                        Weeks
                      </label>
                      <select
                        id="recurrenceWeeks"
                        name="recurrenceWeeks"
                        className="w-full h-12 rounded-xl border-[2px] sm:border-[3px] border-dark bg-off-white px-3 sm:px-4 text-sm font-bold text-dark outline-none focus:border-yellow focus:bg-white"
                        defaultValue="4"
                      >
                        <option value="1">Just once</option>
                        <option value="4">4 weeks</option>
                        <option value="8">8 weeks</option>
                        <option value="12">12 weeks</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="joinUrl" className="text-[11px] font-black uppercase tracking-widest text-dark/60 break-words">
                      Google Meet Link <span className="text-rose-500 font-bold">(Required)</span>
                    </label>
                    <input
                      id="joinUrl"
                      name="joinUrl"
                      type="url"
                      required
                      placeholder="e.g. https://meet.google.com/abc-defg-hij"
                      className="w-full h-12 rounded-xl border-[2px] sm:border-[3px] border-dark bg-off-white px-3 sm:px-4 text-sm font-bold text-dark outline-none transition-all focus:border-yellow focus:bg-white placeholder:text-dark/30"
                    />
                    <p className="text-[10px] sm:text-[11px] text-dark/60 font-semibold leading-snug break-words">
                      Go to <a href="https://meet.google.com" target="_blank" rel="noreferrer" className="underline text-blue-600">meet.google.com</a> → New Meeting → Create for later → paste link here.
                    </p>
                  </div>

                  <button type="submit" className="w-full h-12 sm:h-14 bg-dark hover:bg-dark/90 text-white border-[2px] sm:border-[3px] border-dark rounded-xl font-black text-base sm:text-lg transition-all active:scale-95 shadow-[3px_3px_0px_#F5C518] sm:shadow-[4px_4px_0px_#F5C518] break-words flex items-center justify-center">
                    Publish to Dashboard
                  </button>
                </form>
              </div>

              {/* Neo-brutalist Tip Card */}
              <div className="mt-6 sm:mt-8 bg-yellow border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-white border-[2px] border-dark rounded-lg">
                     <Info className="h-5 w-5 text-dark" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-dark">Pro Tip</span>
                </div>
                <p className="text-dark text-sm font-bold leading-relaxed">
                  The system uses a 24-hour clock. For an afternoon session (e.g. 1 PM), please enter 13:00 to avoid scheduling errors.
                </p>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
