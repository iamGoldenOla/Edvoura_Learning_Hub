import type { AppRole, CurrentUser, GradeBandCode } from '@edvoura/contracts';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';

export type AppViewer = {
  accessToken: string;
  currentUser: CurrentUser;
};

export type BillingSummary = {
  entitlement: {
    hasAccess: boolean;
    reason: string;
  };
  subscription: {
    id: string;
    status: string;
    currentPeriodEnd: string | null;
    planName: string | null;
    planAmountMinor: number | null;
    planCurrencyCode: string | null;
  } | null;
  plans: Array<{
    id: string;
    name: string;
    interval: string;
    amountMinor: number;
    currencyCode: string;
  }>;
  invoices: Array<{
    id: string;
    status: string;
    amountDueMinor: number;
    amountPaidMinor: number;
    dueAt: string | null;
  }>;
};

export type StudentDashboardData = {
  profile: {
    userId: string;
    fullName: string | null;
    email: string;
    avatarPath: string | null;
    dateOfBirth?: string | null;
    gradeLevelCode: string;
    gradeLevelName: string;
    gradeBandCode: GradeBandCode;
    gradeBandName: string;
    schoolName: string | null;
    academicGoalNotes: string | null;
    personalMeetUrl: string | null;
    personalMeetHostUrl: string | null;
  };
  stats: {
    activeClasses: number;
    pendingAssignments: number;
    completedAssignments: number;
    upcomingLessons: number;
    averageScore: string | null;
    attendanceRate: string | null;
    assignmentCompletionRate: string | null;
  };
  enrollments: Array<{
    id: string;
    classId: string;
    classTitle: string;
    classDescription: string | null;
    subjectName: string;
    tutorName: string | null;
  }>;
  upcomingLessons: Array<{
    id: string;
    title: string;
    subjectName: string;
    classTitle: string;
    scheduledStartAt: string;
    scheduledEndAt: string;
    joinUrl: string | null;
    provider: string;
    status: string;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    dueAt: string | null;
    classTitle: string;
    subjectName: string;
    submissionStatus: string | null;
    score: string | null;
    instructions: string | null;
    feedbackText: string | null;
    resources: Array<{
      id: string;
      fileName: string;
      downloadUrl: string | null;
    }>;
  }>;
  progress: Array<{
    id: string;
    subjectName: string | null;
    averageScore: string | null;
    attendanceRate: string | null;
    assignmentCompletionRate: string | null;
    masteryNotes: string | null;
    snapshotDate: string;
  }>;
  sharedResources?: Array<{
    id: string;
    title: string;
    description: string;
    className: string;
    createdAt: string;
    files: Array<{
      id: string;
      fileName: string;
      downloadUrl: string | null;
    }>;
  }>;
};

type SessionUserLike = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type StudentLiveLessonRow = {
  id: string;
  title: string;
  class_title: string;
  subject_name: string;
  scheduled_start_at: string;
  scheduled_end_at: string;
  join_url: string | null;
  provider: string;
  status: string;
};

const validRoles: AppRole[] = ['student', 'parent', 'tutor', 'admin', 'super_admin'];

const buildFallbackStudentDashboard = (
  sessionUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null,
): StudentDashboardData => {
  const fullName =
    typeof sessionUser?.user_metadata?.full_name === 'string' ? sessionUser.user_metadata.full_name : null;
  const email = sessionUser?.email ?? 'student@edvouralearninghub.com';

  const userMetaGrade =
    typeof sessionUser?.user_metadata?.grade_level_code === 'string'
      ? sessionUser.user_metadata.grade_level_code
      : typeof sessionUser?.user_metadata?.grade === 'string'
        ? sessionUser.user_metadata.grade
        : 'grade_3';

  return {
    profile: {
      userId: sessionUser?.id ?? 'local-student',
      fullName,
      email,
      avatarPath: null,
      gradeLevelCode: userMetaGrade,
      gradeLevelName: userMetaGrade === 'grade_3' ? 'Primary 3 (Grade 3)' : 'Primary 3 / Grade 3',
      gradeBandCode: 'grades_1_3',
      gradeBandName: 'Primary / Early Years',
      schoolName: null,
      academicGoalNotes: null,
      personalMeetUrl: null,
      personalMeetHostUrl: null,
    },
    stats: {
      activeClasses: 0,
      pendingAssignments: 0,
      completedAssignments: 0,
      upcomingLessons: 0,
      averageScore: null,
      attendanceRate: null,
      assignmentCompletionRate: null,
    },
    enrollments: [],
    upcomingLessons: [],
    assignments: [],
    progress: [],
    sharedResources: [],
  };
};

const buildFallbackBillingSummary = (): BillingSummary => ({
  entitlement: {
    hasAccess: true,
    reason: 'billing_api_unavailable',
  },
  subscription: null,
  plans: [],
  invoices: [],
});

const pickRole = (value: unknown): AppRole | null => {
  if (typeof value !== 'string') {
    return null;
  }

  return validRoles.includes(value as AppRole) ? (value as AppRole) : null;
};

const derivePrimaryRole = (roles: string[], sessionUser: SessionUserLike): AppRole => {
  const roleFromRows = roles
    .map((role) => pickRole(role))
    .find((role): role is AppRole => Boolean(role));

  if (roleFromRows) {
    return roleFromRows;
  }

  return pickRole(sessionUser.user_metadata?.role) ?? 'student';
};

async function syncCurrentUserMembership(supabase: SupabaseServerClient) {
  const { error } = await supabase.rpc('sync_current_user_membership');

  if (error && !/function .*sync_current_user_membership/i.test(error.message)) {
    throw error;
  }
}

