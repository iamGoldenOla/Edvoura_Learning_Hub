import Link from 'next/link';
import { requireAppViewer } from '@/lib/app-context';
import { ClassroomWorkspace } from '@/components/classroom/ClassroomWorkspace';
import { TutorClassroomPupilSwitch } from '@/components/classroom/TutorClassroomPupilSwitch';
import { ArrowLeft, Video } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams?: Promise<{
    lessonId?: string;
    studentId?: string;
    studentName?: string;
  }> | {
    lessonId?: string;
    studentId?: string;
    studentName?: string;
  };
}

export default async function TutorClassroomPage(props: PageProps) {
  const viewer = await requireAppViewer();
  const searchParams = (await props.searchParams) ?? {};
  const supabase = await createClient();

  let lessonId = searchParams.lessonId;
  let activeStudentId = searchParams.studentId;
  let activeStudentName = searchParams.studentName;

  if (!lessonId && activeStudentId) {
    lessonId = `1on1-${activeStudentId}`;
  }

  // Auto-resolve lesson if not explicitly provided
  if (!lessonId) {
    const nowIso = new Date(Date.now() - 45 * 60 * 1000).toISOString();

    // 1. Check for live or upcoming scheduled lesson for this tutor
    const { data: upcomingLessons } = await supabase
      .from('lessons')
      .select('id, title, status, scheduled_start_at')
      .eq('tutor_id', viewer.currentUser.userId)
      .or(`status.eq.live,scheduled_start_at.gte.${nowIso}`)
      .order('scheduled_start_at', { ascending: true })
      .limit(1);

    if (upcomingLessons && upcomingLessons.length > 0) {
      lessonId = upcomingLessons[0].id;
    } else {
      // 2. Check for most recently created lesson
      const { data: recentLessons } = await supabase
        .from('lessons')
        .select('id, title, status')
        .eq('tutor_id', viewer.currentUser.userId)
        .order('scheduled_start_at', { ascending: false })
        .limit(1);

      if (recentLessons && recentLessons.length > 0) {
        lessonId = recentLessons[0].id;
      } else {
        // 3. Fallback to instant studio workspace (always available)
        lessonId = `instant-${viewer.currentUser.userId}`;
      }
    }
  }

  // Fetch student roster so tutor can switch pupil on the fly
  const { data: studentProfiles = [] } = await supabase
    .from('student_profiles')
    .select('user_id, personal_meet_url, grade_levels(display_name)');

  const studentUserIds = (studentProfiles ?? []).map((sp) => sp.user_id);
  const { data: profileRows = [] } = studentUserIds.length
    ? await supabase.from('profiles').select('id, full_name, email').in('id', studentUserIds)
    : { data: [] };

  const nameMap = new Map((profileRows ?? []).map((p) => [p.id, p.full_name || p.email || 'Student']));

  const pupilsList = (studentProfiles ?? []).map((sp) => ({
    id: sp.user_id,
    name: nameMap.get(sp.user_id) || 'Student',
    grade: (sp.grade_levels as any)?.display_name || 'Primary',
  })).sort((a, b) => a.name.localeCompare(b.name));

  // If a student was targeted, find their display name if not passed in searchParams
  if (activeStudentId && !activeStudentName) {
    activeStudentName = nameMap.get(activeStudentId) || undefined;
  }

  const userName = viewer.currentUser.profile?.fullName || 'Tutor';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dash/tutor/roster"
            className="flex h-10 w-10 items-center justify-center rounded-xl border-[2.5px] border-dark bg-white hover:bg-slate-50 text-dark shadow-[3px_3px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:scale-95 shrink-0"
            title="Return to Student Roster"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-dark tracking-tight uppercase flex items-center gap-2">
              <Video className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Tutor Classroom Hub</span>
              {activeStudentName && (
                <span className="text-dark/60 text-base font-bold lowercase normal-case">
                  • {activeStudentName}
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Pupil Switcher inside classroom */}
        <TutorClassroomPupilSwitch
          currentStudentId={activeStudentId}
          currentStudentName={activeStudentName}
          pupils={pupilsList}
        />
      </div>

      <ClassroomWorkspace
        lessonId={lessonId || `instant-${viewer.currentUser.userId}`}
        role="tutor"
        userName={userName}
      />
    </div>
  );
}
