'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Loader2 } from 'lucide-react';
import { startLesson } from '@/app/dash/tutor/schedule/actions';

export default function TutorLessonStartButton({ lessonId, status }: { lessonId: string; status: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Don't render if already live — the parent component shows "Enter Classroom" instead
  if (status === 'live') return null;

  const handleStart = async () => {
    if (!confirm('Are you ready to start this lesson? Students will be notified and can enter the classroom now.')) return;

    setLoading(true);

    try {
      await startLesson(lessonId);
      // Navigate directly into the in-platform Edvoura classroom workspace (no new tab or popup)
      router.push(`/dash/tutor/live/classroom?lessonId=${lessonId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to start lesson. Please refresh and try again.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStart}
      disabled={loading}
      className="h-12 px-6 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all inline-flex justify-center"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
      {loading ? 'Entering Classroom…' : 'Start Lesson'}
    </button>
  );
}
