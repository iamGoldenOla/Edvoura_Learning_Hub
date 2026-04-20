import Link from 'next/link';
import {
  CalendarClock,
  ClipboardCheck,
  DollarSign,
  Eye,
  FileText,
  GraduationCap,
  MessageCircle,
  NotebookPen,
  ShieldAlert,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
  Video,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, MetricCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TutorLiveContentPublisher from '@/components/dashboards/TutorLiveContentPublisher';
import TutorTimezonePanel from '@/components/dashboards/TutorTimezonePanel';
import { apiClient } from '@/lib/api-client';
import { requireAppViewer } from '@/lib/app-context';

const todayClasses = [
  {
    id: 'class-a',
    startAtIso: '2026-04-14T09:00:00.000Z',
    title: 'JSS3 Mathematics - Group A',
    learners: 12,
    duration: '60 mins',
    joinLabel: 'Start Lesson',
  },
  {
    id: 'class-b',
    startAtIso: '2026-04-14T13:00:00.000Z',
    title: 'Grade 4 Basic Science',
    learners: 16,
    duration: '45 mins',
    joinLabel: 'Join Lesson',
  },
];

const gradingQueue = [
  { id: 'gq-1', student: 'Aisha B.', task: 'Fractions Worksheet', due: 'Due today' },
  { id: 'gq-2', student: 'Daniel O.', task: 'Forces Mini Quiz', due: 'Due tomorrow' },
  { id: 'gq-3', student: 'Ife K.', task: 'Reading Comprehension', due: 'Late by 1 day' },
];

const weakEngagement = [
  { id: 'we-1', learner: 'Moses T.', signal: '2 missed sessions' },
  { id: 'we-2', learner: 'Ruth A.', signal: 'No quiz attempt this week' },
  { id: 'we-3', learner: 'Amina S.', signal: 'Streak dropped from 6 to 1' },
];

const tutorSections = [
  { href: '/dash/tutor/schedule', title: "Today's Classes", description: 'Schedule, start or join lesson, attendance.', icon: CalendarClock },
  { href: '/dash/tutor/roster', title: 'Students', description: 'Student list, performance tracking, weak engagement.', icon: Users },
  { href: '/dash/tutor/lesson-notes', title: 'Lesson Notes and Plans', description: 'Prepare lesson notes and weekly teaching plans.', icon: NotebookPen },
  { href: '/dash/tutor/builder', title: 'Assignments', description: 'Create assignments and upload lesson resources.', icon: FileText },
  { href: '/dash/tutor/grading', title: 'Grading Queue', description: 'Grade submissions and send feedback.', icon: ClipboardCheck },
  { href: '/dash/tutor/builder', title: 'Quizzes and Challenges', description: 'Build quizzes, tests, and challenge tasks.', icon: Target },
  { href: '/dash/tutor/roster', title: 'Engagement Insights', description: 'Streaks, leaderboard, and participation trends.', icon: TrendingUp },
  { href: '/dash/tutor/messages', title: 'Messages', description: 'Message parent and student by class.', icon: MessageCircle },
  { href: '/dash/tutor/builder', title: 'Resources', description: 'Upload notes, slides, worksheets, and links.', icon: GraduationCap },
  { href: '/dash/profile', title: 'Availability', description: 'Manage availability slots and profile details.', icon: UserCheck },
  { href: '/dash/tutor/earnings', title: 'Invoice and Payment', description: 'Payout status, invoice history, and summary.', icon: DollarSign },
  { href: '/dash/profile', title: 'Profile', description: 'Tutor profile, teaching subjects, and bio.', icon: ShieldCheck },
];

const veteranStandards = [
  'Every lesson has a measurable objective and success criteria.',
  'Plan includes differentiation for support, core, and extension groups.',
  'Two formative checks are embedded before lesson close.',
  'Homework aligns to objective and includes expected time-on-task.',
  'Reflection captures what to reteach and who needs intervention.',
];

const weeklyTeachingPriorities = [
  { id: 'w-1', title: 'Re-teach fractions for Group A', owner: 'Math', deadline: 'Wed' },
  { id: 'w-2', title: 'Boost reading fluency for 6 flagged learners', owner: 'ELA', deadline: 'Thu' },
  { id: 'w-3', title: 'Run spelling bee trial round', owner: 'Challenge', deadline: 'Fri' },
];

type TutorContext = {
  timezone: string;
};

const formatTimeInZone = (iso: string, zone: string) =>
  new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: zone,
    hour12: false,
  }).format(new Date(iso));

