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
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, MetricCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TutorLiveContentPublisher from '@/components/dashboards/TutorLiveContentPublisher';
import { requireAppViewer, getTutorDashboardData } from '@/lib/app-context';

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

const formatTimeInZone = (iso: string, zone: string) =>
  new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: zone,
    hour12: false,
  }).format(new Date(iso));

const formatDuration = (startIso: string, endIso: string) => {
  const diffMs = new Date(endIso).getTime() - new Date(startIso).getTime();
  const mins = Math.round(diffMs / (1000 * 60));
  return `${mins} mins`;
};

const formatRelativeTime = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default async function TutorDashboard() {
  await requireAppViewer();
  const dashboard = await getTutorDashboardData();
  const activeTimezone = dashboard.timezone || 'UTC';

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-edvoura-navy">
              Welcome back, {dashboard.tutorName}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Your teaching command center. All data is live from your classes.
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
                Lesson Notes &amp; Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/dash/tutor/schedule" className="block">
          <MetricCard
            title="Today's Lessons"
            value={String(dashboard.todayLessons.length)}
            description={dashboard.todayLessons.length > 0 ? 'Sessions scheduled today' : 'No sessions today'}
            icon={<CalendarClock className="h-4 w-4" />}
          />
        </Link>
        <Link href="/dash/tutor/roster" className="block">
          <MetricCard
            title="My Students"
            value={String(dashboard.totalStudents)}
            description="Across active classes"
            icon={<Users className="h-4 w-4" />}
          />
        </Link>
        <Link href="/dash/tutor/grading" className="block">
          <MetricCard
            title="Pending Grading"
            value={String(dashboard.pendingGrading)}
            description="Submissions awaiting grades"
            icon={<ClipboardCheck className="h-4 w-4" />}
          />
        </Link>
        <Link href="/dash/tutor/builder" className="block">
          <MetricCard
            title="Total Assignments"
            value={String(dashboard.totalAssignments)}
            description="Across all classes"
            icon={<FileText className="h-4 w-4" />}
          />
        </Link>
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
              {dashboard.todayLessons.length > 0 ? (
                dashboard.todayLessons.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          {formatTimeInZone(item.scheduledStartAt, activeTimezone)} ({activeTimezone})
                        </p>
                        <h3 className="mt-1 text-base font-semibold text-slate-900">{item.title}</h3>
                        <p className="text-sm text-slate-600">
                          {item.subjectName} • {item.studentCount} students • {formatDuration(item.scheduledStartAt, item.scheduledEndAt)}
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
                            {item.status === 'live' ? 'Join Lesson' : 'Start Lesson'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
                  No lessons scheduled for today. Use the scheduler to create one.
                </div>
              )}
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
              {dashboard.gradingQueue.length > 0 ? (
                dashboard.gradingQueue.map((task) => (
                  <div key={task.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{task.studentName}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{task.assignmentTitle}</p>
                    <p className="text-xs text-slate-600">
                      {task.status === 'late' ? '⚠ Late submission' : 'Submitted'} • {formatRelativeTime(task.submittedAt)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
                  No submissions to grade right now. Your students are up to date!
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-edvoura-navy" />
                My Classes
              </CardTitle>
              <Link href="/dash/tutor/roster" className="text-sm font-semibold text-edvoura-navy hover:underline">
                All students
              </Link>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {dashboard.classes.length > 0 ? (
                dashboard.classes.map((cls) => (
                  <div key={cls.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-edvoura-navy hover:bg-white transition-colors">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-slate-600" />
                      <p className="text-sm font-semibold text-slate-900">{cls.title}</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{cls.subjectName} • {cls.studentCount} students enrolled</p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
                  No classes yet. Create an assignment to auto-generate a class.
                </div>
              )}
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
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">All Dashboard Sections</h2>
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