async function buildDirectCurrentUser(
  supabase: SupabaseServerClient,
  sessionUser: SessionUserLike,
): Promise<CurrentUser> {
  await syncCurrentUserMembership(supabase);

  const [{ data: profile }, { data: rolesData }] = await Promise.all([
    supabase.from('profiles').select('id, email, full_name, avatar_path, date_of_birth').eq('id', sessionUser.id).single(),
    supabase.from('user_roles').select('role').eq('user_id', sessionUser.id),
  ]);

  const roles = (rolesData ?? []).map((entry) => entry.role).filter(Boolean);
  const primaryRole = derivePrimaryRole(roles, sessionUser);

  let learnerProfile: CurrentUser['learnerProfile'] = null;

  if (primaryRole === 'student') {
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('grade_level_id, learner_band_id, school_name, academic_goal_notes')
      .eq('user_id', sessionUser.id)
      .maybeSingle();

    if (studentProfile) {
      const [{ data: gradeLevel }, { data: gradeBand }] = await Promise.all([
        supabase.from('grade_levels').select('code, display_name').eq('id', studentProfile.grade_level_id).single(),
        supabase.from('grade_bands').select('code, name').eq('id', studentProfile.learner_band_id).single(),
      ]);

      if (gradeLevel && gradeBand) {
        learnerProfile = {
          gradeLevelCode: gradeLevel.code,
          gradeLevelName: gradeLevel.display_name,
          gradeBandCode: gradeBand.code as GradeBandCode,
          gradeBandName: gradeBand.name,
          schoolName: studentProfile.school_name,
          academicGoalNotes: studentProfile.academic_goal_notes,
        };
      }
    }
  }

  return {
    userId: sessionUser.id,
    email: profile?.email ?? sessionUser.email ?? 'unknown@local.test',
    roles: roles.length > 0 ? (roles as AppRole[]) : [primaryRole],
    primaryRole,
    profile: {
      id: sessionUser.id,
      email: profile?.email ?? sessionUser.email ?? 'unknown@local.test',
      fullName:
        profile?.full_name ??
        (typeof sessionUser.user_metadata?.full_name === 'string' ? sessionUser.user_metadata.full_name : null),
      dateOfBirth: profile?.date_of_birth ?? null,
      avatarPath: profile?.avatar_path ?? null,
    },
    learnerProfile,
  };
}

