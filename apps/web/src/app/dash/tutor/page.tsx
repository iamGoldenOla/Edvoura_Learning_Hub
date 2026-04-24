import Link from 'next/link';
import {
  CalendarClock,
  ClipboardCheck,
  DollarSign,
  FileText,
  GraduationCap,
  MessageCircle,
  NotebookPen,
  Rocket,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
  Video,
  ArrowRight,
  Clock,
  CheckCircle2,
  LayoutDashboard,
  Plus,
  BarChart3,
  BookOpen,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, MetricCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TutorLiveContentPublisher from '@/components/dashboards/TutorLiveContentPublisher';
import TutorLessonStartButton from '@/components/dashboards/TutorLessonStartButton';
import { requireAppViewer, getTutorDashboardData } from '@/lib/app-context';

const tutorSections = [
  { href: '/dash/tutor/schedule', title: "Today's Classes", description: 'Schedule and manage live sessions.', icon: CalendarClock, color: 'text-blue-600 bg-blue-50' },
  { href: '/dash/tutor/roster', title: 'Students', description: 'Student list and performance.', icon: Users, color: 'text-purple-600 bg-purple-50' },
  { href: '/dash/tutor/lesson-notes', title: 'Lesson Notes', description: 'Prepare notes and plans.', icon: NotebookPen, color: 'text-amber-600 bg-amber-50' },
  { href: '/dash/tutor/builder', title: 'Assignments', description: 'Create and manage assignments.', icon: FileText, color: 'text-emerald-600 bg-emerald-50' },
  { href: '/dash/tutor/grading', title: 'Grading Queue', description: 'Grade submissions.', icon: ClipboardCheck, color: 'text-rose-600 bg-rose-50' },
  { href: '/dash/tutor/messages', title: 'Messages', description: 'Direct chat with parents.', icon: MessageCircle, color: 'text-pink-600 bg-pink-50' },
];

const formatTimeInZone = (iso: string, zone: string) =>
  new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: zone,
    hour12: true,
  }).format(new Date(iso));

const formatDuration = (startIso: string, endIso: string) => {
  const diffMs = new Date(endIso).getTime() - new Date(startIso).getTime();
  const mins = Math.round(diffMs / (1000 * 60));
  return `${mins}m`;
};

