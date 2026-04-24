import Link from 'next/link';
import { AlertTriangle, BarChart3, CheckCircle2, Trophy, Users, Video } from 'lucide-react';

import { Button } from '@/components/ui/button';
import StudentLinkEditor from '@/components/dashboards/StudentLinkEditor';
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
  personal_meet_url?: string | null;
  personal_meet_host_url?: string | null;
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
  personalMeetUrl: string | null;
  personalMeetHostUrl: string | null;
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
      <div className="mx-auto max-w-[1400px] space-y-8 p-6 sm:p-8 pb-20">
        <section className="rounded-2xl border-[4px] border-dark bg-rose-50 p-6 text-sm text-dark font-black shadow-[10px_10px_0px_#060E1C]">
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
      ? supabase.from('student_profiles').select('user_id, school_name, grade_level_id, personal_meet_url, personal_meet_host_url').in('user_id', studentIds)
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
      personalMeetUrl: studentProfile?.personal_meet_url ?? null,
      personalMeetHostUrl: studentProfile?.personal_meet_host_url ?? null,
    };
  });

  const leaderboard = learners.slice(0, 3).map((learner, index) => ({
    rank: index + 1,
    name: learner.name,
  }));
  const classesCovered = new Set(learners.map((learner) => learner.className)).size;

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-6 sm:p-8 pb-20">
      <section className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        
        {/* Header */}
        <div className="p-8 md:p-12 border-b-[4px] border-dark bg-yellow/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3 min-w-0">
              <span className="inline-flex items-center gap-2 px-4 py-2 border-[3px] border-dark bg-white text-[10px] tracking-[0.2em] font-black shadow-[4px_4px_0px_#060E1C]">
                CLASS ROSTER
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
                Students
              </h1>
              <p className="text-sm md:text-base font-semibold normal-case text-dark/70 max-w-xl">
                Live roster of students currently enrolled into your grade-specific classes.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-8">
          
          {action ? (
            <section className="rounded-xl border-[3px] border-dark bg-blue-100 p-4 text-sm text-dark font-black shadow-[5px_5px_0px_#060E1C]">
              Action Center: <strong>{action}</strong> mode is active.
            </section>
          ) : null}

          <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
            <Stat title="Active Students" value={String(learners.length)} icon={Users} bgColor="bg-emerald-200" />
            <Stat title="Attendance Marked" value="Phase next" icon={CheckCircle2} bgColor="bg-blue-200" />
            <Stat title="Weak Engagement" value={learners.length === 0 ? '0' : 'Review'} icon={AlertTriangle} bgColor="bg-rose-200" />
            <Stat title="Classes Covered" value={String(classesCovered)} icon={Trophy} bgColor="bg-amber-200" />
          </section>

          <section className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            
            {/* Student List Area */}
            <div className="xl:col-span-8">
              <div className="border-[3px] border-dark rounded-3xl bg-white shadow-[8px_8px_0px_#060E1C] overflow-hidden">
                <div className="p-6 border-b-[3px] border-dark bg-off-white flex flex-row items-center justify-between">
                  <h2 className="text-2xl font-black text-dark tracking-tight">Student List</h2>
                  <Link href="/dash/tutor/builder">
                    <Button className="bg-yellow border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 text-xs">
                      Create Assignment
                    </Button>
                  </Link>
                </div>
                <div className="p-6 space-y-4">
                  {learners.length > 0 ? (
                    learners.map((learner) => (
                      <div key={learner.id} className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-5 md:items-center">
                          <p className="text-sm font-black text-dark">{learner.name}</p>
                          <p className="text-xs font-bold text-dark/70">{learner.className}</p>
                          <p className="text-xs font-bold text-dark/70">{learner.gradeLabel}</p>
                          <p className="text-xs font-bold text-dark/70">{learner.schoolName ?? 'School pending'}</p>
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg border-[2px] border-emerald-300 self-start md:self-auto text-center">{learner.status}</p>
                          <div className="flex flex-col gap-2 md:col-span-5 pt-3 mt-3 border-t-[2px] border-dark/10">
                            {learner.personalMeetHostUrl ? (
                              <a href={learner.personalMeetHostUrl} target="_blank" rel="noreferrer" className="text-xs font-black text-blue-600 hover:underline inline-flex items-center gap-1">
                                <Video className="w-4 h-4" /> Join Eternal Meet
                              </a>
                            ) : null}
                            <StudentLinkEditor 
                              studentId={learner.id} 
                              currentUrl={learner.personalMeetUrl} 
                              currentHostUrl={learner.personalMeetHostUrl} 
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-8 text-center text-sm font-semibold text-dark/60">
                      No students are enrolled into your classes yet. As soon as a student logs in with a matching grade profile, they will be auto-enrolled and appear here.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-8 xl:col-span-4">
              
              <div className="border-[3px] border-dark rounded-3xl bg-amber-100 p-6 shadow-[5px_5px_0px_#060E1C]">
                <h3 className="text-xl font-black text-dark flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-dark" />
                  Enrollment Notes
                </h3>
                <div className="space-y-3 text-sm font-semibold text-dark/80">
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">
                    This roster now reflects real Supabase enrollments, not a hardcoded list.
                  </div>
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">
                    Tutor-created assignments auto-create classes when needed and enroll students with the matching grade profile.
                  </div>
                </div>
              </div>

              <div className="border-[3px] border-dark rounded-3xl bg-white p-6 shadow-[5px_5px_0px_#060E1C]">
                <h3 className="text-xl font-black text-dark flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-dark" />
                  Top Visible Learners
                </h3>
                <div className="space-y-3">
                  {leaderboard.length > 0 ? (
                    leaderboard.map((item) => (
                      <div key={item.rank} className="flex items-center justify-between rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">
                        <span className="text-sm font-black text-dark">
                          #{item.rank} {item.name}
                        </span>
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md border-[2px] border-emerald-300">Visible</span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-6 text-center text-sm font-semibold text-dark/60">
                      Learners will appear here after their first successful enrollment.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function Stat({
  title,
  value,
  icon: Icon,
  bgColor = "bg-white"
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor?: string;
}) {
  return (
    <div className={`border-[3px] border-dark rounded-2xl ${bgColor} p-6 shadow-[5px_5px_0px_#060E1C]`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-dark/70">{title}</p>
          <p className="mt-2 text-3xl font-black text-dark">{value}</p>
        </div>
        <div className="h-12 w-12 rounded-xl border-[3px] border-dark bg-white flex items-center justify-center shadow-[2px_2px_0px_#060E1C]">
          <Icon className="h-6 w-6 text-dark" />
        </div>
      </div>
    </div>
  );
}