async function getDirectStudentDashboardFromSupabase(
  supabase: SupabaseServerClient,
  sessionUser: SessionUserLike,
): Promise<StudentDashboardData> {
  await syncCurrentUserMembership(supabase);

  const [{ data: profile }, { data: studentProfile }] = await Promise.all([
    supabase.from('profiles').select('id, email, full_name, avatar_path, date_of_birth').eq('id', sessionUser.id).single(),
    supabase
      .from('student_profiles')
      .select('grade_level_id, learner_band_id, school_name, academic_goal_notes, personal_meet_url, personal_meet_host_url')
      .eq('user_id', sessionUser.id)
      .maybeSingle(),
  ]);

  if (!studentProfile) {
    return buildFallbackStudentDashboard(sessionUser);
  }

  const [{ data: gradeLevel }, { data: gradeBand }, { data: enrollmentsData = [] }] = await Promise.all([
    supabase.from('grade_levels').select('id, code, display_name').eq('id', studentProfile.grade_level_id).single(),
    supabase.from('grade_bands').select('id, code, name').eq('id', studentProfile.learner_band_id).single(),
    supabase
      .from('class_enrollments')
      .select('id, class_id, status')
      .eq('student_user_id', sessionUser.id)
      .eq('status', 'active'),
  ]);

  const normalizedEnrollments = enrollmentsData ?? [];
  const classIds = [...new Set(normalizedEnrollments.map((item) => item.class_id))];

  const { data: classesData = [] } = classIds.length
    ? await supabase
        .from('classes')
        .select('id, title, description, subject_id, primary_tutor_user_id')
        .in('id', classIds)
    : { data: [] as Array<{ id: string; title: string; description: string | null; subject_id: string; primary_tutor_user_id: string | null }> };

  const normalizedClasses = classesData ?? [];
  const subjectIds = [...new Set(normalizedClasses.map((item) => item.subject_id).filter(Boolean))];
  const tutorIds = [...new Set(normalizedClasses.map((item) => item.primary_tutor_user_id).filter(Boolean))];

  const [{ data: subjectsData = [] }, { data: tutorsData = [] }] = await Promise.all([
    subjectIds.length
      ? supabase.from('subjects').select('id, name').in('id', subjectIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
    tutorIds.length
      ? supabase.from('profiles').select('id, full_name').in('id', tutorIds)
      : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null }> }),
  ]);

  const normalizedSubjects = subjectsData ?? [];
  const normalizedTutors = tutorsData ?? [];
  const classById = new Map(normalizedClasses.map((item) => [item.id, item]));
  const subjectById = new Map(normalizedSubjects.map((item) => [item.id, item.name]));
  const tutorById = new Map(normalizedTutors.map((item) => [item.id, item.full_name]));

  const { data: assignmentsData = [] } = classIds.length
    ? await supabase
        .from('assignments')
        .select('id, class_id, title, due_at, instructions')
        .in('class_id', classIds)
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
    : { data: [] as Array<{ id: string; class_id: string; title: string; due_at: string | null; instructions: string | null }> };

  const normalizedAssignmentsData = assignmentsData ?? [];
  const assignmentIds = normalizedAssignmentsData.map((item) => item.id);

  const { data: assignmentFilesData = [] } = assignmentIds.length
    ? await supabase
        .from('assignment_files')
        .select('id, assignment_id, bucket_id, object_path')
        .in('assignment_id', assignmentIds)
    : { data: [] as Array<{ id: string; assignment_id: string; bucket_id: string; object_path: string }> };

  const { data: submissionsData = [] } = assignmentIds.length
    ? await supabase
        .from('assignment_submissions')
        .select('id, assignment_id, status')
        .eq('student_user_id', sessionUser.id)
        .in('assignment_id', assignmentIds)
    : { data: [] as Array<{ id: string; assignment_id: string; status: string | null }> };

  const normalizedSubmissions = submissionsData ?? [];
  const submissionIds = normalizedSubmissions.map((item) => item.id);

  const { data: gradesData = [] } = submissionIds.length
    ? await supabase
        .from('submission_grades')
        .select('submission_id, score, feedback_text')
        .in('submission_id', submissionIds)
    : { data: [] as Array<{ submission_id: string; score: number | null; feedback_text: string | null }> };

  const { data: lessonsData = [] } = classIds.length
    ? await supabase
        .from('lessons')
        .select('id, class_id, title, scheduled_start_at, scheduled_end_at, provider, status')
        .in('class_id', classIds)
        .in('status', ['scheduled', 'live'])
        .gte('scheduled_end_at', new Date().toISOString())
        .order('scheduled_start_at', { ascending: true })
        .limit(6)
    : {
        data: [] as Array<{
          id: string;
          class_id: string;
          title: string;
          scheduled_start_at: string;
          scheduled_end_at: string;
          provider: string;
          status: string;
        }>,
      };

  const { data: liveLessonRows = [] } = await supabase.rpc('list_student_live_lessons');

  const { data: progressData = [] } = await supabase
    .from('progress_snapshots')
    .select('id, subject_id, snapshot_date, average_score, attendance_rate, assignment_completion_rate, mastery_notes')
    .eq('student_user_id', sessionUser.id)
    .order('snapshot_date', { ascending: false })
    .limit(6);

  const { data: sharedResourcesRows = [] } = classIds.length
    ? await supabase
        .from('learning_activity_events')
        .select('id, payload, created_at, class_id, assignment_id')
        .eq('event_type', 'lesson_resource_uploaded')
        .in('class_id', classIds)
        .order('created_at', { ascending: false })
        .limit(3)
    : { data: [] };

  const sharedResourceAssignmentIds = (sharedResourcesRows ?? [])
    .map((r) => r.assignment_id)
    .filter(Boolean);

  const { data: sharedFiles = [] } = sharedResourceAssignmentIds.length > 0
    ? await supabase
        .from('assignment_files')
        .select('id, assignment_id, bucket_id, object_path')
        .in('assignment_id', sharedResourceAssignmentIds)
    : { data: [] };

  const sharedResourcesWithUrls = await Promise.all(
    (sharedResourcesRows ?? []).map(async (row) => {
      const relatedFiles = (sharedFiles ?? []).filter((f) => f.assignment_id === row.assignment_id);
      const filesWithUrls = await Promise.all(
        relatedFiles.map(async (f) => {
          const { data } = await supabase.storage.from(f.bucket_id).createSignedUrl(f.object_path, 3600);
          return {
            id: f.id,
            fileName: f.object_path.split('/').pop() ?? f.object_path,
            downloadUrl: data?.signedUrl ?? null,
          };
        })
      );
      const relatedClass = classById.get(row.class_id);
      return {
        id: row.id,
        title: String(row.payload?.title || 'Shared Resource'),
        description: String(row.payload?.description || ''),
        className: relatedClass?.title ?? 'General Studies',
        createdAt: row.created_at,
        files: filesWithUrls,
      };
    })
  );

  // Fetch published AI & pushed lesson notes (e.g. Basic Science)
  const { data: publishedLessonNotes = [] } = await supabase
    .from('ai_generated_content')
    .select('id, title, subject, topic, grade, created_at')
    .in('task_type', ['GENERATE_LESSON_NOTE', 'GENERATE_LESSON', 'GENERATE_FINANCIAL_LITERACY', 'GENERATE_COMMUNICATION_SKILL', 'LESSON_NOTE_PUSHED'])
    .eq('status', 'PUBLISHED')
    .order('created_at', { ascending: false })
    .limit(6);

  const formattedPushedLessonNotes = (publishedLessonNotes ?? []).map((note) => ({
    id: note.id,
    title: note.title || `${note.subject || 'Basic Science'}: ${note.topic || 'Pushed Resource'}`,
    description: `Pushed Lesson Note for ${note.subject ?? 'Basic Science'} (${note.grade ?? 'Grade 3'})`,
    className: note.subject ?? 'Basic Science',
    createdAt: note.created_at,
    files: [
      {
        id: `note_file_${note.id}`,
        fileName: `${note.subject || 'Basic_Science'}_Lesson_Note.pdf`,
        downloadUrl: `/dash/student/notes`,
      },
    ],
  }));

  const allSharedResources = [...sharedResourcesWithUrls, ...formattedPushedLessonNotes];

  const normalizedGrades = gradesData ?? [];
  const normalizedLessons = lessonsData ?? [];
  const normalizedLiveLessonRows = (liveLessonRows ?? []) as StudentLiveLessonRow[];
  const normalizedProgress = progressData ?? [];
  const normalizedAssignmentFiles = assignmentFilesData ?? [];
  const progressSubjectIds = [...new Set(normalizedProgress.map((item) => item.subject_id).filter(Boolean))];
  const { data: progressSubjectsData = [] } = progressSubjectIds.length
    ? await supabase.from('subjects').select('id, name').in('id', progressSubjectIds)
    : { data: [] as Array<{ id: string; name: string }> };

  const normalizedProgressSubjects = progressSubjectsData ?? [];
  const progressSubjectById = new Map(normalizedProgressSubjects.map((item) => [item.id, item.name]));
  const submissionByAssignmentId = new Map(normalizedSubmissions.map((item) => [item.assignment_id, item]));
  const gradeBySubmissionId = new Map(normalizedGrades.map((item) => [item.submission_id, item]));
  const assignmentFilesByAssignmentId = new Map<string, Array<{ id: string; assignment_id: string; bucket_id: string; object_path: string }>>();

  normalizedAssignmentFiles.forEach((file) => {
    const current = assignmentFilesByAssignmentId.get(file.assignment_id) ?? [];
    current.push(file);
    assignmentFilesByAssignmentId.set(file.assignment_id, current);
  });

  const liveLessonById = new Map(normalizedLiveLessonRows.map((lesson) => [lesson.id, lesson]));

  const assignments = normalizedAssignmentsData.map((item) => {
    const relatedClass = classById.get(item.class_id);
    const relatedSubmission = submissionByAssignmentId.get(item.id);
    const relatedGrade = relatedSubmission ? gradeBySubmissionId.get(relatedSubmission.id) : null;
    const relatedFiles = assignmentFilesByAssignmentId.get(item.id) ?? [];

    return {
      id: item.id,
      title: item.title,
      dueAt: item.due_at,
      classTitle: relatedClass?.title ?? 'Untitled class',
      subjectName: relatedClass ? subjectById.get(relatedClass.subject_id) ?? 'General Studies' : 'General Studies',
      instructions: item.instructions,
      submissionStatus: relatedSubmission?.status ?? null,
      score: relatedGrade?.score != null ? String(relatedGrade.score) : null,
      feedbackText: relatedGrade?.feedback_text ?? null,
      resources: relatedFiles.map((file) => ({
        id: file.id,
        fileName: file.object_path.split('/').pop() ?? file.object_path,
        downloadUrl: null as string | null,
      })),
    };
  });

  await Promise.all(
    assignments.flatMap((assignment) =>
      assignment.resources.map(async (resource) => {
        const file = normalizedAssignmentFiles.find((entry) => entry.id === resource.id);
        if (!file) {
          return;
        }

        const { data } = await supabase.storage.from(file.bucket_id).createSignedUrl(file.object_path, 3600);
        resource.downloadUrl = data?.signedUrl ?? null;
      }),
    ),
  );

  const gradedAssignments = assignments.filter(
    (assignment) =>
      assignment.submissionStatus === 'graded' || assignment.submissionStatus === 'returned',
  );
  const latestProgress = normalizedProgress[0];
  const averageScore =
    latestProgress?.average_score != null
      ? `${Number(latestProgress.average_score).toFixed(0)}%`
      : gradedAssignments.length > 0
        ? `${(
            gradedAssignments.reduce((sum, item) => sum + Number(item.score ?? 0), 0) / gradedAssignments.length
          ).toFixed(0)}%`
        : null;

  return {
    profile: {
      userId: sessionUser.id,
      fullName: profile?.full_name ?? null,
      email: profile?.email ?? sessionUser.email ?? 'student@edvouralearninghub.com',
      avatarPath: profile?.avatar_path ?? null,
      dateOfBirth: profile?.date_of_birth ?? (sessionUser.user_metadata as any)?.date_of_birth ?? null,
      gradeLevelCode: gradeLevel?.code ?? 'grade_7',
      gradeLevelName: gradeLevel?.display_name ?? 'Grade level pending',
      gradeBandCode: (gradeBand?.code as GradeBandCode | undefined) ?? 'grades_7_12',
      gradeBandName: gradeBand?.name ?? 'Senior Years',
      schoolName: studentProfile.school_name,
      academicGoalNotes: studentProfile.academic_goal_notes,
      personalMeetUrl: studentProfile.personal_meet_url,
      personalMeetHostUrl: studentProfile.personal_meet_host_url,
    },
    stats: {
      activeClasses: normalizedEnrollments.length,
      pendingAssignments: assignments.filter(
        (assignment) =>
          !assignment.submissionStatus ||
          assignment.submissionStatus === 'draft' ||
          assignment.submissionStatus === 'submitted' ||
          assignment.submissionStatus === 'late',
      ).length,
      completedAssignments: gradedAssignments.length,
      upcomingLessons: normalizedLessons.length,
      averageScore,
      attendanceRate:
        latestProgress?.attendance_rate != null ? `${Number(latestProgress.attendance_rate).toFixed(0)}%` : null,
      assignmentCompletionRate:
        latestProgress?.assignment_completion_rate != null
          ? `${Number(latestProgress.assignment_completion_rate).toFixed(0)}%`
          : null,
    },
    enrollments: normalizedEnrollments.map((enrollment) => {
      const relatedClass = classById.get(enrollment.class_id);

      return {
        id: enrollment.id,
        classId: enrollment.class_id,
        classTitle: relatedClass?.title ?? 'Untitled class',
        classDescription: relatedClass?.description ?? null,
        subjectName: relatedClass ? subjectById.get(relatedClass.subject_id) ?? 'General Studies' : 'General Studies',
        tutorName:
          relatedClass?.primary_tutor_user_id != null
            ? tutorById.get(relatedClass.primary_tutor_user_id) ?? 'Assigned tutor'
            : 'Assigned tutor',
      };
    }),
    upcomingLessons: normalizedLessons.map((lesson) => {
      const relatedClass = classById.get(lesson.class_id);
      const liveLesson = liveLessonById.get(lesson.id);

      return {
        id: lesson.id,
        title: liveLesson?.title ?? lesson.title,
        subjectName:
          liveLesson?.subject_name ??
          (relatedClass ? subjectById.get(relatedClass.subject_id) ?? 'General Studies' : 'General Studies'),
        classTitle: liveLesson?.class_title ?? relatedClass?.title ?? 'Untitled class',
        scheduledStartAt: lesson.scheduled_start_at,
        scheduledEndAt: lesson.scheduled_end_at,
        joinUrl: liveLesson?.join_url ?? null,
        provider: liveLesson?.provider ?? lesson.provider,
        status: lesson.status,
      };
    }),
    assignments,
    progress: normalizedProgress.map((item) => ({
      id: item.id,
      subjectName: item.subject_id ? progressSubjectById.get(item.subject_id) ?? null : null,
      averageScore: item.average_score != null ? `${Number(item.average_score).toFixed(0)}%` : null,
      attendanceRate: item.attendance_rate != null ? `${Number(item.attendance_rate).toFixed(0)}%` : null,
      assignmentCompletionRate:
        item.assignment_completion_rate != null
          ? `${Number(item.assignment_completion_rate).toFixed(0)}%`
          : null,
      masteryNotes: item.mastery_notes,
      snapshotDate: item.snapshot_date,
    })),
    sharedResources: allSharedResources,
  };
}