export default async function TutorDashboard() {
  await requireAppViewer();
  const dashboard = await getTutorDashboardData();
  const activeTimezone = dashboard.timezone || 'UTC';

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      {/* Solid Header Section */}
      <div className="bg-[#0F172A] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                 <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-md">
                   Tutor Dashboard
                 </span>
                 <span className="text-[#94A3B8] text-xs font-bold uppercase tracking-widest">Command Center</span>
              </div>
              <h1 className="text-5xl font-black tracking-tight leading-none">
                Welcome back, <span className="text-[#38BDF8]">{dashboard.tutorName}</span>
              </h1>
              <p className="mt-6 text-xl text-[#94A3B8] font-medium max-w-2xl leading-relaxed">
                You have <span className="text-white font-black">{dashboard.todayLessons.length} live classes</span> scheduled for today and <span className="text-white font-black">{dashboard.pendingGrading} assignments</span> to grade.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/dash/tutor/schedule">
                <Button className="h-14 px-8 bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#0F172A] font-black rounded-xl shadow-lg shadow-blue-500/20 transition-transform active:scale-95">
                  <CalendarClock className="mr-2 h-5 w-5" />
                  Open Scheduler
                </Button>
              </Link>
              <Link href="/dash/tutor/builder">
                <Button className="h-14 px-8 bg-white text-[#0F172A] hover:bg-slate-100 font-black rounded-xl transition-transform active:scale-95">
                  <Plus className="mr-2 h-5 w-5" />
                  New Assignment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 -mt-10 space-y-10">
        {/* Solid Stats Cards */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Video className="h-5 w-5" /></div>
                <span className="text-[10px] font-black uppercase text-slate-400">Lessons</span>
             </div>
             <p className="text-3xl font-black text-slate-900">{dashboard.todayLessons.length}</p>
             <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Scheduled Today</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Users className="h-5 w-5" /></div>
                <span className="text-[10px] font-black uppercase text-slate-400">Roster</span>
             </div>
             <p className="text-3xl font-black text-slate-900">{dashboard.totalStudents}</p>
             <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Active Students</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><ClipboardCheck className="h-5 w-5" /></div>
                <span className="text-[10px] font-black uppercase text-slate-400">Grading</span>
             </div>
             <p className="text-3xl font-black text-slate-900">{dashboard.pendingGrading}</p>
             <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">In Queue</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><BarChart3 className="h-5 w-5" /></div>
                <span className="text-[10px] font-black uppercase text-slate-400">Earnings</span>
             </div>
             <p className="text-3xl font-black text-slate-900">₦--</p>
             <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Total Payout</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-10 xl:grid-cols-12">
          {/* Main Dashboard Feed */}
          <div className="space-y-10 xl:col-span-8">
            
            {/* Today's Schedule Card */}
            <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#0F172A] rounded-xl text-white">
                       <CalendarClock className="h-6 w-6" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-slate-900 tracking-tight">Today&apos;s Schedule</h2>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Virtual Classrooms</p>
                    </div>
                 </div>
                 <Link href="/dash/tutor/schedule" className="text-sm font-black text-blue-600 hover:underline">
                    Manage All
                 </Link>
              </div>

              <div className="p-0">
                {dashboard.todayLessons.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {dashboard.todayLessons.map((item) => (
                      <div key={item.id} className="group px-10 py-10 transition-colors hover:bg-slate-50">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                           {/* Time Block */}
                           <div className="flex flex-col min-w-[120px]">
                              <span className="text-3xl font-black text-slate-900 tracking-tighter">
                                {formatTimeInZone(item.scheduledStartAt, activeTimezone).split(' ')[0]}
                              </span>
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {formatTimeInZone(item.scheduledStartAt, activeTimezone).split(' ')[1] || activeTimezone}
                              </span>
                           </div>

                           {/* Lesson Info */}
                           <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2">
                                 <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-md">
                                   {item.subjectName}
                                 </span>
                                 {item.status === 'live' && (
                                   <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest rounded-md animate-pulse">
                                     Live
                                   </span>
                                 )}
                              </div>
                              <h3 className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                                {item.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-500">
                                 <span className="flex items-center gap-2"><Users className="h-4 w-4 text-slate-300" /> {item.studentCount} Students</span>
                                 <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-300" /> {formatDuration(item.scheduledStartAt, item.scheduledEndAt)} Workshop</span>
                              </div>
                           </div>

                           {/* Actions */}
                           <div className="flex items-center gap-3">
                              {item.status !== 'live' ? (
                                <TutorLessonStartButton lessonId={item.id} status={item.status} />
                              ) : (
                                <a href={item.joinUrl || '#'} target="_blank" rel="noreferrer">
                                  <Button className="h-14 px-8 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                                    <Video className="w-5 h-5 fill-current" /> Join Classroom
                                  </Button>
                                </a>
                              )}
                              
                              {item.status !== 'live' && item.joinUrl && (
                                <a href={item.joinUrl} target="_blank" rel="noreferrer">
                                  <Button variant="outline" className="h-14 px-6 rounded-xl border-slate-200 bg-white font-black text-[#0F172A] hover:bg-slate-50">
                                    Preview Room
                                  </Button>
                                </a>
                              )}
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 text-slate-200">
                      <BookOpen className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">No classes for today</h3>
                    <p className="mt-2 text-slate-500 text-sm font-medium">Your schedule is currently clear. Enjoy the break!</p>
                  </div>
                )}
              </div>
            </section>

            {/* Broadcast & Grading */}
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
               <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-orange-500" /> Quick Broadcast
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mb-8">Send an instant alert to your active students.</p>
                  <TutorLiveContentPublisher />
               </div>

               <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                       <ClipboardCheck className="h-5 w-5 text-rose-500" /> Grading Queue
                     </h3>
                     <Link href="/dash/tutor/grading" className="text-xs font-black text-blue-600 hover:underline">View All</Link>
                  </div>
                  {dashboard.gradingQueue.length > 0 ? (
                    <div className="space-y-4">
                      {dashboard.gradingQueue.map((task) => (
                        <div key={task.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                          <p className="text-xs font-black text-slate-900">{task.studentName}</p>
                          <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{task.assignmentTitle}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                       <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                       <p className="text-sm font-black text-slate-900">Queue is empty</p>
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <aside className="xl:col-span-4 space-y-10">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
               <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2">
                 <LayoutDashboard className="h-5 w-5 text-slate-400" />
                 Navigation
               </h3>
               <div className="grid grid-cols-1 gap-3">
                 {tutorSections.map((section) => (
                   <Link
                     key={section.title}
                     href={section.href}
                     className="group flex items-center justify-between p-4 rounded-xl transition-colors hover:bg-slate-50"
                   >
                     <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 flex items-center justify-center rounded-xl font-black ${section.color}`}>
                           <section.icon className="h-6 w-6" />
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-900">{section.title}</p>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{section.description}</p>
                        </div>
                     </div>
                     <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-900" />
                   </Link>
                 ))}
               </div>
            </div>

            {/* Support Box */}
            <div className="bg-[#0F172A] rounded-3xl p-10 text-white relative overflow-hidden">
               <Trophy className="h-10 w-10 text-[#EAB308] mb-6" />
               <h3 className="text-2xl font-black mb-2 tracking-tight">Tutor Elite</h3>
               <p className="text-[#94A3B8] text-sm font-medium leading-relaxed">
                 Need assistance with your lessons or tools? Our team is available 24/7.
               </p>
               <Button className="mt-8 w-full h-14 bg-white text-[#0F172A] font-black rounded-xl hover:bg-slate-100 transition-transform active:scale-95">
                 Get Support
               </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
