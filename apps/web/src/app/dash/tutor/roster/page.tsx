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

type ProgressRow = {
  average_score: number | null;
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
      <div className="mx-auto w-full min-w-0 max-w-[1400px] space-y-6 sm:space-y-8 pb-20">
        <section className="rounded-[20px] sm:rounded-2xl border-[3px] sm:border-[4px] border-dark bg-rose-50 p-5 sm:p-6 text-sm text-dark font-black shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] break-words">
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
  const [{ count: attendanceMarkedCount }, { data: progressRows }] = await Promise.all([
    studentIds.length
      ? supabase
          .from('lesson_attendance')
          .select('id', { count: 'exact', head: true })
          .in('student_user_id', studentIds)
      : Promise.resolve({ count: 0 }),
    studentIds.length
      ? supabase
          .from('progress_snapshots')
          .select('average_score')
          .in('student_user_id', studentIds)
      : Promise.resolve({ data: [] as ProgressRow[] }),
  ]);

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
  const weakEngagementCount = ((progressRows ?? []) as ProgressRow[]).filter(
    (row) => Number(row.average_score ?? 0) > 0 && Number(row.average_score ?? 0) < 50,
  ).length;

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1400px] space-y-6 sm:space-y-8 pb-20">
      <section className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        
        {/* Header */}
        <div className="p-5 sm:p-8 md:p-12 border-b-[3px] sm:border-b-[4px] border-dark bg-yellow/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8 min-w-0">
            <div className="space-y-3 min-w-0 w-full">
              <span className="inline-flex items-center justify-center text-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border-[2px] sm:border-[3px] border-dark bg-white text-[9px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] font-black shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] break-words max-w-full">
                CLASS ROSTER
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark break-words">
                Students
              </h1>
              <p className="text-sm md:text-base font-semibold normal-case text-dark/70 max-w-xl break-words">
                Live roster of students currently enrolled into your grade-specific classes.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 md:p-12 space-y-6 sm:space-y-8 min-w-0">
          
          {action ? (
            <section className="rounded-[20px] sm:rounded-xl border-[3px] border-dark bg-blue-100 p-4 text-sm text-dark font-black shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] break-words">
              Action Center: <strong>{action}</strong> mode is active.
            </section>
          ) : null}

          <section className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-4 min-w-0">
            <Stat title="Active Students" value={String(learners.length)} icon={Users} bgColor="bg-emerald-200" />
            <Stat title="Attendance Marked" value={String(attendanceMarkedCount ?? 0)} icon={CheckCircle2} bgColor="bg-blue-200" />
            <Stat title="Weak Engagement" value={String(weakEngagementCount)} icon={AlertTriangle} bgColor="bg-rose-200" />
            <Stat title="Classes Covered" value={String(classesCovered)} icon={Trophy} bgColor="bg-amber-200" />
          </section>

          <section className="grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-12 min-w-0">
            
            {/* Student List Area */}
            <div className="xl:col-span-8 min-w-0">
              <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] overflow-hidden min-w-0">
                <div className="p-5 sm:p-6 border-b-[3px] border-dark bg-off-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight break-words">Student List</h2>
                  <Link href="/dash/tutor/builder" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-yellow border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 text-xs py-3 sm:py-2 flex justify-center break-words">
                      Create Assignment
                    </Button>
                  </Link>
                </div>
                <div className="p-5 sm:p-6 space-y-4 min-w-0">
                  {learners.length > 0 ? (
                    learners.map((learner) => (
                      <div key={learner.id} className="rounded-[20px] sm:rounded-2xl border-[3px] border-dark bg-off-white p-4 sm:p-5 shadow-[4px_4px_0px_#060E1C] min-w-0">
                        <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 md:items-center min-w-0">
                          <p className="text-base sm:text-sm font-black text-dark break-words">{learner.name}</p>
                          <p className="text-xs font-bold text-dark/70 break-words">{learner.className}</p>
                          <p className="text-xs font-bold text-dark/70 break-words">{learner.gradeLabel}</p>
                          <p className="text-xs font-bold text-dark/70 break-words">{learner.schoolName ?? 'School pending'}</p>
                          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.12em] text-emerald-600 bg-emerald-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border-[2px] border-emerald-300 self-start md:self-auto text-center shrink-0 w-fit md:w-full break-words">{learner.status}</p>
                          <div className="flex flex-col gap-2 sm:col-span-2 md:col-span-5 pt-3 mt-3 border-t-[2px] border-dark/10 min-w-0">
                            {learner.personalMeetHostUrl ? (
                              <a href={learner.personalMeetHostUrl} target="_blank" rel="noreferrer" className="text-[10px] sm:text-xs font-black text-blue-600 hover:underline inline-flex items-center gap-1 w-fit break-words">
                                <Video className="w-3 h-3 sm:w-4 sm:h-4" /> Join Eternal Meet
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
                    <div className="rounded-[20px] sm:rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-6 sm:p-8 text-center text-xs sm:text-sm font-semibold text-dark/60 min-w-0">
                      No students are enrolled into your classes yet. As soon as a student logs in with a matching grade profile, they will be auto-enrolled and appear here.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6 sm:space-y-8 xl:col-span-4 min-w-0">
              
              <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-amber-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-dark flex items-center gap-2 mb-4 break-words">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-dark shrink-0" />
                  Roster Overview
                </h3>
                <div className="space-y-3 text-xs sm:text-sm font-semibold text-dark/80 min-w-0">
                  <div className="rounded-xl border-[2px] border-dark bg-white p-3 sm:p-4 shadow-[2px_2px_0px_#060E1C] break-words">
                    This roster displays all active students currently assigned to your classes. Student profiles and class rosters update automatically in real time.
                  </div>
                  <div className="rounded-xl border-[2px] border-dark bg-white p-3 sm:p-4 shadow-[2px_2px_0px_#060E1C] break-words">
                    New assignments automatically align with students in the matching grade level for seamless curriculum delivery.
                  </div>
                </div>
              </div>

              <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-white p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-dark flex items-center gap-2 mb-4 break-words">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-dark shrink-0" />
                  Top Visible Learners
                </h3>
                <div className="space-y-3 min-w-0">
                  {leaderboard.length > 0 ? (
                    leaderboard.map((item) => (
                      <div key={item.rank} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-[2px] border-dark bg-off-white p-3 sm:p-4 shadow-[2px_2px_0px_#060E1C] min-w-0">
                        <span className="text-xs sm:text-sm font-black text-dark break-words min-w-0 w-full sm:w-auto">
                          #{item.rank} {item.name}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border-[2px] border-emerald-300 break-words shrink-0">Visible</span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border-[2px] sm:border-[3px] border-dashed border-dark/20 bg-slate-50 p-4 sm:p-6 text-center text-xs sm:text-sm font-semibold text-dark/60 min-w-0">
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
    <div className={`border-[2px] sm:border-[3px] border-dark rounded-[20px] sm:rounded-2xl ${bgColor} p-4 sm:p-6 shadow-[3px_3px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0`}>
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-dark/70 break-words">{title}</p>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-black text-dark break-words">{value}</p>
        </div>
        <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl border-[2px] sm:border-[3px] border-dark bg-white flex items-center justify-center shadow-[2px_2px_0px_#060E1C]">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-dark" />
        </div>
      </div>
    </div>
  );
}
