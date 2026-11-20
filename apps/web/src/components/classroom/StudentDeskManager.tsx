'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { CollaborativeWhiteboard } from './CollaborativeWhiteboard';

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
  studentName?: string;
}

export function StudentDeskManager({ lessonId, role, userName, studentName }: StudentDeskManagerProps) {
  const primaryStudentName = role === 'student' ? userName : (studentName || 'Titomi Lawson');
  const [students, setStudents] = useState<DeskStudent[]>([
    { id: 'student-1', name: primaryStudentName, grade: 'Grade 5', hasActivity: true, stamps: [] },
    { id: 'student-2', name: 'Amina Bello', grade: 'Grade 5', hasActivity: false, stamps: [] },
    { id: 'student-3', name: 'Chidi Okafor', grade: 'Grade 5', hasActivity: false, stamps: [] },
  ]);

  useEffect(() => {
    if (studentName) {
      setStudents((prev) => prev.map((s, idx) => (idx === 0 ? { ...s, name: studentName } : s)));
    }
  }, [studentName]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>('student-1');
  const [activeTaskPrompt, setActiveTaskPrompt] = useState<string>(
    'Practice Exercise: Calculate the Profit and Percentage Profit when Cost Price = $150 and Selling Price = $210.'
  );
  const [isHandedIn, setIsHandedIn] = useState(false);
  const [recentStamp, setRecentStamp] = useState<string | null>(null);

  const channelRef = React.useRef<any>(null);

  // Supabase Realtime synchronization for desk stamps, submissions, and new tasks
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

  const handleUpdateTaskPrompt = (prompt: string) => {
    setActiveTaskPrompt(prompt);
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'desk-new-task',
        payload: { prompt },
      });
    }
  };

  const currentDeskId =
    role === 'student'
      ? userName.toLowerCase().replace(/\s+/g, '-') || 'my-desk'
      : selectedStudentId;

  return (
    <div className="w-full h-full relative overflow-hidden bg-white select-none font-sans">
      <CollaborativeWhiteboard
        lessonId={lessonId}
        role={role}
        userName={userName}
        seatWorkStudentId={currentDeskId}
        isSeatWorkMode={true}
        seatWorkStudents={students}
        activeDeskStudentId={selectedStudentId}
        onSelectDeskStudent={setSelectedStudentId}
        activeTaskPrompt={activeTaskPrompt}
        onUpdateTaskPrompt={handleUpdateTaskPrompt}
        onGiveStamp={handleGiveStamp}
        isHandedIn={isHandedIn}
        onStudentSubmit={handleStudentSubmit}
        recentStamp={recentStamp}
      />
    </div>
  );
}
