'use client';

import { useEffect, useMemo, useState } from 'react';

import type { CurrentUser } from '@edvoura/contracts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { createClient } from '@/utils/supabase/client';

type TutorProfileContext = {
  fullName: string;
  phoneNumber: string;
  timezone: string;
  headline: string;
  bio: string;
  expertiseSummary: string;
  availabilityNotes: string;
};

type StudentProfileContext = {
  gradeLevelCode: string;
  schoolName: string;
  academicGoalNotes: string;
  timezone: string;
};

type StudentSummary = {
  activeClasses: number;
  pendingAssignments: number;
  completedAssignments: number;
  upcomingLessons: number;
};

type ProfileSettingsClientProps = {
  viewer: CurrentUser;
  tutorProfile: TutorProfileContext | null;
  tutorClasses: Array<{ id: string; title: string; subjectName: string; status: string }>;
  studentProfile: StudentProfileContext | null;
  studentSummary: StudentSummary | null;
};

type StudentExtras = {
  weeklyStudyHoursTarget: string;
  preferredStudyWindow: string;
  parentContactPreference: string;
  wellbeingNotes: string;
};

const emptyStudentExtras: StudentExtras = {
  weeklyStudyHoursTarget: '',
  preferredStudyWindow: '',
  parentContactPreference: '',
  wellbeingNotes: '',
};

const timezoneOptions = [
  'Africa/Lagos',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Toronto',
  'America/Chicago',
  'America/Los_Angeles',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Australia/Sydney',
  'UTC',
];

