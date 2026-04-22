import Link from 'next/link';
import { AlertTriangle, BarChart3, CheckCircle2, Trophy, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/server';

type EnrollmentRow = {
  id: string;
  student_user_id: string;
  class_id: string;
  status: string;
};

type ClassRow = {
  id: string;
  title: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
};

type StudentProfileRow = {
  user_id: string;
  school_name: string | null;
  grade_level_id: string;
};

type GradeLevelRow = {
  id: string;
  display_name: string;
};

type LearnerCard = {
  id: string;
  name: string;
  className: string;
  gradeLabel: string;
  schoolName: string | null;
  status: string;
};

export default async function TutorRosterPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const action = typeof searchParams.action === 'string' ? searchParams.action : null;

  const supabase = await createClient();
  await supabase.rpc('sync_current_user_membership');

  const { data: enrollmentRows, error: enrollmentsError } = await supabase
    .from('class_enrollments')
    .select('id, student_user_id, class_id, status')
    .eq('status', 'active');

  if (enrollmentsError) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6 sm:p-8">
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900">
          Unable to load live tutor roster: {enrollmentsError.message}
        </section>
      </div>
    );
  }

  const classIds = [...new Set(((enrollmentRows ?? []) as EnrollmentRow[]).map((row) => row.class_id))];
  const studentIds = [...new Set(((enrollmentRows ?? []) as EnrollmentRow[]).map((row) => row.student_user_id))];

  const [{ data: classRows }, { data: profileRows }, { data: studentProfileRows }] = await Promise.all([
    classIds.length ? supabase.from('classes').select('id, title').in('id', classIds) : Promise.resolve({ data: [] as ClassRow[] }),
    studentIds.length ? supabase.from('profiles').select('id, full_name, email').in('id', studentIds) : Promise.resolve({ data: [] as ProfileRow[] }),
    studentIds.length
      ? supabase.from('student_profiles').select('user_id, school_name, grade_level_id').in('user_id', studentIds)
      : Promise.resolve({ data: [] as StudentProfileRow[] }),
  ]);

  const gradeLevelIds = [...new Set(((studentProfileRows ?? []) as StudentProfileRow[]).map((row) => row.grade_level_id))];
  const { data: gradeLevelRows } = gradeLevelIds.length
    ? await supabase.from('grade_levels').select('id, display_name').in('id', gradeLevelIds)
    : { data: [] as GradeLevelRow[] };

  const classById = new Map(((classRows ?? []) as ClassRow[]).map((row) => [row.id, row]));
  const profileById = new Map(((profileRows ?? []) as ProfileRow[]).map((row) => [row.id, row]));
  const studentProfileById = new Map(((studentProfileRows ?? []) as StudentProfileRow[]).map((row) => [row.user_id, row]));
  const gradeLevelById = new Map(((gradeLevelRows ?? []) as GradeLevelRow[]).map((row) => [row.id, row.display_name]));

  const learners: LearnerCard[] = ((enrollmentRows ?? []) as EnrollmentRow[]).map((row) => {
    const studentProfile = studentProfileById.get(row.student_user_id);
    const profile = profileById.get(row.student_user_id);
    const relatedClass = classById.get(row.class_id);

    return {
      id: row.id,
      name: profile?.full_name ?? profile?.email ?? 'Unnamed learner',
      className: relatedClass?.title ?? 'Untitled class',
      gradeLabel: studentProfile?.grade_level_id ? gradeLevelById.get(studentProfile.grade_level_id) ?? 'Grade pending' : 'Grade pending',
      schoolName: studentProfile?.school_name ?? null,
      status: row.status,
    };
  });

  const leaderboard = learners.slice(0, 3).map((learner, index) => ({
    rank: index + 1,
    name: learner.name,
  }));
  const classesCovered = new Set(learners.map((learner) => learner.className)).size;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-edvoura-navy">Students</h1>
        <p className="mt-2 text-sm text-slate-600">
          Live roster of students currently enrolled into your grade-specific classes.
        </p>
      </section>

      {action ? (
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Action Center: <strong>{action}</strong> mode is active.
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <Stat title="Active Students" value={String(learners.length)} icon={Users} />
        <Stat title="Attendance Marked Today" value="Phase next" icon={CheckCircle2} />
        <Stat title="Weak Engagement Flags" value={learners.length === 0 ? '0' : 'Review'} icon={AlertTriangle} />
        <Stat title="Classes Covered" value={String(classesCovered)} icon={Trophy} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Student List</CardTitle>
              <Link href="/dash/tutor/builder">
                <Button variant="outline" className="border-slate-300 bg-white text-xs">
                  Create Assignment
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {learners.length > 0 ? (
                learners.map((learner) => (
                  <div key={learner.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-5 md:items-center">
                      <p className="text-sm font-semibold text-slate-900">{learner.name}</p>
                      <p className="text-xs text-slate-600">{learner.className}</p>
                      <p className="text-xs text-slate-600">{learner.gradeLabel}</p>
                      <p className="text-xs text-slate-600">{learner.schoolName ?? 'School pending'}</p>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">{learner.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                  No students are enrolled into your classes yet. As soon as a student logs in with a matching grade profile, they will be auto-enrolled and appear here.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Enrollment Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-700">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                This roster now reflects real Supabase enrollments, not a hardcoded list.
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                Tutor-created assignments auto-create classes when needed and enroll students with the matching grade profile.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-600" />
                Top Visible Learners
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {leaderboard.length > 0 ? (
                leaderboard.map((item) => (
                  <div key={item.rank} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <span className="text-sm font-semibold text-slate-900">
                      #{item.rank} {item.name}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">Visible</span>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
                  Learners will appear here after their first successful enrollment.
                </div>
              )}
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
