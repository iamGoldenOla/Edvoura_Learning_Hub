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
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, MetricCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TutorLiveContentPublisher from '@/components/dashboards/TutorLiveContentPublisher';
import TutorLessonStartButton from '@/components/dashboards/TutorLessonStartButton';
import { requireAppViewer, getTutorDashboardData } from '@/lib/app-context';

const tutorSections = [
  { href: '/dash/tutor/schedule', title: "Today's Classes", description: 'Schedule, start or join lesson, attendance.', icon: CalendarClock, color: 'bg-blue-50 text-blue-600' },
  { href: '/dash/tutor/roster', title: 'Students', description: 'Student list, performance tracking.', icon: Users, color: 'bg-purple-50 text-purple-600' },
  { href: '/dash/tutor/lesson-notes', title: 'Lesson Notes', description: 'Prepare lesson notes and plans.', icon: NotebookPen, color: 'bg-amber-50 text-amber-600' },
  { href: '/dash/tutor/builder', title: 'Assignments', description: 'Create and manage assignments.', icon: FileText, color: 'bg-emerald-50 text-emerald-600' },
  { href: '/dash/tutor/grading', title: 'Grading Queue', description: 'Grade submissions and feedback.', icon: ClipboardCheck, color: 'bg-rose-50 text-rose-600' },
  { href: '/dash/tutor/builder', title: 'Quizzes', description: 'Build quizzes and tests.', icon: Target, color: 'bg-indigo-50 text-indigo-600' },
  { href: '/dash/tutor/messages', title: 'Messages', description: 'Direct chat with parents/students.', icon: MessageCircle, color: 'bg-pink-50 text-pink-600' },
  { href: '/dash/tutor/earnings', title: 'Earnings', description: 'Payout status and history.', icon: DollarSign, color: 'bg-green-50 text-green-600' },
  { href: '/dash/profile', title: 'Profile', description: 'Manage bio and subjects.', icon: ShieldCheck, color: 'bg-slate-50 text-slate-600' },
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
    <div className="mx-auto max-w-[1600px] space-y-8 p-6 sm:p-10 animate-in fade-in duration-700">
      {/* Premium Header */}
      <section className="relative overflow-hidden rounded-3xl bg-edvoura-navy p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-60 w-60 rounded-full bg-edvoura-gold/10 blur-3xl"></div>
        
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
               <span className="bg-edvoura-gold/20 text-edvoura-gold text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-edvoura-gold/30">
                Tutor Command Center
               </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              Welcome, <span className="text-edvoura-gold">{dashboard.tutorName}</span>
            </h1>
            <p className="mt-4 text-lg text-slate-300 font-medium leading-relaxed">
              You have <span className="text-white font-bold">{dashboard.todayLessons.length} classes</span> scheduled for today. 
              Your grading queue has <span className="text-white font-bold">{dashboard.pendingGrading} submissions</span> waiting.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href="/dash/tutor/schedule">
              <Button className="h-14 px-8 bg-edvoura-gold hover:bg-yellow-500 text-edvoura-navy font-bold rounded-2xl shadow-lg shadow-edvoura-gold/20 transition-all hover:scale-105">
                <CalendarClock className="mr-2 h-5 w-5" />
                Open Scheduler
              </Button>
            </Link>
            <Link href="/dash/tutor/builder">
              <Button className="h-14 px-8 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-md border border-white/20 transition-all hover:scale-105">
                <Plus className="mr-2 h-5 w-5" />
                Create Assignment
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Stats Grid */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Daily Classes"
          value={String(dashboard.todayLessons.length)}
          description="Live sessions today"
          icon={<Video className="h-5 w-5 text-blue-500" />}
          className="rounded-3xl border-none bg-white shadow-xl shadow-slate-200/50"
        />
        <MetricCard
          title="Active Students"
          value={String(dashboard.totalStudents)}
          description="Total enrolled"
          icon={<Users className="h-5 w-5 text-purple-500" />}
          className="rounded-3xl border-none bg-white shadow-xl shadow-slate-200/50"
        />
        <MetricCard
          title="Pending Grading"
          value={String(dashboard.pendingGrading)}
          description="Need your attention"
          icon={<ClipboardCheck className="h-5 w-5 text-rose-500" />}
          className="rounded-3xl border-none bg-white shadow-xl shadow-slate-200/50"
        />
        <MetricCard
          title="Total Earnings"
          value="₦--"
          description="Updated this week"
          icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
          className="rounded-3xl border-none bg-white shadow-xl shadow-slate-200/50"
        />
      </section>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        {/* Main Content Area */}
        <div className="space-y-8 xl:col-span-8">
          
          {/* Today's Classes Card */}
          <Card className="rounded-3xl border-none bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                   <Video className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Today&apos;s Live Classes</CardTitle>
              </div>
              <Link href="/dash/tutor/schedule" className="group flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700">
                Go to Schedule <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </CardHeader>
            <CardContent className="p-8">
              {dashboard.todayLessons.length > 0 ? (
                <div className="space-y-4">
                  {dashboard.todayLessons.map((item) => (
                    <div key={item.id} className="group relative rounded-2xl border border-slate-100 bg-slate-50/50 p-6 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-200/50">
                      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex gap-4">
                           <div className="hidden sm:flex flex-col items-center justify-center h-16 w-16 rounded-2xl bg-white border border-slate-100 text-slate-400 font-bold">
                              <span className="text-xs uppercase tracking-tighter">Starts</span>
                              <span className="text-slate-900">{formatTimeInZone(item.scheduledStartAt, activeTimezone).split(' ')[0]}</span>
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">
                                  {item.subjectName}
                                </span>
                                {item.status === 'live' && (
                                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white bg-rose-500 px-2 py-0.5 rounded-md animate-pulse">
                                    <div className="h-1 w-1 rounded-full bg-white"></div> Live
                                  </span>
                                )}
                              </div>
                              <h3 className="mt-2 text-xl font-black text-slate-900">{item.title}</h3>
                              <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {item.studentCount} students</span>
                                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatDuration(item.scheduledStartAt, item.scheduledEndAt)}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <TutorLessonStartButton lessonId={item.id} status={item.status} />
                           <Link href="/dash/tutor/roster">
                             <Button variant="outline" className="h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50">
                               Manage
                             </Button>
                           </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50 p-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <CalendarClock className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No classes for today</h3>
                  <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">
                    Take a break or use the time to prepare your next lesson notes and plans.
                  </p>
                  <Link href="/dash/tutor/schedule" className="mt-6 inline-block">
                     <Button className="bg-edvoura-navy text-white rounded-xl">Schedule Session</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Broadcast & Grading Row */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
             <Card className="rounded-3xl border-none bg-white shadow-xl shadow-slate-200/50">
                <CardHeader className="px-8 pt-8">
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-orange-500" />
                    Quick Broadcast
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <p className="text-sm text-slate-500 mb-6">Send a message to all your students instantly.</p>
                  <TutorLiveContentPublisher />
                </CardContent>
             </Card>

             <Card className="rounded-3xl border-none bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between px-8 pt-8 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-rose-500" />
                    Grading Queue
                  </CardTitle>
                  <Link href="/dash/tutor/grading" className="text-xs font-bold text-rose-600">View all</Link>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-4">
                  {dashboard.gradingQueue.length > 0 ? (
                    dashboard.gradingQueue.map((task) => (
                      <div key={task.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{task.studentName}</p>
                        <p className="text-xs text-slate-500 mt-1">{task.assignmentTitle}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                       <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-2" />
                       <p className="text-sm font-bold text-slate-900">All caught up!</p>
                       <p className="text-xs text-slate-500">No pending submissions.</p>
                    </div>
                  )}
                </CardContent>
             </Card>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-8 xl:col-span-4">
          <Card className="rounded-3xl border-none bg-white shadow-xl shadow-slate-200/50 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-slate-400" />
              Command Links
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {tutorSections.map((section) => (
                <Link
                  key={section.title}
                  href={section.href}
                  className="group flex items-center gap-4 p-4 rounded-2xl transition-all hover:bg-slate-50 hover:translate-x-1"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all group-hover:scale-110 ${section.color}`}>
                    <section.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">{section.title}</p>
                    <p className="text-xs text-slate-500 truncate">{section.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:text-slate-900 group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </Card>

          {/* Help/Support Section */}
          <Card className="rounded-3xl border-none bg-gradient-to-br from-edvoura-navy to-slate-900 p-8 text-white">
             <Trophy className="h-10 w-10 text-edvoura-gold mb-6" />
             <h3 className="text-xl font-black mb-2">Tutor Excellence</h3>
             <p className="text-sm text-slate-400 leading-relaxed">
               Need help with lesson planning or using the assignment builder? Our support team is here for you.
             </p>
             <Button variant="outline" className="mt-6 w-full h-12 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 font-bold">
               Visit Help Center
             </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
