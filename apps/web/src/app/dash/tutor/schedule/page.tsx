import Link from 'next/link';
import { Calendar as CalendarIcon, Clock, ExternalLink, Plus, Video } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { createTutorLiveSlot } from '@/app/dash/tutor/schedule/actions';
import TutorLessonStartButton from '@/components/dashboards/TutorLessonStartButton';
import { requireAppViewer } from '@/lib/app-context';
import { createClient } from '@/utils/supabase/server';

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
  new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export default async function TutorSchedulePage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireAppViewer();
  const searchParams = (await props.searchParams) ?? {};
  const created = searchParams.created === '1';
  const errorParam = typeof searchParams.error === 'string' ? searchParams.error : null;

  const supabase = await createClient();
  const [{ data: classesData = [] }, { data: scheduleRows = [] }, { data: gradeLevels = [] }, { data: subjects = [] }] = await Promise.all([
    supabase
      .from('classes')
      .select('id, title, grade_level_id, subject_id')
      .eq('primary_tutor_user_id', viewer.currentUser.userId)
      .order('title', { ascending: true }),
    supabase.rpc('list_tutor_live_schedule'),
    supabase.from('grade_levels').select('id, display_name').order('display_name'),
    supabase.from('subjects').select('id, name').order('name'),
  ]);

  const gradeById = new Map((gradeLevels ?? []).map((item) => [item.id, item.display_name]));
  const subjectById = new Map((subjects ?? []).map((item) => [item.id, item.name]));
  const typedSchedule = (scheduleRows ?? []) as TutorLiveScheduleRow[];
  const upcomingSessions = typedSchedule.filter((session) => new Date(session.scheduled_end_at) >= new Date());

  return (
    <div className="p-8 max-w-[1400px] mx-auto animate-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-edvoura-navy flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-edvoura-gold" /> Master Schedule
          </h1>
          <p className="mt-2 text-slate-600 text-sm">
            Publish real lesson slots directly from Supabase and attach Google Meet join links for students.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href="/dash/tutor/schedule?action=sync-calendar">
            <Button variant="outline" className="border-slate-300 text-slate-700 bg-white shadow-sm flex-1 md:flex-none flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Google Calendar sync
            </Button>
          </Link>
          <a href="#scheduler" className="flex-1 md:flex-none">
            <Button variant="primary" className="bg-edvoura-navy hover:bg-slate-800 text-white w-full flex items-center gap-2">
              <Plus className="w-4 h-4" /> Open Time Slot
            </Button>
          </a>
        </div>
      </div>

      {created ? (
        <section className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          Live lesson created successfully. Students enrolled in the selected class can now see it on their live dashboard.
        </section>
      ) : null}

      {errorParam ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {decodeURIComponent(errorParam)}
        </section>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
        <section className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-edvoura-navy">Upcoming live sessions</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Sessions published here flow straight to student live dashboards and lesson timelines.
                </p>
              </div>
              <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                {upcomingSessions.length} scheduled
              </div>
            </div>

            <div className="space-y-4">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <article key={session.id} className="rounded-2xl border border-slate-200 p-5 bg-slate-50/60">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                          {session.subject_name} · {session.grade_level_name}
                        </p>
                        <h3 className="text-xl font-black text-slate-900 mt-1">{session.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{session.class_title}</p>
                      </div>
                      <div className="text-sm font-bold text-slate-700">
                        {formatDateTime(session.scheduled_start_at)}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.16em]">
                      <span className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-600">
                        Ends {formatDateTime(session.scheduled_end_at)}
                      </span>
                      <span className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-600">
                        {session.provider.replace('_', ' ')}
                      </span>
                      <span className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-600">
                        {session.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <TutorLessonStartButton lessonId={session.id} status={session.status} />
                      
                      {session.join_url ? (
                        <a href={session.join_url} target="_blank" rel="noreferrer">
                          <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                            <Video className="w-4 h-4" /> Join Google Meet
                          </Button>
                        </a>
                      ) : (
                        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                          No student join link attached yet. Add one in the scheduler form.
                        </div>
                      )}

                      {session.host_url ? (
                        <a href={session.host_url} target="_blank" rel="noreferrer">
                          <Button variant="outline" className="border-slate-300 bg-white text-slate-700 flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" /> Open host link
                          </Button>
                        </a>
                      ) : null}
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-600">
                  No live sessions published yet. Use the scheduler to create the first tutor slot with an optional Google Meet URL.
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="scheduler" className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <h2 className="text-xl font-bold text-edvoura-navy">Open a live teaching slot</h2>
            <p className="mt-2 text-sm text-slate-500">
              Pick a subject and grade level to publish a live session for your students.
            </p>

            <form action={createTutorLiveSlot} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="subjectId" className="text-sm font-semibold text-slate-700">
                    Subject
                  </label>
                  <select
                    id="subjectId"
                    name="subjectId"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800"
                  >
                    {(subjects || []).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="gradeLevelId" className="text-sm font-semibold text-slate-700">
                    Grade Level
                  </label>
                  <select
                    id="gradeLevelId"
                    name="gradeLevelId"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800"
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
                <label htmlFor="title" className="text-sm font-semibold text-slate-700">
                  Session title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g. Fractions revision workshop"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="scheduledStartAt" className="text-sm font-semibold text-slate-700">
                    Start time
                  </label>
                  <input
                    id="scheduledStartAt"
                    name="scheduledStartAt"
                    type="datetime-local"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="scheduledEndAt" className="text-sm font-semibold text-slate-700">
                    End time
                  </label>
                  <input
                    id="scheduledEndAt"
                    name="scheduledEndAt"
                    type="datetime-local"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    name="isRecurring"
                    className="h-4 w-4 rounded border-slate-300 text-edvoura-navy focus:ring-edvoura-navy"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium text-slate-700">
                    Repeat weekly
                  </label>
                </div>
                <div className="space-y-2">
                  <label htmlFor="recurrenceWeeks" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    For how many weeks?
                  </label>
                  <select
                    id="recurrenceWeeks"
                    name="recurrenceWeeks"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800"
                    defaultValue="4"
                  >
                    <option value="1">Just this week</option>
                    <option value="4">Next 4 weeks</option>
                    <option value="8">Next 8 weeks</option>
                    <option value="12">Next 12 weeks (Full Term)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="joinUrl" className="text-sm font-semibold text-slate-700">
                  Student Google Meet URL <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="joinUrl"
                  name="joinUrl"
                  type="url"
                  placeholder="Leave blank to auto-generate via Edvoura Bot"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="hostUrl" className="text-sm font-semibold text-slate-700">
                  Tutor host URL
                </label>
                <input
                  id="hostUrl"
                  name="hostUrl"
                  type="url"
                  placeholder="Optional alternate host link"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full bg-edvoura-navy hover:bg-slate-800 text-white">
                Publish live session
              </Button>
            </form>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h3 className="text-sm uppercase tracking-[0.18em] font-black text-amber-900">Phase focus</h3>
            <ul className="mt-4 space-y-2 text-sm text-amber-900">
              <li>Tutor creates a live slot from a real class.</li>
              <li>Student sees the same lesson on the live dashboard.</li>
              <li>Google Meet links travel through Supabase, not the old API.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
