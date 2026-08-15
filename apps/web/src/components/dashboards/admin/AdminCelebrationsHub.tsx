'use client';

import { useState } from 'react';
import { Cake, Heart, Sparkles, Send, Calendar, CheckCircle2, Mail, Users } from 'lucide-react';

type CelebrationItem = {
  id: string;
  name: string;
  role: 'Student' | 'Parent' | 'Tutor';
  type: 'birthday' | 'anniversary';
  dateStr: string;
  email: string;
  status: 'upcoming' | 'sent';
};

export function AdminCelebrationsHub() {
  const [celebrations, setCelebrations] = useState<CelebrationItem[]>([
    { id: '1', name: 'Titomi (Grade 3)', role: 'Student', type: 'birthday', dateStr: 'Today (Aug 15)', email: 'adetutulawson@gmail.com', status: 'upcoming' },
    { id: '2', name: 'James Jedidiahz (Grade 3)', role: 'Student', type: 'birthday', dateStr: 'Aug 18', email: 'djedidiahz@gmail.com', status: 'upcoming' },
    { id: '3', name: 'Mr. & Mrs. Akinola', role: 'Parent', type: 'anniversary', dateStr: 'Aug 22', email: 'edvoura@gmail.com', status: 'upcoming' },
    { id: '4', name: 'Dr. Adebayo (Math Tutor)', role: 'Tutor', type: 'birthday', dateStr: 'Aug 25', email: '3plef101@gmail.com', status: 'upcoming' },
  ]);

  const [toast, setToast] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<CelebrationItem | null>(null);

  const handleSendWish = (item: CelebrationItem) => {
    setCelebrations(prev => prev.map(c => c.id === item.id ? { ...c, status: 'sent' } : c));
    setToast(`🎉 Warm ${item.type === 'birthday' ? 'Birthday' : 'Anniversary'} wishes & email card sent to ${item.name} (${item.email})!`);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="border-[3px] border-dark rounded-[24px] bg-white shadow-[4px_4px_0px_#060E1C] overflow-hidden min-w-0 sm:border-[4px] sm:rounded-[28px] sm:shadow-[10px_10px_0px_#060E1C]">
      {toast && (
        <div className="p-4 bg-emerald-100 border-b-[3px] border-dark text-emerald-950 font-black flex items-center justify-between gap-3 animate-fade-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-800" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      <div className="p-5 sm:p-6 border-b-[4px] border-dark bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-[2px] border-dark bg-white text-[10px] font-black uppercase tracking-widest text-dark mb-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            Automated Celebrations Engine
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight">
            Upcoming Birthdays &amp; Wedding Anniversaries 🎂🥂
          </h2>
          <p className="text-xs sm:text-sm font-bold text-dark/70 mt-0.5">
            Automated emails &amp; dashboard celebration cards for students, parents, and tutors.
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-3">
        {celebrations.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl border-[3px] border-dark bg-off-white shadow-[4px_4px_0px_#060E1C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-[2.5px] border-dark font-black shadow-[2px_2px_0px_#060E1C] ${
                item.type === 'birthday' ? 'bg-amber-300' : 'bg-rose-300'
              }`}>
                {item.type === 'birthday' ? <Cake className="h-6 w-6 text-dark" /> : <Heart className="h-6 w-6 text-rose-700 fill-rose-600" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base text-dark">{item.name}</span>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border border-dark bg-white">
                    {item.role}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-dark/70 mt-0.5">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {item.dateStr}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {item.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => handleSendWish(item)}
                disabled={item.status === 'sent'}
                className={`px-4 py-2 rounded-xl border-[2.5px] border-dark text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] transition-all flex items-center gap-1.5 cursor-pointer ${
                  item.status === 'sent'
                    ? 'bg-emerald-100 text-emerald-950 border-emerald-800 cursor-default'
                    : 'bg-yellow text-dark hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none'
                }`}
              >
                {item.status === 'sent' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-800" /> Sent &amp; Pushed
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send Celebration Wishes 🎉
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
