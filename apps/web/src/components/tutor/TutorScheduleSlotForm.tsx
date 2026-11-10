'use client';

import React, { useState } from 'react';
import { UserPlus, Sparkles, Video, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import QuickAddPupilModal from './QuickAddPupilModal';

interface StudentOption {
  userId: string;
  name: string;
  gradeName: string;
  gradeLevelId?: string;
  personalMeetUrl?: string | null;
}

interface GradeLevelOption {
  id: string;
  display_name: string;
}

interface SubjectOption {
  id: string;
  name: string;
}

interface TutorScheduleSlotFormProps {
  subjects: SubjectOption[];
  gradeLevels: GradeLevelOption[];
  studentOptions: StudentOption[];
  action: (formData: FormData) => Promise<void>;
}

export default function TutorScheduleSlotForm({
  subjects,
  gradeLevels,
  studentOptions,
  action,
}: TutorScheduleSlotFormProps) {
  const [students, setStudents] = useState<StudentOption[]>(studentOptions);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedGradeLevelId, setSelectedGradeLevelId] = useState<string>(gradeLevels[0]?.id || '');
  const [title, setTitle] = useState<string>('');
  const [joinUrl, setJoinUrl] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [justAddedNotice, setJustAddedNotice] = useState<string | null>(null);

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentId = e.target.value;
    setSelectedStudentId(studentId);

    if (!studentId) {
      return;
    }

    const foundStudent = students.find((s) => s.userId === studentId);
    if (foundStudent) {
      // Auto-match Grade Level if available
      if (foundStudent.gradeLevelId) {
        setSelectedGradeLevelId(foundStudent.gradeLevelId);
      }
      // Pre-fill Title if empty or already generic
      if (!title || title.startsWith('1-on-1 Lesson with') || title.startsWith('Mastering')) {
        setTitle(`1-on-1 Lesson with ${foundStudent.name}`);
      }
      // Pre-fill Google Meet Link if available
      if (foundStudent.personalMeetUrl) {
        setJoinUrl(foundStudent.personalMeetUrl);
      }
    }
  };

  const handlePupilAdded = (newPupil?: StudentOption) => {
    setIsAddModalOpen(false);
    if (!newPupil) return;

    setStudents((prev) => {
      const filtered = prev.filter((s) => s.userId !== newPupil.userId);
      return [newPupil, ...filtered];
    });

    setSelectedStudentId(newPupil.userId);
    if (newPupil.gradeLevelId) {
      setSelectedGradeLevelId(newPupil.gradeLevelId);
    }
    setTitle(`1-on-1 Lesson with ${newPupil.name}`);
    if (newPupil.personalMeetUrl) {
      setJoinUrl(newPupil.personalMeetUrl);
    }
    setJustAddedNotice(`Pupil ${newPupil.name} onboarded & auto-selected!`);
    setTimeout(() => setJustAddedNotice(null), 5000);
  };

  return (
    <>
      <form action={action} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="subjectId" className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-dark/60">
              Subject
            </label>
            <select
              id="subjectId"
              name="subjectId"
              required
              className="w-full h-12 rounded-xl border-[2px] sm:border-[3px] border-dark bg-off-white px-3 sm:px-4 text-sm font-bold text-dark outline-none transition-all focus:border-yellow focus:bg-white"
            >
              {(subjects || []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="gradeLevelId" className="text-[11px] font-black uppercase tracking-widest text-dark/60">
              Grade Level / Audience
            </label>
            <select
              id="gradeLevelId"
              name="gradeLevelId"
              required
              value={selectedGradeLevelId}
              onChange={(e) => setSelectedGradeLevelId(e.target.value)}
              className="w-full h-12 rounded-xl border-[2px] sm:border-[3px] border-dark bg-off-white px-3 sm:px-4 text-sm font-bold text-dark outline-none transition-all focus:border-yellow focus:bg-white"
            >
              {(gradeLevels || []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.display_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Target Student Field with "+ Add New Student" Button */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="studentId" className="text-[11px] font-black uppercase tracking-widest text-dark/60">
              Target Student (For 1-on-1 Sessions)
            </label>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border-[2px] border-dark bg-yellow hover:bg-yellow/90 text-dark font-black text-xs shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all"
              title="Add a brand new pupil with their grade and Google Meet link"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add New Pupil</span>
            </button>
          </div>

          <select
            id="studentId"
            name="studentId"
            value={selectedStudentId}
            onChange={handleStudentChange}
            className="w-full h-12 rounded-xl border-[2px] sm:border-[3px] border-dark bg-off-white px-3 sm:px-4 text-sm font-bold text-dark outline-none transition-all focus:border-yellow focus:bg-white"
          >
            <option value="">Group Session (All students in selected Grade Level)</option>
            {(students || []).map((item) => (
              <option key={item.userId} value={item.userId}>
                {item.name} ({item.gradeName})
              </option>
            ))}
          </select>

          {justAddedNotice && (
            <p className="text-xs font-black text-amber-900 bg-amber-100 border-[2px] border-amber-400 rounded-lg p-2.5 animate-pulse flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{justAddedNotice}</span>
            </p>
          )}

          {selectedStudentId && (
            <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-lg p-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                1-on-1 private mode active. Grade Level and Meet link auto-synchronized.
              </span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="title" className="text-[11px] font-black uppercase tracking-widest text-dark/60">
            Session Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 1-on-1 Lesson with Kendrick / Mastering Decimals"
            className="w-full h-12 rounded-xl border-[2px] sm:border-[3px] border-dark bg-off-white px-3 sm:px-4 text-sm font-bold text-dark outline-none transition-all focus:border-yellow focus:bg-white placeholder:text-dark/30"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="scheduledStartAt" className="text-[11px] font-black uppercase tracking-widest text-dark/60">
              Start Time
            </label>
            <input
              id="scheduledStartAt"
              name="scheduledStartAt"
              type="datetime-local"
              required
              className="w-full h-12 rounded-xl border-[2px] sm:border-[3px] border-dark bg-off-white px-3 sm:px-4 text-sm font-bold text-dark outline-none transition-all focus:border-yellow focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="scheduledEndAt" className="text-[11px] font-black uppercase tracking-widest text-dark/60">
              End Time
            </label>
            <input
              id="scheduledEndAt"
              name="scheduledEndAt"
              type="datetime-local"
              required
              className="w-full h-12 rounded-xl border-[2px] sm:border-[3px] border-dark bg-off-white px-3 sm:px-4 text-sm font-bold text-dark outline-none transition-all focus:border-yellow focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border-[2px] sm:border-[3px] border-dark bg-white shadow-[2px_2px_0px_#060E1C]">
            <input
              type="checkbox"
              id="isRecurring"
              name="isRecurring"
              className="h-4 w-4 sm:h-5 sm:w-5 rounded border-[2px] border-dark text-dark accent-dark focus:ring-dark shrink-0"
            />
            <label htmlFor="isRecurring" className="text-xs font-black text-dark break-words cursor-pointer">
              Repeat Weekly
            </label>
          </div>
          <div className="space-y-2">
            <label htmlFor="recurrenceWeeks" className="text-[11px] font-black uppercase tracking-widest text-dark/60">
              Weeks
            </label>
            <select
              id="recurrenceWeeks"
              name="recurrenceWeeks"
              className="w-full h-12 rounded-xl border-[2px] sm:border-[3px] border-dark bg-off-white px-3 sm:px-4 text-sm font-bold text-dark outline-none focus:border-yellow focus:bg-white"
              defaultValue="4"
            >
              <option value="1">Just once</option>
              <option value="4">4 weeks</option>
              <option value="8">8 weeks</option>
              <option value="12">12 weeks</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="joinUrl" className="text-[11px] font-black uppercase tracking-widest text-dark/60 break-words">
            Google Meet Link <span className="text-emerald-600 font-bold">(Auto-filled from pupil profile or auto-generated)</span>
          </label>
          <input
            id="joinUrl"
            name="joinUrl"
            type="url"
            value={joinUrl}
            onChange={(e) => setJoinUrl(e.target.value)}
            placeholder="e.g. https://meet.google.com/dkk-vziq-afs"
            className="w-full h-12 rounded-xl border-[2px] sm:border-[3px] border-dark bg-off-white px-3 sm:px-4 text-sm font-bold text-dark outline-none transition-all focus:border-yellow focus:bg-white placeholder:text-dark/40"
          />
          <p className="text-[10px] sm:text-[11px] text-dark/60 font-semibold leading-snug break-words">
            Leave empty to automatically generate a unique Google Meet link for this session, or paste a custom link.
          </p>
        </div>

        <button
          type="submit"
          className="w-full h-12 sm:h-14 bg-dark hover:bg-dark/90 text-white border-[2px] sm:border-[3px] border-dark rounded-xl font-black text-base sm:text-lg transition-all active:scale-95 shadow-[3px_3px_0px_#F5C518] sm:shadow-[4px_4px_0px_#F5C518] break-words flex items-center justify-center cursor-pointer"
        >
          Publish to Dashboard
        </button>
      </form>

      {/* Quick Add Pupil Modal */}
      <QuickAddPupilModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handlePupilAdded}
      />
    </>
  );
}
