'use client';

import React, { useState } from 'react';
import { UserPlus, X, Check, Video, Mail, Calendar, Sparkles } from 'lucide-react';
import { quickOnboardPupil } from '@/app/dash/tutor/roster/actions';

interface QuickAddPupilModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newStudent?: {
    userId: string;
    name: string;
    gradeName: string;
    gradeLevelId?: string;
    personalMeetUrl?: string | null;
  }) => void;
}

export default function QuickAddPupilModal({ isOpen, onClose, onSuccess }: QuickAddPupilModalProps) {
  const [fullName, setFullName] = useState('');
  const [gradeLevel, setGradeLevel] = useState(3);
  const [meetUrl, setMeetUrl] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !meetUrl.trim()) {
      setErrorMsg('Student name and Google Meet link are required.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await quickOnboardPupil({
      fullName: fullName.trim(),
      gradeLevel: Number(gradeLevel),
      meetUrl: meetUrl.trim(),
      parentEmail: parentEmail.trim() || undefined,
      scheduleNotes: scheduleNotes.trim() || undefined,
    });

    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess(res.student);
      }, 1000);
    } else {
      setErrorMsg(res.error || 'Failed to onboard pupil.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg bg-off-white border-4 border-navy rounded-[2rem] p-6 sm:p-8 shadow-[10px_10px_0px_#0A1628] text-navy font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white border-2 border-navy flex items-center justify-center hover:bg-yellow transition-colors shadow-[2px_2px_0px_#0A1628]"
        >
          <X className="w-4 h-4 text-navy" />
        </button>

        {!success ? (
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border-2 border-navy bg-yellow px-3 py-0.5 text-xs font-black uppercase tracking-wider mb-3 shadow-[2px_2px_0px_#0A1628]">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tutor Desk Quick Action</span>
            </div>

            <h3 className="font-heading font-black text-2xl text-navy mb-1">
              Add New Pupil &amp; Set Meet Link
            </h3>
            <p className="text-xs font-bold text-navy/70 mb-5">
              Instantly create a student profile and link their persistent Google Meet room.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl border-2 border-red-500 bg-red-100 text-red-900 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-navy mb-1">
                  Pupil Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Titomi Lawson / Kendrick Agbagwa"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-navy bg-white font-bold text-sm text-navy focus:outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#0A1628]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-navy mb-1">
                    Grade Level *
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-navy bg-white font-bold text-sm text-navy focus:outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#0A1628]"
                  >
                    <option value={1}>Primary 1 / Grade 1</option>
                    <option value={2}>Primary 2 / Grade 2</option>
                    <option value={3}>Primary 3 / Grade 3</option>
                    <option value={4}>Primary 4 / Grade 4</option>
                    <option value={5}>Primary 5 / Grade 5</option>
                    <option value={6}>Primary 6 / Grade 6</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-navy mb-1">
                    Parent Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="parent@gmail.com"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-navy bg-white font-bold text-sm text-navy focus:outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#0A1628]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-navy mb-1">
                  Persistent Google Meet Link *
                </label>
                <div className="relative">
                  <Video className="absolute left-3 top-3 w-4 h-4 text-navy/40" />
                  <input
                    type="url"
                    required
                    placeholder="https://meet.google.com/xxx-yyyy-zzz"
                    value={meetUrl}
                    onChange={(e) => setMeetUrl(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border-2 border-navy bg-white font-bold text-sm text-navy focus:outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#0A1628]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-navy mb-1">
                  Schedule / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tuesdays 5:30pm UK, Saturdays 10am Online"
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-navy bg-white font-bold text-sm text-navy focus:outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#0A1628]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3.5 px-4 rounded-xl border-3 border-navy bg-yellow hover:bg-yellow/90 font-heading font-black text-sm uppercase tracking-wider shadow-[3px_3px_0px_#0A1628] hover:-translate-y-0.5 transition-transform"
              >
                {loading ? 'Adding Pupil...' : 'Save & Link Google Meet Room'}
              </button>
            </form>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 border-3 border-navy flex items-center justify-center mx-auto mb-3 shadow-[3px_3px_0px_#0A1628]">
              <Check className="w-7 h-7 text-emerald-600" />
            </div>
            <h4 className="font-heading font-black text-xl text-navy">
              Pupil Onboarded Successfully!
            </h4>
            <p className="text-xs font-bold text-navy/70 mt-1">
              Google Meet room linked to {fullName}&apos;s live classroom.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
