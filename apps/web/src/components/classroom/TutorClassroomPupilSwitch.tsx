'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Users, Sparkles, UserCheck } from 'lucide-react';

interface Pupil {
  id: string;
  name: string;
  grade: string;
}

interface TutorClassroomPupilSwitchProps {
  currentStudentId?: string;
  currentStudentName?: string;
  pupils: Pupil[];
}

export function TutorClassroomPupilSwitch({
  currentStudentId,
  currentStudentName,
  pupils,
}: TutorClassroomPupilSwitchProps) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
      router.push('/dash/tutor/live/classroom');
      return;
    }
    const found = pupils.find((p) => p.id === value);
    if (found) {
      router.push(`/dash/tutor/live/classroom?studentId=${found.id}&studentName=${encodeURIComponent(found.name)}`);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white border-[2px] border-dark px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_#060E1C]">
      <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
      <label htmlFor="pupil-switch" className="text-[11px] font-black uppercase tracking-wider text-dark/70 hidden sm:inline">
        Active Pupil:
      </label>
      <select
        id="pupil-switch"
        value={currentStudentId || ''}
        onChange={handleChange}
        className="bg-off-white text-dark text-xs font-bold border border-dark/30 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-yellow cursor-pointer"
      >
        <option value="">Instant Teaching Studio (Whiteboard &amp; STEM)</option>
        {pupils.map((pupil) => (
          <option key={pupil.id} value={pupil.id}>
            {pupil.name} ({pupil.grade})
          </option>
        ))}
      </select>
    </div>
  );
}
