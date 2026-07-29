import Link from 'next/link';
import {
  CalendarClock,
  ClipboardCheck,
  FileText,
  MessageCircle,
  NotebookPen,
  Rocket,
  Trophy,
  Users,
  Video,
  ArrowRight,
  Clock,
  CheckCircle2,
  LayoutDashboard,
  Plus,
  BookOpen,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import DashboardFeedWidget from '@/components/dashboards/DashboardFeedWidget';
import TutorLiveContentPublisher from '@/components/dashboards/TutorLiveContentPublisher';
import TutorLessonStartButton from '@/components/dashboards/TutorLessonStartButton';
import DeleteLessonButton from '@/components/dashboards/DeleteLessonButton';
import { requireAppViewer, getTutorDashboardData } from '@/lib/app-context';
import { buildFeedCountMapFromNotificationData, getFeedRulesForRole } from '@/lib/dashboard/feedRules';
import { createClient } from '@/utils/supabase/server';

const tutorSections = [
  { href: '/dash/tutor/schedule', title: "Today's Classes", description: 'Schedule and manage live sessions.', icon: CalendarClock, color: 'text-dark bg-yellow' },
  { href: '/dash/tutor/roster', title: 'Students', description: 'Student list and performance.', icon: Users, color: 'text-dark bg-blue-200' },
  { href: '/dash/tutor/lesson-notes', title: 'Lesson Notes', description: 'Prepare notes and plans.', icon: NotebookPen, color: 'text-dark bg-pink-200' },
  { href: '/dash/tutor/builder', title: 'Assignments', description: 'Create and manage assignments.', icon: FileText, color: 'text-dark bg-emerald-200' },
  { href: '/dash/tutor/grading', title: 'Grading Queue', description: 'Grade submissions.', icon: ClipboardCheck, color: 'text-dark bg-rose-200' },
  { href: '/dash/tutor/messages', title: 'Messages', description: 'Direct chat with parents.', icon: MessageCircle, color: 'text-dark bg-purple-200' },
];

const formatDuration = (startIso: string, endIso: string) => {
  const diffMs = new Date(endIso).getTime() - new Date(startIso).getTime();
  const mins = Math.round(diffMs / (1000 * 60));
  return `${mins}m`;
};

export default async function TutorDashboard() {
  const viewer = await requireAppViewer();
  const dashboard = await getTutorDashboardData();
  const supabase = await createClient();
  const [{ data: notifications = [] }, { count: pendingReviewCount }] = await Promise.all([
    supabase
      .from('notifications')
      .select('data')
      .eq('recipient_user_id', viewer.currentUser.userId)
      .eq('status', 'unread')
      .limit(30),
    supabase
      .from('ai_generated_content')
      .select('*', { count: 'exact', head: true })
      .eq('generated_by_user_id', viewer.currentUser.userId)
      .eq('status', 'PENDING_REVIEW'),
  ]);
  const tutorNotificationFeedCounts = buildFeedCountMapFromNotificationData(notifications ?? [], 'workflow_alerts');
  const tutorFeedLanes = getFeedRulesForRole('tutor').map((rule) => ({
    ...rule,
    count: rule.feedKey === 'ai_review_queue' ? pendingReviewCount ?? 0 : tutorNotificationFeedCounts.get(rule.feedKey) ?? 0,
  }));

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1400px] space-y-6 pb-20 sm:space-y-8">
      
      {/* Header Section */}
      <section className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[6px_6px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-5 sm:p-8 md:p-12 border-b-[3px] sm:border-b-[4px] border-dark bg-yellow/20">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-3 min-w-0 w-full">
              <span className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border-[2px] sm:border-[3px] border-dark bg-white text-[9px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] font-black shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] break-words max-w-full">
                TUTOR COMMAND CENTER
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark break-words">
                Welcome back, {dashboard.tutorName}
              </h1>
              <p className="text-sm md:text-base font-semibold normal-case text-dark/70 max-w-3xl break-words">
                You have <span className="font-black text-dark">{dashboard.todayLessons.length} live classes</span> scheduled for today and <span className="font-black text-dark">{dashboard.pendingGrading} assignments</span> to grade.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 sm:gap-4 w-full lg:w-auto mt-4 sm:mt-0">
              <Link href="/dash/tutor/schedule" className="w-full sm:flex-1 lg:flex-none">
                <button className="w-full h-12 sm:h-14 px-4 sm:px-8 bg-yellow border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 text-sm sm:text-base inline-flex items-center justify-center">
                  <CalendarClock className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Open Scheduler
                </button>
              </Link>
              <Link href="/dash/tutor/builder" className="w-full sm:flex-1 lg:flex-none">
                <button className="w-full h-12 sm:h-14 px-4 sm:px-8 bg-white border-[3px] border-dark text-dark hover:bg-slate-50 font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 text-sm sm:text-base inline-flex items-center justify-center">
                  <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  New Assignment
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-8 lg:p-12 min-w-0">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-12 min-w-0">
            
            {/* Live Today Section */}
            <section className="xl:col-span-8 space-y-4 sm:space-y-6 sm:space-y-8 min-w-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight">Today&apos;s Schedule</h2>
                <Link href="/dash/tutor/schedule" className="text-xs font-black text-blue-600 hover:underline border-[2px] sm:border-[3px] border-dark px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white shadow-[2px_2px_0px_#060E1C] sm:shadow-[3px_3px_0px_#060E1C] self-start sm:self-auto text-center">
                  View Full Week
                </Link>
              </div>
              
              <div className="space-y-4">
                {dashboard.todayLessons.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {dashboard.todayLessons.map((item) => (
                      <div key={item.id} className="border-[3px] border-dark rounded-[20px] sm:rounded-2xl bg-off-white p-4 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0">
                        <div className="flex flex-col justify-between gap-4 sm:gap-5 lg:flex-row min-w-0">
                           <div className="space-y-3 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                 <span className="px-3 py-1 bg-dark text-white border-[2px] border-dark text-[9px] font-black uppercase tracking-widest rounded-md">
                                   {item.subjectName}
                                 </span>
                                 {item.status === 'live' && (
                                   <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-500 border-[2px] border-dark text-white text-[9px] font-black uppercase tracking-widest rounded-md animate-pulse">
                                     Live
                                   </span>
                                 )}
                              </div>
                              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-dark tracking-tight break-words">
                                {item.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-dark/60">
                                 <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {item.studentCount} Students</span>
                                 <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {formatDuration(item.scheduledStartAt, item.scheduledEndAt)} Workshop</span>
                              </div>
                           </div>

                           <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
                              {item.status !== 'live' ? (
                                <TutorLessonStartButton lessonId={item.id} status={item.status} />
                              ) : (
                                <Link href={`/dash/tutor/live/classroom?lessonId=${item.id}`} className="w-full sm:w-auto">
                                  <button className="w-full sm:w-auto h-12 sm:h-14 px-4 sm:px-8 bg-emerald-400 border-[3px] border-dark hover:bg-emerald-500 text-dark rounded-xl font-black flex items-center justify-center gap-2 shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none text-sm sm:text-base">
                                    <Video className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> Enter Classroom
                                  </button>
                                </Link>
                              )}
                              
                              {item.status !== 'live' && item.joinUrl && (
                                <Link href={`/dash/tutor/live/classroom?lessonId=${item.id}`} className="w-full sm:w-auto">
                                  <button className="w-full sm:w-auto h-12 sm:h-14 px-4 sm:px-6 bg-white border-[3px] border-dark hover:bg-slate-50 text-dark rounded-xl font-black shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none text-sm sm:text-base flex items-center justify-center">
                                    Enter Classroom
                                  </button>
                                </Link>
                              )}
                              <DeleteLessonButton lessonId={item.id} />
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center border-[3px] border-dashed border-dark/20 rounded-3xl bg-slate-50">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-[3px] border-dark bg-white shadow-[4px_4px_0px_#060E1C]">
                      <BookOpen className="h-10 w-10 text-dark" />
                    </div>
                    <h3 className="text-xl font-black text-dark">No classes for today</h3>
                    <p className="mt-2 text-dark/60 text-sm font-semibold">Your schedule is currently clear. Enjoy the break!</p>
                  </div>
                )}
              </div>
            </section>

            {/* Sidebar Navigation & Tools */}
            <aside className="xl:col-span-4 space-y-6 sm:space-y-8 min-w-0">
              {/* Broadcast Quick Action */}
              <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-blue-50 p-4 sm:p-5 md:p-8 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0">
                <h3 className="text-xl font-black text-dark mb-2 flex items-center gap-2 break-words">
                  <Rocket className="h-5 w-5 text-dark" /> Quick Broadcast
                </h3>
                <p className="text-sm text-dark/70 font-semibold mb-6">Send an instant alert to your active students.</p>
                <TutorLiveContentPublisher />
              </div>

              {/* Grading Queue Mini */}
              <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-white p-4 sm:p-5 md:p-8 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0">
                <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
                   <h3 className="text-xl font-black text-dark flex items-center gap-2 break-words">
                     <ClipboardCheck className="h-5 w-5 shrink-0" /> Grading Queue
                   </h3>
                   <Link href="/dash/tutor/grading" className="text-xs font-black text-blue-600 hover:underline">View All</Link>
                </div>
                {dashboard.gradingQueue.length > 0 ? (
                  <div className="space-y-4">
                    {dashboard.gradingQueue.map((task) => (
                      <div key={task.id} className="p-4 rounded-xl bg-off-white border-[2px] border-dark shadow-[2px_2px_0px_#060E1C]">
                        <p className="text-sm font-black text-dark">{task.studentName}</p>
                        <p className="text-[10px] font-bold text-dark/60 mt-1 uppercase tracking-widest">{task.assignmentTitle}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center border-[2px] border-dashed border-dark/20 rounded-2xl">
                     <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                     <p className="text-sm font-black text-dark">Queue is empty</p>
                  </div>
                )}
              </div>

              {/* Navigation Grid */}
              <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-white p-4 sm:p-5 md:p-8 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0">
                 <h3 className="text-lg font-black text-dark mb-4 sm:mb-6 flex items-center gap-2 break-words">
                   <LayoutDashboard className="h-5 w-5 shrink-0" />
                   Quick Navigation
                 </h3>
                 <div className="grid grid-cols-1 gap-3">
                   {tutorSections.map((section) => (
                     <Link
                       key={section.title}
                       href={section.href}
                       className="group flex items-start justify-between gap-3 p-4 rounded-xl border-[2px] border-transparent hover:border-dark hover:bg-off-white hover:shadow-[3px_3px_0px_#060E1C] transition-all min-w-0"
                     >
                       <div className="flex min-w-0 items-center gap-4">
                          <div className={`h-12 w-12 flex items-center justify-center border-[2px] border-dark rounded-xl font-black ${section.color}`}>
                             <section.icon className="h-6 w-6" />
                          </div>
                          <div className="min-w-0">
                             <p className="text-sm font-black text-dark break-words">{section.title}</p>
                             <p className="text-[10px] font-bold text-dark/60 uppercase tracking-widest break-words">{section.description}</p>
                          </div>
                       </div>
                       <ArrowRight className="h-4 w-4 text-dark/40 transition-transform group-hover:translate-x-1 group-hover:text-dark" />
                     </Link>
                   ))}
                 </div>
              </div>

              {/* Support Box */}
              <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-3xl p-5 sm:p-10 bg-yellow shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] relative overflow-hidden min-w-0">
                 <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-dark mb-4 sm:mb-6" />
                 <h3 className="text-xl sm:text-2xl font-black mb-2 tracking-tight text-dark break-words">Tutor Elite</h3>
                 <p className="text-dark/80 text-sm font-semibold leading-relaxed">
                   Need assistance with your lessons or tools? Our team is available 24/7.
                 </p>
                 <Link href="/dash/tutor/messages" className="mt-8 w-full h-14 bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center">
                   Get Support
                 </Link>
              </div>

              <DashboardFeedWidget
                title="Tutor Workflow Lanes"
                subtitle="These lanes show where review feedback, family communication, and publishing workflow alerts should surface."
                lanes={tutorFeedLanes}
              />
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