export const roleToDashboardPath: Record<string, string> = {
  student: '/dash/student',
  parent: '/dash/parent',
  tutor: '/dash/tutor',
  admin: '/dash/admin',
  super_admin: '/dash/admin',
};

export const gradeBandCodeToUiBand = (gradeBandCode?: GradeBandCode | null) => {
  switch (gradeBandCode) {
    case 'grades_1_3':
      return '1-3' as const;
    case 'grades_4_6':
      return '4-6' as const;
    case 'grades_7_12':
    default:
      return '7-12' as const;
  }
};

export async function getAppViewer(): Promise<AppViewer | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return null;
  }

  try {
    const currentUser = await buildDirectCurrentUser(supabase, session.user);

    return {
      accessToken: session.access_token,
      currentUser,
    };
  } catch {
    const currentUser = await buildDirectCurrentUser(supabase, session.user);

    return {
      accessToken: session.access_token,
      currentUser,
    };
  }
}

export async function requireAppViewer() {
  const viewer = await getAppViewer();

  if (!viewer) {
    redirect('/login');
  }

  return viewer;
}

export async function getStudentDashboardData(accessToken: string) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return buildFallbackStudentDashboard(null);
  }

  try {
    return await getDirectStudentDashboardFromSupabase(supabase, session.user);
  } catch {
    return buildFallbackStudentDashboard(session.user);
  }
}

