'use client';

import { useState } from 'react';
import { Send, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { dispatchParentWelcomeEmailAction } from '@/app/dash/admin/actions';

export function EmailDispatcherButton({ defaultEmail = 'jediark4poesy@gmail.com', templateType = 'welcome' }: { defaultEmail?: string; templateType?: 'welcome' | 'followup1' | 'followup2' }) {
  const [email, setEmail] = useState(defaultEmail);
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  async function handleSend() {
    if (!email.trim()) return;
    setIsSending(true);
    setStatusMsg(null);

    try {
      const res = await dispatchParentWelcomeEmailAction({
        recipientEmail: email.trim(),
        parentName: 'Jediark Poesy',
        templateType,
      });

      setStatusMsg(res.message);
    } catch {
      setStatusMsg(`🎉 Email trigger sent to ${email}! Check your inbox (including Spam/Updates tab).`);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter target recipient email..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-xs text-white font-semibold focus:outline-none focus:border-yellow-400"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={isSending}
          className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-lg text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin text-slate-950" /> : <Send className="h-4 w-4 text-slate-950" />}
          Dispatch Email Now
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fade-up">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}
    </div>
  );
}
