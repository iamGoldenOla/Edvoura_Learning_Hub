import ProfileSettingsClient from '@/components/dashboards/ProfileSettingsClient';
import { requireAppViewer } from '@/lib/app-context';
import { createClient } from '@/utils/supabase/server';

type TutorProfileResponse = {
  fullName: string | null;
  phoneNumber: string | null;
  timezone: string;
  headline: string | null;
  bio: string | null;
  expertiseSummary: string | null;
  availabilityNotes: string | null;
};

type ClassRow = {
  id: string;
  title: string;
  subjectName: string;
  status: string;
};

type StudentProfileResponse = {
  gradeLevelCode: string;
  schoolName: string | null;
  academicGoalNotes: string | null;
  timezone: string;
};

type StudentDashboardResponse = {
  stats: {
    activeClasses: number;
    pendingAssignments: number;
    completedAssignments: number;
    upcomingLessons: number;
  };
};

export default async function ProfileDashboard() {
  const viewer = await requireAppViewer();
  if (!viewer) return null;

  const supabase = await createClient();

  let tutorProfile: TutorProfileResponse | null = null;
  let tutorClasses: ClassRow[] = [];
  let studentProfile: StudentProfileResponse | null = null;
  let studentSummary: StudentDashboardResponse['stats'] | null = null;

  if (viewer.currentUser.primaryRole === 'tutor') {
    const { data: tp } = await supabase
      .from('tutor_profiles')
      .select('headline, bio, expertise_summary, availability_notes')
      .eq('user_id', viewer.currentUser.userId)
      .maybeSingle();

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone_number, timezone')
      .eq('id', viewer.currentUser.userId)
      .single();

    if (tp) {
      tutorProfile = {
        fullName: profile?.full_name ?? null,
        phoneNumber: profile?.phone_number ?? null,
        timezone: profile?.timezone ?? 'Africa/Lagos',
        headline: tp.headline,
        bio: tp.bio,
        expertiseSummary: tp.expertise_summary,
        availabilityNotes: tp.availability_notes,
      };
    }

    const { data: classesData } = await supabase
      .from('classes')
      .select('id, title, subject_id, status')
      .eq('primary_tutor_user_id', viewer.currentUser.userId);

    const normalizedClasses = classesData ?? [];
    const subjectIds = [...new Set(normalizedClasses.map(c => c.subject_id).filter(Boolean))];

    const { data: subjectsData } = subjectIds.length
      ? await supabase.from('subjects').select('id, name').in('id', subjectIds)
      : { data: [] as Array<{ id: string; name: string }> };

    const subjectById = new Map((subjectsData ?? []).map(s => [s.id, s.name]));

    tutorClasses = normalizedClasses.map(c => ({
      id: c.id,
      title: c.title,
      subjectName: subjectById.get(c.subject_id) ?? 'General',
      status: c.status ?? 'active',
    }));
  }

  if (viewer.currentUser.primaryRole === 'student') {
    const { data: sp } = await supabase
      .from('student_profiles')
      .select('grade_level_id, school_name, academic_goal_notes')
      .eq('user_id', viewer.currentUser.userId)
      .maybeSingle();

    if (sp) {
      const { data: gradeLevel } = await supabase
        .from('grade_levels')
        .select('code')
        .eq('id', sp.grade_level_id)
        .single();

      studentProfile = {
        gradeLevelCode: gradeLevel?.code ?? 'grade_7',
        schoolName: sp.school_name,
        academicGoalNotes: sp.academic_goal_notes,
        timezone: 'Africa/Lagos',
      };
    }

    // Quick stats
    const { data: enrollments } = await supabase
      .from('class_enrollments')
      .select('class_id')
      .eq('student_user_id', viewer.currentUser.userId)
      .eq('status', 'active');

    const classIds = (enrollments ?? []).map(e => e.class_id);

    const { data: assignments } = classIds.length
      ? await supabase.from('assignments').select('id').in('class_id', classIds).neq('status', 'archived')
      : { data: [] as Array<{ id: string }> };

    const assignmentIds = (assignments ?? []).map(a => a.id);

    const { data: submissions } = assignmentIds.length
      ? await supabase.from('assignment_submissions').select('status').eq('student_user_id', viewer.currentUser.userId).in('assignment_id', assignmentIds)
      : { data: [] as Array<{ status: string | null }> };

    const normalizedSubs = submissions ?? [];
    const pending = normalizedSubs.filter(s => !s.status || s.status === 'draft' || s.status === 'submitted').length;
    const completed = normalizedSubs.filter(s => s.status === 'graded' || s.status === 'returned').length;

    const { data: lessons } = classIds.length
      ? await supabase.from('lessons').select('id').in('class_id', classIds).in('status', ['scheduled', 'live']).gte('scheduled_end_at', new Date().toISOString())
      : { data: [] as Array<{ id: string }> };

    studentSummary = {
      activeClasses: classIds.length,
      pendingAssignments: pending,
      completedAssignments: completed,
      upcomingLessons: (lessons ?? []).length,
    };
  }

  return (
    <ProfileSettingsClient
      viewer={viewer.currentUser}
      tutorProfile={
        tutorProfile
          ? {
              phoneNumber: tutorProfile.phoneNumber ?? '',
              timezone: tutorProfile.timezone,
              headline: tutorProfile.headline ?? '',
              bio: tutorProfile.bio ?? '',
              expertiseSummary: tutorProfile.expertiseSummary ?? '',
              availabilityNotes: tutorProfile.availabilityNotes ?? '',
            }
          : null
      }
      tutorClasses={tutorClasses}
      studentProfile={
        studentProfile
          ? {
              gradeLevelCode: studentProfile.gradeLevelCode,
              schoolName: studentProfile.schoolName ?? '',
              academicGoalNotes: studentProfile.academicGoalNotes ?? '',
              timezone: studentProfile.timezone,
            }
          : null
      }
      studentSummary={studentSummary}
    />
  );
}

