'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { startLesson } from '@/app/dash/tutor/schedule/actions';

export default function TutorLessonStartButton({ lessonId, status }: { lessonId: string, status: string }) {
  const [loading, setLoading] = useState(false);

  if (status === 'live') return null;

  const handleStart = async () => {
    if (!confirm('Are you ready to start this lesson? Students will be notified and can join now.')) return;
    
    setLoading(true);
    
    // Open a temporary window immediately to avoid popup blockers
    const newWindow = window.open('about:blank', '_blank');
    if (newWindow) {
      newWindow.document.title = "Preparing Classroom...";
      newWindow.document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;color:#0F172A;font-weight:bold;">Preparing your Edvoura classroom, please wait...</div>';
    }

    try {
      const result = await startLesson(lessonId);
      
      if (result?.hostUrl) {
        if (newWindow) {
          newWindow.location.href = result.hostUrl;
        } else {
          window.open(result.hostUrl, '_blank');
        }
      } else {
        if (newWindow) newWindow.close();
        alert('Lesson started! Your classroom is being prepared. If the room doesn\'t open automatically, please check your pop-up blocker or use the Join Room button.');
      }
    } catch (err) {
      console.error(err);
      if (newWindow) newWindow.close();
      alert('Failed to start lesson. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleStart} 
      disabled={loading}
      className="bg-[#10B981] hover:bg-[#059669] text-white rounded-xl h-10 px-6 font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
    >
      <Play className="w-4 h-4 fill-current" />
      {loading ? 'Launching...' : 'Start Lesson'}
    </Button>
  );
}