async function getDirectBillingSummaryFromSupabase(
  supabase: SupabaseServerClient,
  sessionUser: SessionUserLike
): Promise<BillingSummary> {
  const { data: rolesData } = await supabase.from('user_roles').select('role').eq('user_id', sessionUser.id);
  const roles = (rolesData ?? []).map((r) => r.role);

  let ownerIds = [sessionUser.id];
  if (roles.includes('student')) {
    const { data: parentLinks } = await supabase
      .from('parent_child_links')
      .select('parent_user_id')
      .eq('child_user_id', sessionUser.id);
    if (parentLinks && parentLinks.length > 0) {
      ownerIds = parentLinks.map((l) => l.parent_user_id);
    }
  }

  let accessBlocked = false;
  if (ownerIds.length > 0) {
    const { data: parentProfiles } = await supabase
      .from('parent_profiles')
      .select('portal_access_blocked')
      .in('user_id', ownerIds);
    if (parentProfiles && parentProfiles.some((p: any) => p.portal_access_blocked)) {
      accessBlocked = true;
    }
  }

  const { data: plansData } = await supabase.schema('billing').from('plans')
    .select('id, code, name, interval, amount_minor, currency_code')
    .eq('is_active', true)
    .order('amount_minor', { ascending: true });

  let subscriptionData = null;
  if (ownerIds.length > 0) {
    const { data: sub } = await supabase.schema('billing').from('subscriptions')
      .select('id, plan_id, status, current_period_end, cancel_at_period_end')
      .in('account_owner_user_id', ownerIds)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    subscriptionData = sub;
  }

  const activePlanRows = plansData ?? [];
  let planDetails = null;

  if (subscriptionData?.plan_id) {
    planDetails = activePlanRows.find(p => p.id === subscriptionData.plan_id) ?? null;
  }

  let invoicesData: any[] = [];
  if (subscriptionData) {
    const { data: invs } = await supabase.schema('billing').from('invoices')
      .select('id, status, amount_due_minor, amount_paid_minor, due_at')
      .eq('subscription_id', subscriptionData.id)
      .order('created_at', { ascending: false })
      .limit(5);
    invoicesData = invs ?? [];
  }

  const subscription = subscriptionData ? {
    id: subscriptionData.id,
    status: subscriptionData.status,
    currentPeriodEnd: subscriptionData.current_period_end,
    planName: planDetails?.name ?? null,
    planAmountMinor: planDetails?.amount_minor ?? null,
    planCurrencyCode: planDetails?.currency_code ?? null,
  } : null;

  const entitlement = {
    hasAccess: !accessBlocked,
    reason: accessBlocked ? 'portal_access_blocked' : 'access_granted',
  };

  return {
    entitlement,
    subscription,
    plans: activePlanRows.map((p) => ({
      id: p.id,
      name: p.name,
      interval: p.interval,
      amountMinor: p.amount_minor,
      currencyCode: p.currency_code,
    })),
    invoices: invoicesData.map((i) => ({
      id: i.id,
      status: i.status,
      amountDueMinor: i.amount_due_minor,
      amountPaidMinor: i.amount_paid_minor,
      dueAt: i.due_at,
    })),
  };
}