export default async function TutorDashboard() {
  const viewer = await requireAppViewer();
  const tutorContext = await apiClient
    .get<TutorContext>('/tutors/me', { token: viewer.accessToken, cache: 'no-store' })
    .catch(() => ({ timezone: 'UTC' }));

  const activeTimezone = tutorContext.timezone || 'UTC';

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-edvoura-navy">Tutor Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">
              Built for teaching efficiency and learner management.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/dash/tutor/schedule">
              <Button variant="outline" className="border-slate-300 bg-white">
                <CalendarClock className="mr-2 h-4 w-4" />
                Lesson Scheduling
              </Button>
            </Link>
            <Link href="/dash/tutor/builder">
              <Button variant="primary">
                <FileText className="mr-2 h-4 w-4" />
                Assignment Creation
              </Button>
            </Link>
            <Link href="/dash/tutor/lesson-notes">
              <Button variant="outline" className="border-slate-300 bg-white">
                <NotebookPen className="mr-2 h-4 w-4" />
                Lesson Notes & Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Today's Teaching Schedule" value="2" description="Sessions ready to launch" icon={<CalendarClock className="h-4 w-4" />} />
        <MetricCard title="Student List" value="48" description="Across active classes" icon={<Users className="h-4 w-4" />} />
        <MetricCard title="Grading and Feedback" value="12" description="Submissions in queue" icon={<ClipboardCheck className="h-4 w-4" />} />
        <MetricCard title="Invoice and Payment" value="NGN 125,000" description="Current cycle estimate" icon={<DollarSign className="h-4 w-4" />} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-edvoura-navy" />
                Today&apos;s Classes
              </CardTitle>
              <Link href="/dash/tutor/schedule" className="text-sm font-semibold text-edvoura-navy hover:underline">
                View schedule
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayClasses.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {formatTimeInZone(item.startAtIso, activeTimezone)} ({activeTimezone})
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900">{item.title}</h3>
                      <p className="text-sm text-slate-600">
                        {item.learners} students | {item.duration}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/dash/tutor/roster">
                        <Button variant="outline" className="border-slate-300 bg-white text-xs">
                          Student List
                        </Button>
                      </Link>
                      <Link href="/dash/tutor/schedule">
                        <Button variant="primary" className="text-xs">
                          {item.joinLabel}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-edvoura-navy" />
                Grading Queue
              </CardTitle>
              <Link href="/dash/tutor/grading" className="text-sm font-semibold text-edvoura-navy hover:underline">
                Open grading
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {gradingQueue.map((task) => (
                <div key={task.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{task.student}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{task.task}</p>
                  <p className="text-xs text-slate-600">{task.due}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-edvoura-navy" />
                Quizzes and Challenges
              </CardTitle>
              <Link href="/dash/tutor/builder" className="text-sm font-semibold text-edvoura-navy hover:underline">
                Open builder
              </Link>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <QuickTool
                href="/dash/tutor/builder"
                title="Quiz/Test Creation"
                description="Create timed quiz and class test."
                icon={Target}
              />
              <QuickTool
                href="/dash/tutor/builder"
                title="Spelling Bee Setup"
                description="Set participants and monitor rounds."
                icon={Star}
              />
              <QuickTool
                href="/dash/tutor/roster"
                title="Class Leaderboard"
                description="View class ranking and streak performance."
                icon={Trophy}
              />
              <QuickTool
                href="/dash/tutor/roster"
                title="Gamification Control"
                description="Trigger badges and rewards per learner."
                icon={Sparkles}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Teaching Content Broadcast</CardTitle>
            </CardHeader>
            <CardContent>
              <TutorLiveContentPublisher />
            </CardContent>
          </Card>

          <TutorTimezonePanel classes={todayClasses} defaultTimezone={activeTimezone} />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-edvoura-navy" />
                Weekly Instruction Priorities
              </CardTitle>
              <Link href="/dash/tutor/lesson-notes" className="text-sm font-semibold text-edvoura-navy hover:underline">
                Open lesson planner
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {weeklyTeachingPriorities.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-600">
                    Track: {item.owner} | Deadline: {item.deadline}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">
                Send parent and student updates by class/session.
              </p>
              <Link href="/dash/tutor/messages">
                <Button variant="outline" className="w-full border-slate-300 bg-white">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message Parent/Student
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {weakEngagement.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-900">{item.learner}</p>
                  <p className="text-xs text-slate-600">{item.signal}</p>
                </div>
              ))}
              <Link href="/dash/tutor/roster">
                <Button variant="outline" className="w-full border-slate-300 bg-white">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Student Performance Tracking
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tutor Controls</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              <Link href="/dash/tutor/builder">
                <Button variant="outline" className="w-full justify-start border-slate-300 bg-white text-left">
                  Upload Lesson Resources
                </Button>
              </Link>
              <Link href="/dash/tutor/schedule">
                <Button variant="outline" className="w-full justify-start border-slate-300 bg-white text-left">
                  Attendance Marking
                </Button>
              </Link>
              <Link href="/dash/tutor/lesson-notes">
                <Button variant="outline" className="w-full justify-start border-slate-300 bg-white text-left">
                  Lesson Notes and Plans
                </Button>
              </Link>
              <Link href="/dash/profile">
                <Button variant="outline" className="w-full justify-start border-slate-300 bg-white text-left">
                  Availability/Profile Management
                </Button>
              </Link>
              <Link href="/dash/tutor/earnings">
                <Button variant="outline" className="w-full justify-start border-slate-300 bg-white text-left">
                  Invoice/Payment
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-slate-600" />
                Veteran Teaching Non-Negotiables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {veteranStandards.map((rule) => (
                <div key={rule} className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
                  {rule}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Best Dashboard Sections</h2>
        <p className="mt-2 text-sm text-slate-600">
          All required sections below are mapped and clickable.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tutorSections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-edvoura-navy hover:bg-white"
            >
              <div className="flex items-center gap-2">
                <section.icon className="h-4 w-4 text-slate-600" />
                <p className="text-sm font-semibold text-slate-900">{section.title}</p>
              </div>
              <p className="mt-1 text-xs text-slate-600">{section.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function QuickTool({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link href={href} className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-edvoura-navy hover:bg-white">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-600" />
        <p className="text-sm font-semibold text-slate-900">{title}</p>
      </div>
      <p className="mt-1 text-xs text-slate-600">{description}</p>
    </Link>
  );
}