export default function ProfileSettingsClient(props: ProfileSettingsClientProps) {
  const role = props.viewer.primaryRole;
  const supabase = useMemo(() => createClient(), []);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(props.viewer.profile.avatarPath ?? null);
  const [avatarPersistedUrl, setAvatarPersistedUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const [tutorForm, setTutorForm] = useState<TutorProfileContext>(() => ({
    fullName: props.tutorProfile?.fullName ?? props.viewer.profile.fullName ?? '',
    phoneNumber: props.tutorProfile?.phoneNumber ?? '',
    timezone: props.tutorProfile?.timezone ?? 'Africa/Lagos',
    headline: props.tutorProfile?.headline ?? '',
    bio: props.tutorProfile?.bio ?? '',
    expertiseSummary: props.tutorProfile?.expertiseSummary ?? '',
    availabilityNotes: props.tutorProfile?.availabilityNotes ?? '',
  }));

  const [studentForm, setStudentForm] = useState<StudentProfileContext>(() => ({
    gradeLevelCode: props.studentProfile?.gradeLevelCode ?? 'grade_7',
    schoolName: props.studentProfile?.schoolName ?? '',
    academicGoalNotes: props.studentProfile?.academicGoalNotes ?? '',
    timezone: props.studentProfile?.timezone ?? 'Africa/Lagos',
  }));

  const [studentExtras, setStudentExtras] = useState<StudentExtras>(emptyStudentExtras);

  useEffect(() => {
    const stored = localStorage.getItem(`edvoura-student-extras-${props.viewer.userId}`);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as StudentExtras;
      setStudentExtras({
        weeklyStudyHoursTarget: parsed.weeklyStudyHoursTarget ?? '',
        preferredStudyWindow: parsed.preferredStudyWindow ?? '',
        parentContactPreference: parsed.parentContactPreference ?? '',
        wellbeingNotes: parsed.wellbeingNotes ?? '',
      });
    } catch {
      setStudentExtras(emptyStudentExtras);
    }
  }, [props.viewer.userId]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }

    const nextUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [avatarFile]);

  useEffect(() => {
    let cancelled = false;

    const resolvePersistedAvatar = async () => {
      if (!avatarPath) {
        setAvatarPersistedUrl(null);
        return;
      }

      const signed = await supabase.storage.from('avatars').createSignedUrl(avatarPath, 60 * 60 * 24 * 7);
      if (cancelled) return;

      if (!signed.error && signed.data?.signedUrl) {
        setAvatarPersistedUrl(signed.data.signedUrl);
        return;
      }

      const fallback = supabase.storage.from('avatars').getPublicUrl(avatarPath);
      setAvatarPersistedUrl(fallback.data.publicUrl || null);
    };

    resolvePersistedAvatar();
    return () => {
      cancelled = true;
    };
  }, [avatarPath, supabase]);

  const uploadAvatarIfNeeded = async () => {
    if (!avatarFile) {
      return avatarPath;
    }

    const extension = avatarFile.name.split('.').pop() ?? 'jpg';
    const objectPath = `${props.viewer.userId}/${Date.now()}-avatar.${extension}`;

    const upload = await supabase.storage
      .from('avatars')
      .upload(objectPath, avatarFile, { upsert: true, contentType: avatarFile.type || 'image/jpeg' });

    if (upload.error) {
      throw new Error(upload.error.message);
    }

    const updateProfile = await supabase
      .from('profiles')
      .update({ avatar_path: objectPath, updated_at: new Date().toISOString() })
      .eq('id', props.viewer.userId);

    if (updateProfile.error) {
      throw new Error(updateProfile.error.message);
    }

    setAvatarPath(objectPath);
    return objectPath;
  };

  const saveTutorProfile = async () => {
    await apiClient.patch<void>('/tutors/me/profile', {
      fullName: tutorForm.fullName.trim(),
      phoneNumber: tutorForm.phoneNumber.trim() || undefined,
      headline: tutorForm.headline.trim() || undefined,
      bio: tutorForm.bio.trim() || undefined,
      expertiseSummary: tutorForm.expertiseSummary.trim() || undefined,
      availabilityNotes: tutorForm.availabilityNotes.trim() || undefined,
      timezone: tutorForm.timezone.trim() || 'Africa/Lagos',
    });
  };

  const saveStudentProfile = async () => {
    await apiClient.patch<void>('/students/me/profile', {
      gradeLevelCode: studentForm.gradeLevelCode,
      schoolName: studentForm.schoolName.trim() || undefined,
      academicGoalNotes: studentForm.academicGoalNotes.trim() || undefined,
      timezone: studentForm.timezone.trim() || 'Africa/Lagos',
    });

    localStorage.setItem(`edvoura-student-extras-${props.viewer.userId}`, JSON.stringify(studentExtras));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage('');

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        throw new Error('Your session has expired. Sign in again and retry.');
      }

      await uploadAvatarIfNeeded();

      if (role === 'tutor') {
        await saveTutorProfile();
      } else if (role === 'student') {
        await saveStudentProfile();
      }

      setStatusMessage('Profile saved successfully.');
      setAvatarFile(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save profile right now.';
      setStatusMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderTutorSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>Tutor Teaching Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name</span>
          <input
            value={tutorForm.fullName}
            onChange={(event) => setTutorForm((prev) => ({ ...prev, fullName: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone Number</span>
            <input
              value={tutorForm.phoneNumber}
              onChange={(event) => setTutorForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Timezone</span>
            <select
              value={tutorForm.timezone}
              onChange={(event) => setTutorForm((prev) => ({ ...prev, timezone: event.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              {timezoneOptions.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Teaching Headline</span>
          <input
            value={tutorForm.headline}
            onChange={(event) => setTutorForm((prev) => ({ ...prev, headline: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bio</span>
          <textarea
            rows={4}
            value={tutorForm.bio}
            onChange={(event) => setTutorForm((prev) => ({ ...prev, bio: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Expertise Summary</span>
          <textarea
            rows={3}
            value={tutorForm.expertiseSummary}
            onChange={(event) => setTutorForm((prev) => ({ ...prev, expertiseSummary: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Availability Notes</span>
          <textarea
            rows={3}
            value={tutorForm.availabilityNotes}
            onChange={(event) => setTutorForm((prev) => ({ ...prev, availabilityNotes: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
        </label>
      </CardContent>
    </Card>
  );

  const renderTutorClasses = () => (
    <Card>
      <CardHeader>
        <CardTitle>Classes You Are Taking</CardTitle>
      </CardHeader>
      <CardContent>
        {props.tutorClasses.length > 0 ? (
          <div className="space-y-3">
            {props.tutorClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
              >
                <p className="font-semibold">{classItem.title}</p>
                <p className="text-xs text-slate-600">
                  {classItem.subjectName} | Status: {classItem.status}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            No classes are currently assigned to you yet. Once assigned, they will appear here.
          </p>
        )}
      </CardContent>
    </Card>
  );

  const renderStudentSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>Student Learning Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Grade Level Code</span>
            <input
              value={studentForm.gradeLevelCode}
              onChange={(event) => setStudentForm((prev) => ({ ...prev, gradeLevelCode: event.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Timezone</span>
            <select
              value={studentForm.timezone}
              onChange={(event) => setStudentForm((prev) => ({ ...prev, timezone: event.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              {timezoneOptions.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">School Name</span>
          <input
            value={studentForm.schoolName}
            onChange={(event) => setStudentForm((prev) => ({ ...prev, schoolName: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Academic Goals</span>
          <textarea
            rows={3}
            value={studentForm.academicGoalNotes}
            onChange={(event) => setStudentForm((prev) => ({ ...prev, academicGoalNotes: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Target Study Hours / Week</span>
            <input
              value={studentExtras.weeklyStudyHoursTarget}
              onChange={(event) =>
                setStudentExtras((prev) => ({ ...prev, weeklyStudyHoursTarget: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preferred Study Window</span>
            <select
              value={studentExtras.preferredStudyWindow}
              onChange={(event) =>
                setStudentExtras((prev) => ({ ...prev, preferredStudyWindow: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              <option value="">Select preferred window</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Parent Contact Preference</span>
            <select
              value={studentExtras.parentContactPreference}
              onChange={(event) =>
                setStudentExtras((prev) => ({ ...prev, parentContactPreference: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              <option value="">Select contact mode</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Wellbeing Notes</span>
            <textarea
              rows={2}
              value={studentExtras.wellbeingNotes}
              onChange={(event) => setStudentExtras((prev) => ({ ...prev, wellbeingNotes: event.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </label>
        </div>
      </CardContent>
    </Card>
  );

  const renderStudentSnapshot = () =>
    props.studentSummary ? (
      <Card>
        <CardHeader>
          <CardTitle>Learning Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Active Classes</p>
              <p className="text-xl font-bold text-slate-900">{props.studentSummary.activeClasses}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Pending Assignments</p>
              <p className="text-xl font-bold text-slate-900">{props.studentSummary.pendingAssignments}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Completed Work</p>
              <p className="text-xl font-bold text-slate-900">{props.studentSummary.completedAssignments}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Upcoming Lessons</p>
              <p className="text-xl font-bold text-slate-900">{props.studentSummary.upcomingLessons}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    ) : null;

  const displayAvatar = avatarPreview ?? avatarPersistedUrl;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-8">
      <h1 className="text-3xl font-bold text-edvoura-navy">Profile Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500">Email Address</p>
              <p className="text-base font-semibold text-slate-900">{props.viewer.email}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">Role: {role}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                {displayAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={displayAvatar} alt="Avatar preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">No image</div>
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                Upload Profile Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>
          {avatarPath ? <p className="text-xs text-slate-500">Saved avatar path: {avatarPath}</p> : null}
        </CardContent>
      </Card>

      {role === 'tutor' ? (
        <>
          {renderTutorSection()}
          {renderTutorClasses()}
        </>
      ) : null}

      {role === 'student' ? (
        <>
          {renderStudentSection()}
          {renderStudentSnapshot()}
        </>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" isLoading={isSaving} onClick={handleSave}>
          Save Profile Settings
        </Button>
        <Button variant="outline" onClick={() => alert('Use your account auth page to change password.')}>
          Change Password
        </Button>
        {statusMessage ? <p className="text-sm text-slate-700">{statusMessage}</p> : null}
      </div>
    </div>
  );
}
