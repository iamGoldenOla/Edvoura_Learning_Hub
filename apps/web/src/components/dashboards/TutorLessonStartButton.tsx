'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { startLesson } from '@/app/dash/tutor/schedule/actions';

export default function TutorLessonStartButton({ lessonId, status }: { lessonId: string; status: string }) {
  const [loading, setLoading] = useState(false);

  // Don't render if already live — the parent component shows "Join Classroom" instead
  if (status === 'live') return null;

  const handleStart = async () => {
    if (!confirm('Are you ready to start this lesson? Students will be notified and can join now.')) return;

    setLoading(true);

    // Open a blank window IMMEDIATELY on user click to avoid popup blockers
    const newWindow = window.open('about:blank', '_blank');
    if (newWindow) {
      newWindow.document.title = 'Preparing Classroom...';
      newWindow.document.body.innerHTML =
        '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:system-ui,sans-serif;color:#0F172A;font-size:18px;font-weight:700;">Preparing your Edvoura classroom…</div>';
    }

    try {
      const result = await startLesson(lessonId);

      if (result?.hostUrl) {
        // Redirect the pre-opened window to Google Meet
        if (newWindow && !newWindow.closed) {
          newWindow.location.href = result.hostUrl;
        } else {
          window.open(result.hostUrl, '_blank');
        }
      } else {
        // No URL came back — close the blank window and reload so "Join Classroom" appears
        if (newWindow && !newWindow.closed) newWindow.close();
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      if (newWindow && !newWindow.closed) newWindow.close();
      alert('Failed to start lesson. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStart}
      disabled={loading}
      className="h-12 px-6 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all inline-flex justify-center"
    >
      <Play className="w-4 h-4 fill-current" />
      {loading ? 'Launching…' : 'Start Lesson'}
    </button>
  );
}