export async function getBillingSummary(accessToken: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return buildFallbackBillingSummary();
  }

  try {
    return await getDirectBillingSummaryFromSupabase(supabase, session.user);
  } catch (error) {
    console.error('Failed to get direct billing summary:', error);
    return buildFallbackBillingSummary();
  }
}

/* ─────────────────────────────────────────────
   Tutor Dashboard — Direct Supabase
   ───────────────────────────────────────────── */

export type TutorDashboardData = {
  tutorName: string;
  timezone: string;
  classes: Array<{
    id: string;
    title: string;
    subjectName: string;
    studentCount: number;
  }>;
  todayLessons: Array<{
    id: string;
    title: string;
    classTitle: string;
    subjectName: string;
    scheduledStartAt: string;
    scheduledEndAt: string;
    status: string;
    studentCount: number;
    joinUrl: string | null;
  }>;
  gradingQueue: Array<{
    id: string;
    studentName: string;
    assignmentTitle: string;
    submittedAt: string;
    status: string;
  }>;
  totalStudents: number;
  totalAssignments: number;
  pendingGrading: number;
};

export async function getTutorDashboardData(): Promise<TutorDashboardData> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;
  const fallback: TutorDashboardData = {
    tutorName: session?.user?.user_metadata?.full_name as string ?? 'Tutor',
    timezone: 'UTC',
    classes: [],
    todayLessons: [],
    gradingQueue: [],
    totalStudents: 0,
    totalAssignments: 0,
    pendingGrading: 0,
  };

  if (!userId) return fallback;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    const tutorName = profile?.full_name ?? fallback.tutorName;

    const { data: tutorProfile } = await supabase
      .from('tutor_profiles')
      .select('timezone')
      .eq('user_id', userId)
      .maybeSingle();

    const timezone = tutorProfile?.timezone ?? 'UTC';

    // Get classes where this tutor is primary
    const { data: classesData = [] } = await supabase
      .from('classes')
      .select('id, title, subject_id')
      .eq('primary_tutor_user_id', userId);

    const normalizedClasses = classesData ?? [];
    const classIds = normalizedClasses.map((c) => c.id);
    const subjectIds = [...new Set(normalizedClasses.map((c) => c.subject_id).filter(Boolean))];

    const { data: subjectsData = [] } = subjectIds.length
      ? await supabase.from('subjects').select('id, name').in('id', subjectIds)
      : { data: [] as Array<{ id: string; name: string }> };

    const subjectById = new Map((subjectsData ?? []).map((s) => [s.id, s.name]));

    // Enrollment count per class
    const { data: enrollmentsData = [] } = classIds.length
      ? await supabase
          .from('class_enrollments')
          .select('class_id, student_user_id')
          .in('class_id', classIds)
          .eq('status', 'active')
      : { data: [] as Array<{ class_id: string; student_user_id: string }> };

    const normalizedEnrollments = enrollmentsData ?? [];
    const enrollmentCountByClass = new Map<string, number>();
    normalizedEnrollments.forEach((e) => {
      enrollmentCountByClass.set(e.class_id, (enrollmentCountByClass.get(e.class_id) ?? 0) + 1);
    });

    const uniqueStudentIds = new Set(normalizedEnrollments.map((e) => e.student_user_id));

    const classes = normalizedClasses.map((c) => ({
      id: c.id,
      title: c.title,
      subjectName: subjectById.get(c.subject_id) ?? 'General',
      studentCount: enrollmentCountByClass.get(c.id) ?? 0,
    }));

    // Today's lessons
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const { data: lessonsData = [] } = classIds.length
      ? await supabase
          .from('lessons')
          .select('id, class_id, title, scheduled_start_at, scheduled_end_at, status, provider')
          .in('class_id', classIds)
          .gte('scheduled_start_at', todayStart.toISOString())
          .lte('scheduled_start_at', todayEnd.toISOString())
          .order('scheduled_start_at', { ascending: true })
      : { data: [] as Array<{ id: string; class_id: string; title: string; scheduled_start_at: string; scheduled_end_at: string; status: string; provider: string }> };

    const normalizedLessons = lessonsData ?? [];
    const lessonIds = normalizedLessons.map(l => l.id);
    
    const { data: liveSessions = [] } = lessonIds.length
      ? await supabase.from('private.lesson_live_sessions').select('lesson_id, join_url, host_url').in('lesson_id', lessonIds)
      : { data: [] as any[] };

    const liveSessionByLessonId = new Map(liveSessions?.map(ls => [ls.lesson_id, ls]) ?? []);
    const classById = new Map(normalizedClasses.map((c) => [c.id, c]));

    const todayLessons = normalizedLessons.map((l) => {
      const relatedClass = classById.get(l.class_id);
      const liveSession = liveSessionByLessonId.get(l.id);
      
      return {
        id: l.id,
        title: l.title,
        classTitle: relatedClass?.title ?? 'Untitled',
        subjectName: relatedClass ? subjectById.get(relatedClass.subject_id) ?? 'General' : 'General',
        scheduledStartAt: l.scheduled_start_at,
        scheduledEndAt: l.scheduled_end_at,
        status: l.status,
        studentCount: enrollmentCountByClass.get(l.class_id) ?? 0,
        joinUrl: liveSession?.host_url ?? liveSession?.join_url ?? null,
      };
    });

    // Grading queue: ungraded submissions
    const { data: assignmentsData = [] } = classIds.length
      ? await supabase
          .from('assignments')
          .select('id, class_id, title')
          .in('class_id', classIds)
      : { data: [] as Array<{ id: string; class_id: string; title: string }> };

    const normalizedAssignments = assignmentsData ?? [];
    const assignmentIds = normalizedAssignments.map((a) => a.id);
    const assignmentById = new Map(normalizedAssignments.map((a) => [a.id, a]));

    const { data: submissionsData = [] } = assignmentIds.length
      ? await supabase
          .from('assignment_submissions')
          .select('id, assignment_id, student_user_id, status, created_at')
          .in('assignment_id', assignmentIds)
          .in('status', ['submitted', 'late'])
          .order('created_at', { ascending: false })
          .limit(20)
      : { data: [] as Array<{ id: string; assignment_id: string; student_user_id: string; status: string; created_at: string }> };

    const normalizedSubmissions = submissionsData ?? [];

    // Get student names for submissions
    const studentIdsForGrading = [...new Set(normalizedSubmissions.map((s) => s.student_user_id))];
    const { data: studentProfilesData = [] } = studentIdsForGrading.length
      ? await supabase.from('profiles').select('id, full_name').in('id', studentIdsForGrading)
      : { data: [] as Array<{ id: string; full_name: string | null }> };

    const studentNameById = new Map((studentProfilesData ?? []).map((p) => [p.id, p.full_name ?? 'Student']));

    const gradingQueue = normalizedSubmissions.map((s) => {
      const assignment = assignmentById.get(s.assignment_id);
      return {
        id: s.id,
        studentName: studentNameById.get(s.student_user_id) ?? 'Student',
        assignmentTitle: assignment?.title ?? 'Untitled',
        submittedAt: s.created_at,
        status: s.status,
      };
    });

    return {
      tutorName,
      timezone,
      classes,
      todayLessons,
      gradingQueue,
      totalStudents: uniqueStudentIds.size,
      totalAssignments: normalizedAssignments.length,
      pendingGrading: normalizedSubmissions.length,
    };
  } catch {
    return fallback;
  }
}

