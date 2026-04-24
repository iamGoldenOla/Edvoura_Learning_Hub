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
  CalendarCheck
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
    hour12: true 
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
    <div className="mx-auto max-w-[1600px] p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-10">
      
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-slate-200 pb-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-edvoura-gold/10 rounded-2xl">
               <CalendarCheck className="w-8 h-8 text-edvoura-gold" />
            </div>
            <h1 className="text-4xl font-black text-edvoura-navy tracking-tight">Master Schedule</h1>
          </div>
          <p className="text-slate-500 text-lg leading-relaxed">
            Organize and launch your virtual classrooms. Schedule recurring sessions or create one-off teaching slots.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="group relative">
            <Link href="/dash/tutor/schedule?action=sync-calendar">
              <Button variant="outline" className="h-14 px-6 border-slate-200 text-slate-600 bg-white shadow-sm hover:bg-slate-50 rounded-2xl font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" /> Google Calendar Sync
              </Button>
            </Link>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Keep your personal calendar updated with lesson reminders
            </div>
          </div>
          
          <a href="#scheduler" className="flex-1 lg:flex-none">
            <Button className="h-14 px-8 bg-edvoura-navy hover:bg-slate-800 text-white shadow-xl shadow-edvoura-navy/10 rounded-2xl font-bold w-full flex items-center gap-2">
              <Plus className="w-5 h-5" /> Open Time Slot
            </Button>
          </a>
        </div>
      </div>

      {/* Notifications */}
      {created && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 text-emerald-900 shadow-sm animate-in zoom-in-95">
          <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold">Session Published Successfully</p>
            <p className="text-sm text-emerald-700/80">Students enrolled in the class can now see this on their live dashboard.</p>
          </div>
        </div>
      )}

      {errorParam && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-6 text-rose-900 shadow-sm animate-in zoom-in-95">
           <div className="h-10 w-10 shrink-0 rounded-full bg-rose-500 flex items-center justify-center text-white">
            <Info className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold">Execution Error</p>
            <p className="text-sm text-rose-700/80">{decodeURIComponent(errorParam)}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-10 items-start">
        
        {/* Session List Area */}
        <section className="space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/30 p-10">
            <div className="flex items-center justify-between gap-6 mb-10">
              <div>
                <h2 className="text-2xl font-black text-edvoura-navy">Upcoming Sessions</h2>
                <p className="text-slate-500 mt-2">Sessions scheduled for the next 12 weeks.</p>
              </div>
              <div className="px-5 py-2.5 rounded-2xl bg-slate-100 text-sm font-black text-slate-700 tracking-tight">
                {upcomingSessions.length} Active
              </div>
            </div>

            <div className="space-y-6">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <article key={session.id} className="group relative rounded-3xl border border-slate-100 bg-slate-50/40 p-8 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                      <div className="flex gap-6">
                         <div className="hidden sm:flex flex-col items-center justify-center h-20 w-20 rounded-2xl bg-white border border-slate-100 shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{new Date(session.scheduled_start_at).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-2xl font-black text-slate-900">{new Date(session.scheduled_start_at).getDate()}</span>
                         </div>
                         <div>
                            <div className="flex items-center gap-2 mb-2">
                               <span className="px-3 py-1 bg-edvoura-navy/5 text-edvoura-navy text-[10px] font-black uppercase tracking-widest rounded-lg">
                                 {session.subject_name}
                               </span>
                               <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                 {session.grade_level_name}
                               </span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{session.title}</h3>
                            <div className="mt-3 flex items-center gap-4 text-sm font-bold text-slate-500">
                               <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {formatDateTime(session.scheduled_start_at)}</span>
                               <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                               <span>{session.class_title}</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                         <TutorLessonStartButton lessonId={session.id} status={session.status} />
                         
                         {session.join_url && (
                           <a href={session.join_url} target="_blank" rel="noreferrer">
                             <Button className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 font-bold flex items-center gap-2">
                               <Video className="w-5 h-5" /> Join Meet
                             </Button>
                           </a>
                         )}
                         
                         <DeleteLessonButton lessonId={session.id} />
                      </div>
                    </div>

                    <div className="mt-8 flex items-center gap-4 border-t border-slate-100 pt-6">
                       <div className="flex -space-x-2">
                          {[1,2,3].map(i => (
                             <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200"></div>
                          ))}
                          <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">+12</div>
                       </div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enrolled Students Ready</p>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/50 p-20 text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-xl shadow-slate-200/50 text-slate-200">
                    <CalendarIcon className="h-12 w-12" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Your schedule is clear</h3>
                  <p className="mt-3 text-slate-500 max-w-sm mx-auto">
                    Publish your first live teaching slot using the form on the right to start engaging with your students.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Scheduler Form Area */}
        <section id="scheduler" className="space-y-8 sticky top-10">
          <div className="rounded-[2.5rem] border border-slate-200/60 bg-white shadow-2xl shadow-slate-200/30 p-10">
            <h2 className="text-2xl font-black text-edvoura-navy">Publish Live Slot</h2>
            <p className="mt-3 text-slate-500 leading-relaxed">
              Define your session details and recurrence. Everything will sync instantly to the student portal.
            </p>

            <form action={createTutorLiveSlot} className="mt-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="subjectId" className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Subject
                  </label>
                  <select
                    id="subjectId"
                    name="subjectId"
                    required
                    className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-edvoura-navy outline-none transition-all"
                  >
                    {(subjects || []).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="gradeLevelId" className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Grade Level
                  </label>
                  <select
                    id="gradeLevelId"
                    name="gradeLevelId"
                    required
                    className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-edvoura-navy outline-none transition-all"
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
                <label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Session Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g. Mastering Algebraic Expressions"
                  className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-edvoura-navy outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="scheduledStartAt" className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Start Time
                  </label>
                  <input
                    id="scheduledStartAt"
                    name="scheduledStartAt"
                    type="datetime-local"
                    required
                    className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-edvoura-navy outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="scheduledEndAt" className="text-xs font-black uppercase tracking-widest text-slate-400">
                    End Time
                  </label>
                  <input
                    id="scheduledEndAt"
                    name="scheduledEndAt"
                    type="datetime-local"
                    required
                    className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-edvoura-navy outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    name="isRecurring"
                    className="h-5 w-5 rounded-md border-slate-300 text-edvoura-navy focus:ring-edvoura-navy transition-all"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-bold text-slate-700">
                    Repeat Weekly
                  </label>
                </div>
                <div className="space-y-2">
                  <label htmlFor="recurrenceWeeks" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Duration
                  </label>
                  <select
                    id="recurrenceWeeks"
                    name="recurrenceWeeks"
                    className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-bold text-slate-900 outline-none"
                    defaultValue="4"
                  >
                    <option value="1">Just once</option>
                    <option value="4">4 weeks</option>
                    <option value="8">8 weeks</option>
                    <option value="12">Full Term (12w)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="joinUrl" className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Student Meet Link <span className="text-slate-300 font-normal">(Optional)</span>
                </label>
                <input
                  id="joinUrl"
                  name="joinUrl"
                  type="url"
                  placeholder="Leave blank for auto-generation"
                  className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-edvoura-navy outline-none transition-all"
                />
              </div>

              <Button type="submit" className="w-full h-16 bg-edvoura-navy hover:bg-slate-900 text-white rounded-[1.25rem] font-black text-lg shadow-2xl shadow-edvoura-navy/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Publish to Dashboard
              </Button>
            </form>
          </div>

          {/* Quick Guide Card */}
          <div className="rounded-[2rem] bg-gradient-to-br from-edvoura-navy to-slate-900 p-8 text-white">
             <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                   <Info className="h-5 w-5 text-edvoura-gold" />
                </div>
                <h3 className="text-xl font-black">Pro Tip</h3>
             </div>
             <p className="text-slate-300 text-sm leading-relaxed">
                You can leave the Meet Link blank; the system will automatically generate a unique Google Meet for your session and share it with your students.
             </p>
          </div>
        </section>
      </div>
    </div>
  );
}

const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
