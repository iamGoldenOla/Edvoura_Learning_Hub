import Link from 'next/link';
import { AlertTriangle, BarChart3, CheckCircle2, Trophy, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const learners = [
  { id: 'st-1', name: 'Aisha Bello', className: 'JSS3 Mathematics', attendance: '92%', avg: '81%', status: 'Active' },
  { id: 'st-2', name: 'Daniel Okon', className: 'JSS3 Mathematics', attendance: '64%', avg: '58%', status: 'Needs support' },
  { id: 'st-3', name: 'Mariam Yusuf', className: 'Grade 4 Basic Science', attendance: '88%', avg: '76%', status: 'Active' },
  { id: 'st-4', name: 'Ruth Ade', className: 'Grade 4 Basic Science', attendance: '70%', avg: '61%', status: 'Watch list' },
];

const weakEngagement = [
  'Daniel Okon - missed 2 recent sessions',
  'Ruth Ade - no assignment in 5 days',
  'Kehinde T. - streak dropped from 7 to 1',
];

const leaderboard = [
  { rank: 1, name: 'Aisha Bello', points: 420 },
  { rank: 2, name: 'Mariam Yusuf', points: 390 },
  { rank: 3, name: 'Tobi O.', points: 365 },
];

export default async function TutorRosterPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const action = typeof searchParams.action === 'string' ? searchParams.action : null;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-edvoura-navy">Students</h1>
        <p className="mt-2 text-sm text-slate-600">
          Student list, attendance marking, performance tracking, and engagement monitoring.
        </p>
      </section>

      {action ? (
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Action Center: <strong>{action}</strong> mode is active.
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <Stat title="Active Students" value="48" icon={Users} />
        <Stat title="Attendance Marked Today" value="34" icon={CheckCircle2} />
        <Stat title="Weak Engagement Flags" value="3" icon={AlertTriangle} />
        <Stat title="Leaderboard Updated" value="Today" icon={Trophy} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Student List</CardTitle>
              <Link href="/dash/tutor/roster?action=attendance">
                <Button variant="outline" className="border-slate-300 bg-white text-xs">
                  Mark Attendance
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {learners.map((learner) => (
                <div key={learner.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-5 md:items-center">
                    <p className="text-sm font-semibold text-slate-900">{learner.name}</p>
                    <p className="text-xs text-slate-600">{learner.className}</p>
                    <p className="text-xs text-slate-600">Attendance: {learner.attendance}</p>
                    <p className="text-xs text-slate-600">Avg: {learner.avg}</p>
                    <p className="text-xs font-semibold text-slate-700">{learner.status}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Weak Engagement Students
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {weakEngagement.map((item) => (
                <div key={item} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-600" />
                Class Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {leaderboard.map((item) => (
                <div key={item.rank} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="text-sm font-semibold text-slate-900">
                    #{item.rank} {item.name}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">{item.points} pts</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function Stat({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
        </div>
        <Icon className="h-5 w-5 text-slate-500" />
      </CardContent>
    </Card>
  );
}
