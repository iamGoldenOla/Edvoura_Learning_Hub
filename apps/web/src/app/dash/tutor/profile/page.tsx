import { redirect } from 'next/navigation';

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

export default async function TutorProfileDashboard() {
  const viewer = await requireAppViewer();
  if (!viewer) return null;

  if (!viewer.currentUser.roles.includes('tutor')) {
    redirect('/dash');
  }

  const supabase = await createClient();

  const [{ data: tp }, { data: profile }, { data: classesData }] = await Promise.all([
    supabase
      .from('tutor_profiles')
      .select('headline, bio, expertise_summary, availability_notes')
      .eq('user_id', viewer.currentUser.userId)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('full_name, phone_number, timezone')
      .eq('id', viewer.currentUser.userId)
      .single(),
    supabase
      .from('classes')
      .select('id, title, subject_id, status')
      .eq('primary_tutor_user_id', viewer.currentUser.userId),
  ]);

  const normalizedClasses = classesData ?? [];
  const subjectIds = [...new Set(normalizedClasses.map((entry) => entry.subject_id).filter(Boolean))];

  const { data: subjectsData } = subjectIds.length
    ? await supabase.from('subjects').select('id, name').in('id', subjectIds)
    : { data: [] as Array<{ id: string; name: string }> };

  const subjectById = new Map((subjectsData ?? []).map((entry) => [entry.id, entry.name]));
  const tutorClasses: ClassRow[] = normalizedClasses.map((entry) => ({
    id: entry.id,
    title: entry.title,
    subjectName: subjectById.get(entry.subject_id) ?? 'General',
    status: entry.status ?? 'active',
  }));

  const tutorProfile: TutorProfileResponse | null = tp
    ? {
        fullName: profile?.full_name ?? null,
        phoneNumber: profile?.phone_number ?? null,
        timezone: profile?.timezone ?? 'Africa/Lagos',
        headline: tp.headline,
        bio: tp.bio,
        expertiseSummary: tp.expertise_summary,
        availabilityNotes: tp.availability_notes,
      }
    : {
        fullName: profile?.full_name ?? viewer.currentUser.profile.fullName ?? '',
        phoneNumber: profile?.phone_number ?? '',
        timezone: profile?.timezone ?? 'Africa/Lagos',
        headline: '',
        bio: '',
        expertiseSummary: '',
        availabilityNotes: '',
      };

  return (
    <ProfileSettingsClient
      viewer={viewer.currentUser}
      tutorProfile={{
        phoneNumber: tutorProfile.phoneNumber ?? '',
        timezone: tutorProfile.timezone,
        headline: tutorProfile.headline ?? '',
        bio: tutorProfile.bio ?? '',
        expertiseSummary: tutorProfile.expertiseSummary ?? '',
        availabilityNotes: tutorProfile.availabilityNotes ?? '',
      }}
      tutorClasses={tutorClasses}
      studentProfile={null}
      studentSummary={null}
    />
  );
}
