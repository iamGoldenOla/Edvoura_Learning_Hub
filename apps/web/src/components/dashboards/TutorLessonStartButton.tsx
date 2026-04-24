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
    try {
      const result = await startLesson(lessonId);
      if (result?.hostUrl) {
        window.open(result.hostUrl, '_blank');
      } else {
        alert('Lesson started! But no meeting link was found. Please add one in the schedule.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to start lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleStart} 
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
    >
      <Play className="w-4 h-4" />
      {loading ? 'Starting...' : 'Start Lesson'}
    </Button>
  );
}
