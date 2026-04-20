import ProfileSettingsClient from '@/components/dashboards/ProfileSettingsClient';
import { apiClient } from '@/lib/api-client';
import { requireAppViewer } from '@/lib/app-context';

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

  let tutorProfile: TutorProfileResponse | null = null;
  let tutorClasses: ClassRow[] = [];
  let studentProfile: StudentProfileResponse | null = null;
  let studentSummary: StudentDashboardResponse['stats'] | null = null;

  if (viewer.currentUser.primaryRole === 'tutor') {
    tutorProfile = await apiClient
      .get<TutorProfileResponse>('/tutors/me', { token: viewer.accessToken, cache: 'no-store' })
      .catch(() => null);

    tutorClasses = await apiClient
      .get<ClassRow[]>('/academics/classes', {
        token: viewer.accessToken,
        cache: 'no-store',
        params: { role: 'tutor' },
      })
      .catch(() => []);
  }

  if (viewer.currentUser.primaryRole === 'student') {
    studentProfile = await apiClient
      .get<StudentProfileResponse>('/students/me', { token: viewer.accessToken, cache: 'no-store' })
      .catch(() => null);

    studentSummary = await apiClient
      .get<StudentDashboardResponse>('/academics/student/dashboard', {
        token: viewer.accessToken,
        cache: 'no-store',
      })
      .then((dashboard) => dashboard.stats)
      .catch(() => null);
  }

  return (
    <ProfileSettingsClient
      viewer={viewer.currentUser}
      tutorProfile={
        tutorProfile
          ? {
              fullName: tutorProfile.fullName ?? viewer.currentUser.profile.fullName ?? '',
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
