'use client';

import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminBroadcastComposer({ onSent }: { onSent?: () => void }) {
  const [audience, setAudience] = useState<'all' | 'students' | 'tutors' | 'parents'>('all');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audience, title, body }),
      });
      if (res.ok) {
        setFeedback('Broadcast successfully sent to active users.');
        setTitle('');
        setBody('');
        onSent?.();
      } else {
        const data = await res.json().catch(() => ({}));
        setFeedback(data.error || 'Failed to send broadcast.');
      }
    } catch {
      setFeedback('Failed to send broadcast.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-[3px] border-dark rounded-2xl p-6 shadow-[5px_5px_0px_#060E1C] space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-yellow" />
        <h3 className="text-lg font-black text-dark uppercase tracking-tight">Platform Broadcast Composer</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="broadcast-audience" className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Target Audience</label>
          <select
            id="broadcast-audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value as any)}
            className="w-full rounded-xl border-[3px] border-dark bg-white px-3 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
          >
            <option value="all">All Registered Users</option>
            <option value="students">Students Only</option>
            <option value="tutors">Tutors Only</option>
            <option value="parents">Parents Only</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="broadcast-title" className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Title</label>
          <input
            id="broadcast-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-xl border-[3px] border-dark bg-white px-3 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
            placeholder="Platform alert title"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="broadcast-message" className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Message</label>
          <textarea
            id="broadcast-message"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            className="w-full rounded-xl border-[3px] border-dark bg-white px-3 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
            placeholder="Type your announcement or update message here..."
          />
        </div>

        {feedback && (
          <p className="text-xs font-bold text-dark bg-yellow/30 border border-dark rounded-lg p-2.5">
            {feedback}
          </p>
        )}

        <Button
          onClick={handleSend}
          disabled={loading || !title.trim() || !body.trim()}
          className="w-full bg-yellow hover:bg-yellow/90 border-[3px] border-dark text-dark font-black rounded-xl py-3 flex items-center justify-center gap-2 shadow-[3px_3px_0px_#060E1C] active:scale-95 transition-all"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? 'Transmitting Broadcast...' : 'Dispatch Broadcast Alert'}</span>
        </Button>
      </div>
    </div>
  );
}


export default AdminBroadcastComposer;
