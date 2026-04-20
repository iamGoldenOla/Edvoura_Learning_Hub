import type { CurrentUser, GradeBandCode } from '@edvoura/contracts';
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
    const roleFromMetadata =
      typeof session.user.user_metadata?.role === 'string' ? session.user.user_metadata.role : null;

    const fallbackRole =
      roleFromMetadata === 'student' ||
      roleFromMetadata === 'parent' ||
      roleFromMetadata === 'tutor' ||
      roleFromMetadata === 'admin' ||
      roleFromMetadata === 'super_admin'
        ? roleFromMetadata
        : 'student';

    return {
      accessToken: session.access_token,
      currentUser: {
        userId: session.user.id,
        email: session.user.email ?? 'unknown@local.test',
        roles: [fallbackRole],
        primaryRole: fallbackRole,
        profile: {
          id: session.user.id,
          email: session.user.email ?? 'unknown@local.test',
          fullName:
            typeof session.user.user_metadata?.full_name === 'string'
              ? session.user.user_metadata.full_name
              : null,
          avatarPath: null,
        },
        learnerProfile: null,
      },
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
  return apiClient.get<StudentDashboardData>('/academics/student/dashboard', {
    token: accessToken,
    cache: 'no-store',
  });
}

export async function getBillingSummary(accessToken: string) {
  return apiClient.get<BillingSummary>('/billing/me/summary', {
    token: accessToken,
    cache: 'no-store',
  });
}
