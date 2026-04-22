import type { AppRole, CurrentUser, GradeBandCode } from '@edvoura/contracts';
import { redirect } from 'next/navigation';

import { apiClient } from '@/lib/api-client';
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
    gradeLevelCode: string;
    gradeLevelName: string;
    gradeBandCode: GradeBandCode;
    gradeBandName: string;
    schoolName: string | null;
    academicGoalNotes: string | null;
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
};

type SessionUserLike = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const validRoles: AppRole[] = ['student', 'parent', 'tutor', 'admin', 'super_admin'];

const buildFallbackStudentDashboard = (
  sessionUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null,
): StudentDashboardData => {
  const fullName =
    typeof sessionUser?.user_metadata?.full_name === 'string' ? sessionUser.user_metadata.full_name : null;
  const email = sessionUser?.email ?? 'student@edvouralearninghub.com';

  return {
    profile: {
      userId: sessionUser?.id ?? 'local-student',
      fullName,
      email,
      avatarPath: null,
      gradeLevelCode: 'grade_7',
      gradeLevelName: 'Grade level pending',
      gradeBandCode: 'grades_7_12',
      gradeBandName: 'Senior Years',
      schoolName: null,
      academicGoalNotes: null,
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
    supabase.from('profiles').select('id, email, full_name, avatar_path').eq('id', sessionUser.id).single(),
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
    supabase.from('profiles').select('id, email, full_name, avatar_path').eq('id', sessionUser.id).single(),
    supabase
      .from('student_profiles')
      .select('grade_level_id, learner_band_id, school_name, academic_goal_notes')
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
        .select('id, class_id, title, due_at')
        .in('class_id', classIds)
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
    : { data: [] as Array<{ id: string; class_id: string; title: string; due_at: string | null }> };

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

  const { data: progressData = [] } = await supabase
    .from('progress_snapshots')
    .select('id, subject_id, snapshot_date, average_score, attendance_rate, assignment_completion_rate, mastery_notes')
    .eq('student_user_id', sessionUser.id)
    .order('snapshot_date', { ascending: false })
    .limit(6);

  const normalizedGrades = gradesData ?? [];
  const normalizedLessons = lessonsData ?? [];
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
      gradeLevelCode: gradeLevel?.code ?? 'grade_7',
      gradeLevelName: gradeLevel?.display_name ?? 'Grade level pending',
      gradeBandCode: (gradeBand?.code as GradeBandCode | undefined) ?? 'grades_7_12',
      gradeBandName: gradeBand?.name ?? 'Senior Years',
      schoolName: studentProfile.school_name,
      academicGoalNotes: studentProfile.academic_goal_notes,
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

      return {
        id: lesson.id,
        title: lesson.title,
        subjectName: relatedClass ? subjectById.get(relatedClass.subject_id) ?? 'General Studies' : 'General Studies',
        classTitle: relatedClass?.title ?? 'Untitled class',
        scheduledStartAt: lesson.scheduled_start_at,
        scheduledEndAt: lesson.scheduled_end_at,
        joinUrl: null,
        provider: lesson.provider,
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
    const currentUser = await apiClient.get<CurrentUser>('/auth/me', {
      token: session.access_token,
      cache: 'no-store',
    });

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
  try {
    return await apiClient.get<StudentDashboardData>('/academics/student/dashboard', {
      token: accessToken,
      cache: 'no-store',
    });
  } catch {
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
}

export async function getBillingSummary(accessToken: string) {
  try {
    return await apiClient.get<BillingSummary>('/billing/me/summary', {
      token: accessToken,
      cache: 'no-store',
    });
  } catch {
    return buildFallbackBillingSummary();
  }
}
