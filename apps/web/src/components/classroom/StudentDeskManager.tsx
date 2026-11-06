'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Users, Eye, CheckCircle2, MessageSquare, Award, Monitor } from 'lucide-react';
import { CollaborativeWhiteboard } from './CollaborativeWhiteboard';

export interface DeskStudent {
  id: string;
  name: string;
  grade?: string;
  hasActivity?: boolean;
}

interface StudentDeskManagerProps {
  lessonId: string;
  role: 'tutor' | 'student';
  userName: string;
}

export function StudentDeskManager({ lessonId, role, userName }: StudentDeskManagerProps) {
  // In a live classroom, list of enrolled students or active attendees
  const [students, setStudents] = useState<DeskStudent[]>([
    { id: 'student-1', name: 'Amina Bello', grade: 'Grade 5', hasActivity: true },
    { id: 'student-2', name: 'Chidi Okafor', grade: 'Grade 5', hasActivity: true },
    { id: 'student-3', name: 'Zainab Musa', grade: 'Grade 5', hasActivity: false },
    { id: 'student-4', name: 'David Adeleke', grade: 'Grade 5', hasActivity: true },
  ]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>('student-1');

  // If role is student, they only have access to their own desk
  const currentDeskId = role === 'student' ? (userName.toLowerCase().replace(/\s+/g, '-') || 'my-desk') : selectedStudentId;
  const currentDeskName = role === 'student' ? `${userName}'s Desk` : students.find((s) => s.id === selectedStudentId)?.name || 'Student Desk';

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Tutor Desk Switcher Bar */}
      {role === 'tutor' && (
        <div className="bg-amber-50 border-[3px] border-black rounded-2xl p-3 shadow-[4px_4px_0px_#000] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-black text-amber-300 p-1.5 rounded-xl">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase text-black tracking-wide">
                Live Student Desks & Seat-Work
              </h3>
              <p className="text-[11px] font-bold text-black/60">
                Click any pupil to inspect their step-by-step working and leave feedback stamps
              </p>
            </div>
          </div>

          {/* Student Desk Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-[2px] border-black font-black text-xs uppercase transition-all shadow-[2px_2px_0px_#000] active:scale-95 ${
                  selectedStudentId === student.id
                    ? 'bg-yellow text-black ring-2 ring-black scale-105'
                    : 'bg-white hover:bg-slate-100 text-black/80'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${student.hasActivity ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>{student.name}</span>
                {selectedStudentId === student.id && <Eye className="h-3 w-3 ml-1 text-black" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Student Informational Banner */}
      {role === 'student' && (
        <div className="bg-sky-50 border-[3px] border-black rounded-2xl p-3 shadow-[4px_4px_0px_#000] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-sky-500 text-white p-1.5 rounded-xl border border-black shadow-[2px_2px_0px_#000]">
              <Monitor className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-black text-xs uppercase text-black">
                Your Individual Seat-Work Desk
              </h4>
              <p className="text-[11px] font-bold text-black/60">
                Write out your calculations or diagrams here. Your tutor can see your work live and mark your steps!
              </p>
            </div>
          </div>
          <div className="bg-white border-[2px] border-black px-3 py-1 rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_#000] text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Tutor Connected
          </div>
        </div>
      )}

      {/* The Active Student Desk Whiteboard */}
      <div className="flex-1 min-h-[550px]">
        <CollaborativeWhiteboard
          lessonId={lessonId}
          role={role}
          userName={userName}
          seatWorkStudentId={currentDeskId}
          isSeatWorkMode={true}
        />
      </div>
    </div>
  );
}
