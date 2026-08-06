'use client';

import { useEffect, useMemo, useState } from 'react';

import type { CurrentUser } from '@edvoura/contracts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { saveTutorProfileAction, saveStudentProfileAction, saveGeneralProfileAction } from '@/app/dash/profile/actions';
import { createClient } from '@/utils/supabase/client';

type TutorProfileContext = {
  phoneNumber: string;
  timezone: string;
  headline: string;
  bio: string;
  expertiseSummary: string;
  availabilityNotes: string;
  tutorType?: string;
  tutorGrade?: string;
  tutorSubjects?: string;
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

  const [basicForm, setBasicForm] = useState(() => ({
    fullName: props.viewer.profile.fullName ?? '',
    dateOfBirth: props.viewer.profile.dateOfBirth ?? '',
  }));

  const [tutorForm, setTutorForm] = useState<TutorProfileContext>(() => ({
    phoneNumber: props.tutorProfile?.phoneNumber ?? '',
    timezone: props.tutorProfile?.timezone ?? 'Africa/Lagos',
    headline: props.tutorProfile?.headline ?? '',
    bio: props.tutorProfile?.bio ?? '',
    expertiseSummary: props.tutorProfile?.expertiseSummary ?? '',
    availabilityNotes: props.tutorProfile?.availabilityNotes ?? '',
    tutorType: props.tutorProfile?.tutorType ?? 'class_teacher',
    tutorGrade: props.tutorProfile?.tutorGrade ?? 'grade_1',
    tutorSubjects: props.tutorProfile?.tutorSubjects ?? 'Mathematics',
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
    await saveTutorProfileAction({
      fullName: basicForm.fullName.trim(),
      dateOfBirth: basicForm.dateOfBirth.trim() || undefined,
      phoneNumber: tutorForm.phoneNumber.trim() || undefined,
      headline: tutorForm.headline.trim() || undefined,
      bio: tutorForm.bio.trim() || undefined,
      expertiseSummary: tutorForm.expertiseSummary.trim() || undefined,
      availabilityNotes: tutorForm.availabilityNotes.trim() || undefined,
      timezone: tutorForm.timezone.trim() || 'Africa/Lagos',
      tutorType: tutorForm.tutorType || 'class_teacher',
      tutorGrade: tutorForm.tutorGrade || 'grade_1',
      tutorSubjects: tutorForm.tutorSubjects || 'Mathematics',
    });
  };

  const saveStudentProfile = async () => {
    await saveStudentProfileAction({
      fullName: basicForm.fullName.trim(),
      dateOfBirth: basicForm.dateOfBirth.trim() || undefined,
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
      } else {
        await saveGeneralProfileAction({
          fullName: basicForm.fullName.trim(),
          dateOfBirth: basicForm.dateOfBirth.trim() || undefined,
        });
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
    <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] overflow-hidden min-w-0">
      <div className="p-5 sm:p-6 border-b-[3px] border-dark bg-yellow/20 min-w-0">
        <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight break-words">Tutor Teaching Profile</h2>
      </div>
      <div className="p-5 sm:p-8 space-y-4 sm:space-y-6 min-w-0">
        {/* Teaching Assignment Authorization Controls */}
        <div className="p-4 sm:p-5 rounded-2xl border-[3px] border-dark bg-yellow/10 space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-black text-dark tracking-tight">Teaching Assignment & Curriculum Access Role</h3>
            <p className="text-xs font-semibold text-dark/70">Controls your lesson notes hub and subject authorization in the tutor dashboard.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'class_teacher', label: 'Class Teacher', desc: 'Grade Level Only' },
              { id: 'subject_teacher', label: 'Subject Teacher', desc: 'Specific Subject Notes' },
              { id: 'both', label: 'Class & Subject Teacher', desc: 'Both Access Rights' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTutorForm((prev) => ({ ...prev, tutorType: item.id }))}
                className={`p-3 rounded-xl border-[3px] border-dark text-left transition-all ${
                  tutorForm.tutorType === item.id
                    ? 'bg-yellow text-dark font-black shadow-[3px_3px_0px_#060E1C]'
                    : 'bg-white text-dark hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-black uppercase">{item.label}</div>
                <div className="text-[10px] font-bold text-dark/70">{item.desc}</div>
              </button>
            ))}
          </div>

          {(tutorForm.tutorType === 'class_teacher' || tutorForm.tutorType === 'both') && (
            <label className="block space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-dark/70">Assigned Class Grade Level</span>
              <select
                value={tutorForm.tutorGrade}
                onChange={(e) => setTutorForm((prev) => ({ ...prev, tutorGrade: e.target.value }))}
                className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
              >
                <option value="grade_1">Primary 1 (Grade 1)</option>
                <option value="grade_2">Primary 2 (Grade 2)</option>
                <option value="grade_3">Primary 3 (Grade 3)</option>
                <option value="grade_4">Primary 4 (Grade 4)</option>
                <option value="grade_5">Primary 5 (Grade 5)</option>
                <option value="grade_6">Primary 6 (Grade 6)</option>
                <option value="grade_7">JSS 1 (Grade 7)</option>
                <option value="grade_8">JSS 2 (Grade 8)</option>
                <option value="grade_9">JSS 3 (Grade 9)</option>
                <option value="grade_10">SS 1 (Grade 10)</option>
                <option value="grade_11">SS 2 (Grade 11)</option>
                <option value="grade_12">SS 3 (Grade 12)</option>
              </select>
            </label>
          )}

          {(tutorForm.tutorType === 'subject_teacher' || tutorForm.tutorType === 'both') && (
            <label className="block space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-dark/70">Assigned Subject(s)</span>
              <input
                value={tutorForm.tutorSubjects}
                onChange={(e) => setTutorForm((prev) => ({ ...prev, tutorSubjects: e.target.value }))}
                placeholder="e.g. Mathematics, Physics, Chemistry, English"
                className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
              />
              <p className="text-[10px] font-bold text-dark/60">Separate multiple subjects with commas (e.g. Physics, Chemistry, Further Mathematics)</p>
            </label>
          )}
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 min-w-0">
          <label className="block space-y-2 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-dark/70 break-words">Phone Number</span>
            <input
              value={tutorForm.phoneNumber}
              onChange={(event) => setTutorForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
              className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none focus:border-yellow"
            />
          </label>
          <label className="block space-y-2 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-dark/70 break-words">Timezone</span>
            <select
              value={tutorForm.timezone}
              onChange={(event) => setTutorForm((prev) => ({ ...prev, timezone: event.target.value }))}
              className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
            >
              {timezoneOptions.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-dark/70">Teaching Headline</span>
          <input
            value={tutorForm.headline}
            onChange={(event) => setTutorForm((prev) => ({ ...prev, headline: event.target.value }))}
            className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-dark/70">Bio</span>
          <textarea
            rows={4}
            value={tutorForm.bio}
            onChange={(event) => setTutorForm((prev) => ({ ...prev, bio: event.target.value }))}
            className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-dark/70">Expertise Summary</span>
          <textarea
            rows={3}
            value={tutorForm.expertiseSummary}
            onChange={(event) => setTutorForm((prev) => ({ ...prev, expertiseSummary: event.target.value }))}
            className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-dark/70">Availability Notes</span>
          <textarea
            rows={3}
            value={tutorForm.availabilityNotes}
            onChange={(event) => setTutorForm((prev) => ({ ...prev, availabilityNotes: event.target.value }))}
            className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
          />
        </label>
      </div>
    </div>
  );

  const renderTutorClasses = () => (
    <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] overflow-hidden min-w-0">
      <div className="p-5 sm:p-6 border-b-[3px] border-dark bg-blue-100 min-w-0">
        <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight break-words">Classes You Are Taking</h2>
      </div>
      <div className="p-5 sm:p-8 min-w-0">
        {props.tutorClasses.length > 0 ? (
          <div className="space-y-4 min-w-0">
            {props.tutorClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="rounded-[20px] sm:rounded-2xl border-[3px] border-dark bg-off-white p-4 shadow-[4px_4px_0px_#060E1C] min-w-0"
              >
                <p className="font-black text-base sm:text-lg text-dark break-words">{classItem.title}</p>
                <p className="text-[10px] sm:text-xs font-bold text-dark/70 mt-1 uppercase tracking-widest break-words">
                  {classItem.subjectName} | Status: <span className="text-emerald-600">{classItem.status}</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[20px] sm:rounded-2xl border-[2px] sm:border-[3px] border-dashed border-dark/20 bg-slate-50 p-4 sm:p-6 text-center text-xs sm:text-sm font-semibold text-dark/60 min-w-0 break-words">
            No classes are currently assigned to you yet. Once assigned, they will appear here.
          </div>
        )}
      </div>
    </div>
  );

  const renderStudentSection = () => (
    <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] overflow-hidden min-w-0">
      <div className="p-5 sm:p-6 border-b-[3px] border-dark bg-yellow/20 min-w-0">
        <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight break-words">Student Learning Profile</h2>
      </div>
      <div className="p-5 sm:p-8 space-y-4 sm:space-y-6 min-w-0">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 min-w-0">
          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-dark/70">Grade Level Code</span>
            <input
              value={studentForm.gradeLevelCode}
              onChange={(event) => setStudentForm((prev) => ({ ...prev, gradeLevelCode: event.target.value }))}
              className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-dark/70">Timezone</span>
            <select
              value={studentForm.timezone}
              onChange={(event) => setStudentForm((prev) => ({ ...prev, timezone: event.target.value }))}
              className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
            >
              {timezoneOptions.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-dark/70">School Name</span>
          <input
            value={studentForm.schoolName}
            onChange={(event) => setStudentForm((prev) => ({ ...prev, schoolName: event.target.value }))}
            className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-dark/70">Academic Goals</span>
          <textarea
            rows={3}
            value={studentForm.academicGoalNotes}
            onChange={(event) => setStudentForm((prev) => ({ ...prev, academicGoalNotes: event.target.value }))}
            className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
          />
        </label>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-dark/70">Target Study Hours / Week</span>
            <input
              value={studentExtras.weeklyStudyHoursTarget}
              onChange={(event) =>
                setStudentExtras((prev) => ({ ...prev, weeklyStudyHoursTarget: event.target.value }))
              }
              className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-dark/70">Preferred Study Window</span>
            <select
              value={studentExtras.preferredStudyWindow}
              onChange={(event) =>
                setStudentExtras((prev) => ({ ...prev, preferredStudyWindow: event.target.value }))
              }
              className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
            >
              <option value="">Select preferred window</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-dark/70">Parent Contact Preference</span>
            <select
              value={studentExtras.parentContactPreference}
              onChange={(event) =>
                setStudentExtras((prev) => ({ ...prev, parentContactPreference: event.target.value }))
              }
              className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
            >
              <option value="">Select contact mode</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-dark/70">Wellbeing Notes</span>
            <textarea
              rows={2}
              value={studentExtras.wellbeingNotes}
              onChange={(event) => setStudentExtras((prev) => ({ ...prev, wellbeingNotes: event.target.value }))}
              className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderStudentSnapshot = () =>
    props.studentSummary ? (
      <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-5 sm:p-6 border-b-[3px] border-dark bg-emerald-100 min-w-0">
          <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight break-words">Learning Snapshot</h2>
        </div>
        <div className="p-5 sm:p-8 min-w-0">
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4 min-w-0">
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
              <p className="text-[10px] font-black uppercase tracking-widest text-dark/60">Active Classes</p>
              <p className="mt-2 text-3xl font-black text-dark">{props.studentSummary.activeClasses}</p>
            </div>
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
              <p className="text-[10px] font-black uppercase tracking-widest text-dark/60">Pending Work</p>
              <p className="mt-2 text-3xl font-black text-dark">{props.studentSummary.pendingAssignments}</p>
            </div>
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
              <p className="text-[10px] font-black uppercase tracking-widest text-dark/60">Completed Work</p>
              <p className="mt-2 text-3xl font-black text-dark">{props.studentSummary.completedAssignments}</p>
            </div>
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
              <p className="text-[10px] font-black uppercase tracking-widest text-dark/60">Upcoming Lessons</p>
              <p className="mt-2 text-3xl font-black text-dark">{props.studentSummary.upcomingLessons}</p>
            </div>
          </div>
        </div>
      </div>
    ) : null;

  const displayAvatar = avatarPreview ?? avatarPersistedUrl;

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-6 sm:space-y-10 p-6 sm:p-8 pb-24">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark mb-4 sm:mb-8 break-words">
        Profile Settings
      </h1>

      <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-5 sm:p-6 border-b-[3px] border-dark bg-amber-100 min-w-0">
          <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight break-words">Account Basics</h2>
        </div>
        <div className="p-5 sm:p-8 space-y-4 sm:space-y-6 min-w-0">
          <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between min-w-0">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-dark/60 mb-1">Email Address</p>
              <p className="text-lg font-black text-dark tracking-tight">{props.viewer.email}</p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-dark bg-yellow w-fit px-3 py-1 rounded-md border-[2px] border-dark shadow-[2px_2px_0px_#060E1C]">
                Role: {role}
              </p>
            </div>
            <div className="flex flex-row sm:items-center gap-4 w-full sm:w-auto">
              <div className="shrink-0 h-20 w-20 overflow-hidden rounded-2xl border-[3px] border-dark bg-off-white shadow-[3px_3px_0px_#060E1C]">
                {displayAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={displayAvatar} alt="Avatar preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-black uppercase tracking-widest text-dark/40 text-center leading-tight">No<br/>image</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-4 py-3 sm:px-5 sm:py-3 text-[10px] sm:text-xs font-black text-dark hover:bg-slate-50 transition-all shadow-[2px_2px_0px_#060E1C] sm:shadow-[3px_3px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 text-center break-words w-full h-full">
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
          </div>
          
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 min-w-0 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-[3px] border-dark/10">
            <label className="block space-y-2 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-dark/70 break-words">Full Name</span>
              <input
                value={basicForm.fullName}
                onChange={(e) => setBasicForm(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
              />
            </label>
            <label className="block space-y-2 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-dark/70 break-words">Date of Birth</span>
              <input
                type="date"
                value={basicForm.dateOfBirth}
                onChange={(e) => setBasicForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
              />
            </label>
          </div>

          {avatarPath ? <p className="text-xs font-bold text-dark/50 mt-4">Saved avatar path: {avatarPath}</p> : null}
        </div>
      </div>

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

      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-6 border-t-[3px] border-dark/10 min-w-0">
        <Button className="w-full sm:w-auto bg-emerald-400 border-[2px] sm:border-[3px] border-dark !text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 sm:px-8 py-3 sm:py-4 h-auto text-sm sm:text-base break-words" disabled={isSaving} onClick={handleSave}>
          {isSaving ? 'Saving...' : 'Save Profile Settings'}
        </Button>
        <Button className="w-full sm:w-auto bg-white border-[2px] sm:border-[3px] border-dark !text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 sm:px-8 py-3 sm:py-4 h-auto text-sm sm:text-base break-words" onClick={() => alert('Use your account auth page to change password.')}>
          Change Password
        </Button>
      </div>
      {statusMessage ? <div className="rounded-[20px] sm:rounded-xl border-[3px] border-dark bg-blue-100 p-4 text-xs sm:text-sm font-black !text-dark shadow-[4px_4px_0px_#060E1C] mt-4 break-words">{statusMessage}</div> : null}
    </div>
  );
}
