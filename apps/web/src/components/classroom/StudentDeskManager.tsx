'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Users,
  Eye,
  CheckCircle2,
  Award,
  Monitor,
  Star,
  Send,
  Sparkles,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { CollaborativeWhiteboard } from './CollaborativeWhiteboard';
import { Button } from '@/components/ui/button';

export interface DeskStudent {
  id: string;
  name: string;
  grade?: string;
  hasActivity?: boolean;
  isSubmitted?: boolean;
  stamps?: string[];
}

interface StudentDeskManagerProps {
  lessonId: string;
  role: 'tutor' | 'student';
  userName: string;
}

export function StudentDeskManager({ lessonId, role, userName }: StudentDeskManagerProps) {
  const [students, setStudents] = useState<DeskStudent[]>([
    { id: 'student-1', name: userName && role === 'student' ? userName : 'James Jedidiahz', grade: 'Grade 5', hasActivity: true, stamps: [] },
    { id: 'student-2', name: 'Amina Bello', grade: 'Grade 5', hasActivity: true, stamps: [] },
    { id: 'student-3', name: 'Chidi Okafor', grade: 'Grade 5', hasActivity: false, stamps: [] },
  ]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>('student-1');
  const [activeTaskPrompt, setActiveTaskPrompt] = useState<string>(
    'Practice Exercise: Calculate the Profit and Percentage Profit when Cost Price = $150 and Selling Price = $210.'
  );
  const [isHandedIn, setIsHandedIn] = useState(false);
  const [recentStamp, setRecentStamp] = useState<string | null>(null);

  const channelRef = React.useRef<any>(null);

  // Supabase Realtime synchronization for desk stamps & submissions
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`desk-manager:${lessonId}`);

    channel
      .on('broadcast', { event: 'desk-stamp' }, ({ payload }) => {
        if (!payload?.stamp) return;
        setRecentStamp(payload.stamp);
        playStampSound();
        setTimeout(() => setRecentStamp(null), 4000);
      })
      .on('broadcast', { event: 'desk-submit' }, ({ payload }) => {
        if (!payload?.studentId) return;
        setStudents((prev) =>
          prev.map((s) => (s.id === payload.studentId ? { ...s, isSubmitted: true } : s))
        );
      })
      .on('broadcast', { event: 'desk-new-task' }, ({ payload }) => {
        if (payload?.prompt) {
          setActiveTaskPrompt(payload.prompt);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      void channel.unsubscribe();
    };
  }, [lessonId]);

  const playStampSound = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (_) {}
  };

  const handleGiveStamp = (stamp: string) => {
    setRecentStamp(stamp);
    playStampSound();
    setTimeout(() => setRecentStamp(null), 4000);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'desk-stamp',
        payload: { studentId: selectedStudentId, stamp },
      });
    }
  };

  const handleStudentSubmit = () => {
    setIsHandedIn(true);
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'desk-submit',
        payload: { studentId: 'student-1', studentName: userName },
      });
    }
  };

  const currentDeskId =
    role === 'student'
      ? userName.toLowerCase().replace(/\s+/g, '-') || 'my-desk'
      : selectedStudentId;

  return (
    <div className="flex flex-col gap-3 h-full font-sans select-none">
      {/* Tutor Desk Switcher & Teacher Feedback Stamp Bar */}
      {role === 'tutor' && (
        <div className="bg-amber-50 border-[2.5px] border-dark rounded-2xl p-3 shadow-[3px_3px_0px_#060E1C] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-dark text-yellow p-1.5 rounded-xl shadow-[1.5px_1.5px_0px_#060E1C]">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-black text-xs sm:text-sm uppercase text-dark tracking-wide">
                Live Student Desks &amp; Seat-Work Pods
              </h3>
              <p className="text-[10px] font-bold text-dark/65">
                Inspect pupil working in real-time and stamp constructive feedback badges
              </p>
            </div>
          </div>

          {/* Teacher Stamp Tools */}
          <div className="flex items-center gap-1.5 bg-white border-[2px] border-dark p-1 rounded-xl shadow-[1.5px_1.5px_0px_#060E1C]">
            <span className="text-[10px] font-black uppercase text-dark/60 px-1">Stamps:</span>
            {[
              { stamp: '⭐ Super Star (+50 XP)', label: '⭐ Star' },
              { stamp: '💯 100% Accuracy', label: '💯 100%' },
              { stamp: '💡 Creative Method', label: '💡 Idea' },
              { stamp: '🔄 Check Step 2', label: '🔄 Re-check' },
            ].map((st) => (
              <button
                key={st.label}
                onClick={() => handleGiveStamp(st.stamp)}
                className="px-2 py-1 rounded-lg bg-yellow/20 hover:bg-yellow border border-dark text-dark font-black text-[10px] uppercase transition-all active:scale-95 cursor-pointer"
                title={`Send "${st.stamp}" feedback stamp to student`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Student Desk Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border-[2px] border-dark font-black text-xs uppercase transition-all shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95 cursor-pointer ${
                  selectedStudentId === student.id
                    ? 'bg-yellow text-dark ring-2 ring-dark scale-105'
                    : 'bg-white hover:bg-slate-100 text-dark/75'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    student.isSubmitted ? 'bg-blue-500 animate-pulse' : student.hasActivity ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
                <span>{student.name}</span>
                {student.isSubmitted && <span className="text-[9px] bg-blue-100 text-blue-900 px-1 rounded">Handed In</span>}
                {selectedStudentId === student.id && <Eye className="h-3 w-3 ml-0.5 text-dark" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Student Informational Banner */}
      {role === 'student' && (
        <div className="bg-sky-50 border-[2.5px] border-dark rounded-2xl p-3 shadow-[3px_3px_0px_#060E1C] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-sky-500 text-white p-1.5 rounded-xl border border-dark shadow-[1.5px_1.5px_0px_#060E1C]">
              <Monitor className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-black text-xs uppercase text-dark">
                Your Individual Seat-Work Desk
              </h4>
              <p className="text-[10px] font-bold text-dark/65">
                Work out calculations here. Your tutor marks steps live and provides instant feedback stamps!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleStudentSubmit}
              disabled={isHandedIn}
              className={`h-8 px-3 rounded-xl border-[2px] border-dark font-black text-xs uppercase transition-all shadow-[1.5px_1.5px_0px_#060E1C] ${
                isHandedIn
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-500'
                  : 'bg-yellow hover:bg-yellow/90 text-dark active:scale-95'
              }`}
            >
              {isHandedIn ? <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Send className="w-3.5 h-3.5 mr-1" />}
              <span>{isHandedIn ? 'Handed In!' : 'Hand In Work'}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Active Task Prompt Ribbon */}
      <div className="px-4 py-2 bg-yellow/20 border-[2px] border-dark rounded-xl flex items-center justify-between text-xs font-bold text-dark">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-dark shrink-0" />
          <span className="truncate"><strong>Desk Problem:</strong> {activeTaskPrompt}</span>
        </div>
        {recentStamp && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow border-[2px] border-dark rounded-full text-dark font-black text-xs shadow-md animate-bounce shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tutor Stamp: {recentStamp}</span>
          </div>
        )}
      </div>

      {/* The Active Student Desk Whiteboard */}
      <div className="flex-1 min-h-[500px]">
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
