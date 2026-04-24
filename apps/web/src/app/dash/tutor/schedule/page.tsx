import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  Plus,
  Video,
  Trash2,
  ChevronRight,
  Info,
  CalendarCheck,
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
  const viewer = await requireAppViewer();
  const searchParams = (await props.searchParams) ?? {};
  const created = searchParams.created === '1';
  const errorParam = typeof searchParams.error === 'string' ? searchParams.error : null;

  const supabase = await createClient();
  const [{ data: scheduleRows = [] }, { data: gradeLevels = [] }, { data: subjects = [] }] = await Promise.all([
    supabase.rpc('list_tutor_live_schedule'),
    supabase.from('grade_levels').select('id, display_name').order('display_name'),
    supabase.from('subjects').select('id, name').order('name'),
  ]);

  const typedSchedule = (scheduleRows ?? []) as TutorLiveScheduleRow[];
  const upcomingSessions = typedSchedule.filter((session) => new Date(session.scheduled_end_at) >= new Date());

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Solid Header */}
      <div className="bg-[#0F172A] text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CalendarCheck className="w-6 h-6 text-[#EAB308]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#94A3B8]">Teaching Management</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight">Master Schedule</h1>
              <p className="text-[#94A3B8] mt-3 max-w-xl font-medium">
                Organize your virtual classrooms and manage recurring sessions from one solid command center.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <Link href="/dash/tutor/schedule?action=sync-calendar">
                <Button variant="outline" className="h-12 px-6 border-[#334155] text-[#94A3B8] bg-transparent hover:bg-[#1E293B] hover:text-white rounded-xl font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Sync Calendar
                </Button>
              </Link>
              <a href="#scheduler" className="flex-1 lg:flex-none">
                <Button className="h-12 px-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-black w-full flex items-center gap-2 shadow-lg shadow-blue-900/20">
                  <Plus className="w-5 h-5" /> New Session
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 space-y-10">
        {/* Notifications */}
        {created && (
          <div className="flex items-center gap-4 rounded-xl border-l-4 border-emerald-500 bg-white p-6 shadow-md animate-in slide-in-from-top-2">
            <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="font-black text-slate-900">Session Published Successfully</p>
              <p className="text-sm text-slate-500">The lesson is now live on the student dashboards.</p>
            </div>
          </div>
        )}

        {errorParam && (
          <div className="flex items-center gap-4 rounded-xl border-l-4 border-rose-500 bg-white p-6 shadow-md animate-in slide-in-from-top-2">
            <div className="h-10 w-10 shrink-0 rounded-full bg-rose-500 flex items-center justify-center text-white">
              <Info className="h-6 w-6" />
            </div>
            <div>
              <p className="font-black text-slate-900">Creation Error</p>
              <p className="text-sm text-slate-500 font-medium">{decodeURIComponent(errorParam)}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Session List Area */}
          <section className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-slate-900">Upcoming Live Sessions</h2>
              <span className="bg-white border border-slate-200 px-4 py-1.5 rounded-full text-xs font-black text-slate-600 shadow-sm">
                {upcomingSessions.length} Active
              </span>
            </div>

            <div className="space-y-4">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <article key={session.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Date Label */}
                      <div className="flex flex-col items-center justify-center h-20 w-20 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                        <span className="text-[10px] font-black uppercase text-slate-400">{new Date(session.scheduled_start_at).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-2xl font-black text-slate-900">{new Date(session.scheduled_start_at).getDate()}</span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-[#F1F5F9] text-[#475569] text-[9px] font-black uppercase tracking-widest rounded-md border border-[#E2E8F0]">
                            {session.subject_name}
                          </span>
                          <span className="px-2 py-0.5 bg-[#F1F5F9] text-[#475569] text-[9px] font-black uppercase tracking-widest rounded-md border border-[#E2E8F0]">
                            {session.grade_level_name}
                          </span>
                          {session.status === 'live' && (
                            <span className="px-2.5 py-0.5 bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest rounded-md animate-pulse">
                              ● Live
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{session.title}</h3>
                        <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-bold text-slate-500">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {formatDateTime(session.scheduled_start_at)}</span>
                          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400" /> Class: {session.class_title}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons — different for live vs scheduled */}
                    <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {session.status === 'live' ? (
                          /* LIVE: show Join Classroom if a link exists, otherwise show a helpful note */
                          (session.host_url || session.join_url) ? (
                            <a href={session.host_url || session.join_url || ''} target="_blank" rel="noreferrer">
                              <Button className="h-12 px-6 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                                <Video className="w-5 h-5 fill-current" /> Join Classroom
                              </Button>
                            </a>
                          ) : (
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl">
                              No meeting link — please delete this session, create a new one, and paste your Google Meet link in the form.
                            </span>
                          )
                        ) : (
                          /* SCHEDULED: show Start + optional Preview */
                          <>
                            <TutorLessonStartButton lessonId={session.id} status={session.status} />
                            {(session.host_url || session.join_url) && (
                              <a href={session.host_url || session.join_url || ''} target="_blank" rel="noreferrer">
                                <Button variant="outline" className="h-12 px-5 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-bold flex items-center gap-2">
                                  <ExternalLink className="w-4 h-4" /> Preview Link
                                </Button>
                              </a>
                            )}
                          </>
                        )}
                      </div>
                      <DeleteLessonButton lessonId={session.id} />
                    </div>
                  </article>
                ))
              ) : (
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                    <CalendarIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Your schedule is clear</h3>
                  <p className="mt-2 text-slate-500 text-sm max-w-xs mx-auto font-medium">
                    Create your first live teaching slot using the form on the right.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Scheduler Form Area */}
          <section id="scheduler" className="lg:col-span-5 sticky top-10">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Publish Live Slot</h2>
              <p className="mt-2 text-slate-500 text-sm font-medium">
                Fill in the details below to sync a new session to the student portal.
              </p>

              <form action={createTutorLiveSlot} className="mt-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="subjectId" className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      Subject
                    </label>
                    <select
                      id="subjectId"
                      name="subjectId"
                      required
                      className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 focus:border-blue-500 outline-none transition-all"
                    >
                      {(subjects || []).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="gradeLevelId" className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      Grade Level
                    </label>
                    <select
                      id="gradeLevelId"
                      name="gradeLevelId"
                      required
                      className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 focus:border-blue-500 outline-none transition-all"
                    >
                      {(gradeLevels || []).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.display_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="title" className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Session Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    placeholder="e.g. Mastering Algebraic Expressions"
                    className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="scheduledStartAt" className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      Start Time
                    </label>
                    <input
                      id="scheduledStartAt"
                      name="scheduledStartAt"
                      type="datetime-local"
                      required
                      className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="scheduledEndAt" className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      End Time
                    </label>
                    <input
                      id="scheduledEndAt"
                      name="scheduledEndAt"
                      type="datetime-local"
                      required
                      className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      name="isRecurring"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isRecurring" className="text-xs font-bold text-slate-700">
                      Repeat Weekly
                    </label>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="recurrenceWeeks" className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Weeks
                    </label>
                    <select
                      id="recurrenceWeeks"
                      name="recurrenceWeeks"
                      className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none"
                      defaultValue="4"
                    >
                      <option value="1">Just once</option>
                      <option value="4">4 weeks</option>
                      <option value="8">8 weeks</option>
                      <option value="12">12 weeks</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="joinUrl" className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Google Meet Link <span className="text-rose-400 font-normal">(Required)</span>
                  </label>
                  <input
                    id="joinUrl"
                    name="joinUrl"
                    type="url"
                    required
                    placeholder="e.g. https://meet.google.com/abc-defg-hij"
                    className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 focus:border-blue-500 outline-none transition-all"
                  />
                  <p className="text-[10px] text-slate-400 font-medium leading-snug">
                    Go to <a href="https://meet.google.com" target="_blank" rel="noreferrer" className="underline text-blue-500">meet.google.com</a> → New Meeting → Create for later → paste link here.
                  </p>
                </div>

                <Button type="submit" className="w-full h-14 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl font-black text-lg transition-all active:scale-98">
                  Publish to Dashboard
                </Button>
              </form>
            </div>

            {/* Solid Tip Card */}
            <div className="mt-6 bg-[#FEF9C3] border border-[#FEF08A] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-[#A16207]" />
                <span className="text-xs font-black uppercase tracking-widest text-[#A16207]">Pro Tip</span>
              </div>
              <p className="text-[#854D0E] text-xs font-bold leading-relaxed">
                The system uses a 24-hour clock. For an afternoon session (e.g. 1 PM), please enter 13:00 to avoid scheduling errors.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