/* ─────────────────────────────────────────────
   Parent Dashboard — Direct Supabase
   ───────────────────────────────────────────── */

export type ParentChild = {
  userId: string;
  fullName: string | null;
  relationship: string;
  gradeLevelCode: string;
  gradeLevelName: string;
  gradeBandCode: string;
  gradeBandName: string;
  schoolName: string | null;
};

export type ParentDashboardData = {
  parentName: string;
  children: ParentChild[];
};

export async function getParentDashboardData(): Promise<ParentDashboardData> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;
  const fallback: ParentDashboardData = {
    parentName: session?.user?.user_metadata?.full_name as string ?? 'Parent',
    children: [],
  };

  if (!userId) return fallback;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    const parentName = profile?.full_name ?? fallback.parentName;

    const { data: linksData = [] } = await supabase
      .from('parent_child_links')
      .select('child_user_id, relationship')
      .eq('parent_user_id', userId);

    const normalizedLinks = linksData ?? [];

    if (normalizedLinks.length === 0) {
      return { parentName, children: [] };
    }

    const childIds = normalizedLinks.map((l) => l.child_user_id);

    const [{ data: childProfilesData = [] }, { data: studentProfilesData = [] }] = await Promise.all([
      supabase.from('profiles').select('id, full_name').in('id', childIds),
      supabase.from('student_profiles').select('user_id, grade_level_id, learner_band_id, school_name').in('user_id', childIds),
    ]);

    const normalizedChildProfiles = childProfilesData ?? [];
    const normalizedStudentProfiles = studentProfilesData ?? [];

    const childProfileById = new Map(normalizedChildProfiles.map((p) => [p.id, p]));
    const studentProfileByUserId = new Map(normalizedStudentProfiles.map((p) => [p.user_id, p]));

    const gradeLevelIds = [...new Set(normalizedStudentProfiles.map((p) => p.grade_level_id).filter(Boolean))];
    const bandIds = [...new Set(normalizedStudentProfiles.map((p) => p.learner_band_id).filter(Boolean))];

    const [{ data: gradeLevelsData = [] }, { data: bandsData = [] }] = await Promise.all([
      gradeLevelIds.length
        ? supabase.from('grade_levels').select('id, code, display_name').in('id', gradeLevelIds)
        : Promise.resolve({ data: [] as Array<{ id: string; code: string; display_name: string }> }),
      bandIds.length
        ? supabase.from('grade_bands').select('id, code, name').in('id', bandIds)
        : Promise.resolve({ data: [] as Array<{ id: string; code: string; name: string }> }),
    ]);

    const gradeLevelById = new Map((gradeLevelsData ?? []).map((g) => [g.id, g]));
    const bandById = new Map((bandsData ?? []).map((b) => [b.id, b]));

    const relationshipByChildId = new Map(normalizedLinks.map((l) => [l.child_user_id, l.relationship]));

    const children: ParentChild[] = childIds.map((childId) => {
      const childProfile = childProfileById.get(childId);
      const studentProfile = studentProfileByUserId.get(childId);
      const gradeLevel = studentProfile ? gradeLevelById.get(studentProfile.grade_level_id) : null;
      const band = studentProfile ? bandById.get(studentProfile.learner_band_id) : null;

      return {
        userId: childId,
        fullName: childProfile?.full_name ?? null,
        relationship: relationshipByChildId.get(childId) ?? 'child',
        gradeLevelCode: gradeLevel?.code ?? 'pending',
        gradeLevelName: gradeLevel?.display_name ?? 'Grade pending',
        gradeBandCode: band?.code ?? 'grades_7_12',
        gradeBandName: band?.name ?? 'Pending',
        schoolName: studentProfile?.school_name ?? null,
      };
    });

    return { parentName, children };
  } catch {
    return fallback;
  }
}

