'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { deleteLesson } from '@/app/dash/tutor/schedule/actions';

export default function DeleteLessonButton({ lessonId }: { lessonId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      await deleteLesson(lessonId);
    } catch (err) {
      console.error(err);
      alert('Failed to delete lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleDelete}
      disabled={loading}
      className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2"
    >
      <Trash2 className="w-4 h-4" /> 
      {loading ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
