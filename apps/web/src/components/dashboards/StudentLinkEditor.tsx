'use client';

import { useState } from 'react';
import { Link as LinkIcon, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateStudentPersonalLink } from '@/app/dash/tutor/roster/actions';

export default function StudentLinkEditor({ studentId, currentUrl, currentHostUrl }: { studentId: string, currentUrl: string | null, currentHostUrl: string | null }) {
  const [isEditing, setIsEditing] = useState(false);
  const [url, setUrl] = useState(currentUrl || '');
  const [hostUrl, setHostUrl] = useState(currentHostUrl || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateStudentPersonalLink(studentId, url, hostUrl);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update link');
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <Button 
        variant="ghost" 
        onClick={() => setIsEditing(true)}
        className="text-[10px] h-6 px-2 text-slate-500 hover:text-blue-600"
      >
        <LinkIcon className="w-3 h-3 mr-1" />
        {currentUrl ? 'Edit Eternal Link' : 'Add Eternal Link'}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
      <input 
        type="url" 
        placeholder="Student Join URL" 
        value={url} 
        onChange={(e) => setUrl(e.target.value)}
        className="text-[10px] px-2 py-1 border border-slate-200 rounded"
      />
      <input 
        type="url" 
        placeholder="Tutor Host URL" 
        value={hostUrl} 
        onChange={(e) => setHostUrl(e.target.value)}
        className="text-[10px] px-2 py-1 border border-slate-200 rounded"
      />
      <div className="flex justify-end gap-1">
        <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-6 w-6 p-0 text-red-500">
          <X className="w-3 h-3" />
        </Button>
        <Button variant="ghost" onClick={handleSave} disabled={loading} className="h-6 w-6 p-0 text-green-500">
          <Check className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