/* ─────────────────────────────────────────────
   Admin Dashboard — Direct Supabase
   ───────────────────────────────────────────── */

export type AdminDashboardData = {
  totalStudents: number;
  totalTutors: number;
  totalParents: number;
  totalClasses: number;
  pendingTutorApprovals: number;
  activeSubscriptions: number;
  healthPanel: {
    openRouterKeysConfigured: number;
    geminiKeysConfigured: number;
    aiDraftQueue: number;
    aiFailedGenerations24h: number;
    chatMessages24h: number;
    chatSilentChannels: number;
  };
  recentSignups: Array<{
    id: string;
    fullName: string | null;
    email: string;
    role: string;
    createdAt: string;
  }>;
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = await createClient();

  const fallback: AdminDashboardData = {
    totalStudents: 0,
    totalTutors: 0,
    totalParents: 0,
    totalClasses: 0,
    pendingTutorApprovals: 0,
    activeSubscriptions: 0,
    healthPanel: {
      openRouterKeysConfigured: 0,
      geminiKeysConfigured: 0,
      aiDraftQueue: 0,
      aiFailedGenerations24h: 0,
      chatMessages24h: 0,
      chatSilentChannels: 0,
    },
    recentSignups: [],
  };

  try {
    const [
      { count: studentCount },
      { count: tutorCount },
      { count: parentCount },
      { count: classCount },
      { count: pendingTutorCount },
    ] = await Promise.all([
      supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'tutor'),
      supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'parent'),
      supabase.from('classes').select('*', { count: 'exact', head: true }),
      supabase.from('tutor_profiles').select('*', { count: 'exact', head: true }).eq('approval_status', 'pending'),
    ]);

    // Recent signups
    const { data: recentProfilesData = [] } = await supabase
      .from('profiles')
      .select('id, full_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(8);

    const normalizedProfiles = recentProfilesData ?? [];
    const profileIds = normalizedProfiles.map((p) => p.id);

    const { data: rolesData = [] } = profileIds.length
      ? await supabase.from('user_roles').select('user_id, role').in('user_id', profileIds)
      : { data: [] as Array<{ user_id: string; role: string }> };

    const roleByUserId = new Map((rolesData ?? []).map((r) => [r.user_id, r.role]));
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const knownChatChannels = ['tutor-parent', 'tutor-student-7-12', 'parent-student-7-12'];
    const openRouterKeysConfigured = Object.entries(process.env).filter(
      ([name, value]) =>
        (/^OPENROUTER_KEY_\d+$/.test(name) || name === 'OPENROUTER_API_KEY') &&
        typeof value === 'string' &&
        value.trim().length > 0,
    ).length;
    const geminiKeysConfigured = Object.entries(process.env).filter(
      ([name, value]) =>
        (/^GEMINI_API_KEY(_\d+)?$/.test(name)) &&
        typeof value === 'string' &&
        value.trim().length > 0,
    ).length;

    const [
      { count: aiDraftQueueCount },
      { count: aiFailedGenerations24hCount },
      { count: chatMessages24hCount },
      { data: activeChatChannelsData = [] },
    ] = await Promise.all([
      supabase.from('ai_generated_content').select('*', { count: 'exact', head: true }).in('status', ['draft', 'DRAFT']),
      supabase
        .from('learning_activity_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'ai_generation_failed')
        .gte('created_at', since24h),
      supabase
        .from('dashboard_chat_messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since24h),
      supabase
        .from('dashboard_chat_messages')
        .select('channel_id')
        .gte('created_at', since24h),
    ]);

    const activeChannels24h = new Set((activeChatChannelsData ?? []).map((entry) => entry.channel_id));
    const chatSilentChannels = knownChatChannels.filter((channelId) => !activeChannels24h.has(channelId)).length;

    const recentSignups = normalizedProfiles.map((p) => ({
      id: p.id,
      fullName: p.full_name,
      email: p.email,
      role: roleByUserId.get(p.id) ?? 'student',
      createdAt: p.created_at,
    }));

    return {
      totalStudents: studentCount ?? 0,
      totalTutors: tutorCount ?? 0,
      totalParents: parentCount ?? 0,
      totalClasses: classCount ?? 0,
      pendingTutorApprovals: pendingTutorCount ?? 0,
      activeSubscriptions: 0,
      healthPanel: {
        openRouterKeysConfigured,
        geminiKeysConfigured,
        aiDraftQueue: aiDraftQueueCount ?? 0,
        aiFailedGenerations24h: aiFailedGenerations24hCount ?? 0,
        chatMessages24h: chatMessages24hCount ?? 0,
        chatSilentChannels,
      },
      recentSignups,
    };
  } catch {
    return fallback;
  }
}
