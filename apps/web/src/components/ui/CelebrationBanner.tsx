'use client';

import { useState, useEffect } from 'react';
import { Cake, Heart, Sparkles, X } from 'lucide-react';

export function CelebrationBanner({
  userName,
  eventType = 'birthday',
}: {
  userName: string;
  eventType?: 'birthday' | 'anniversary';
}) {
  const [visible, setVisible] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const isBirthday = eventType === 'birthday';

  return (
    <div className="relative overflow-hidden rounded-[24px] border-[4px] border-dark bg-gradient-to-r from-amber-300 via-rose-300 to-purple-300 p-5 sm:p-6 shadow-[6px_6px_0px_#060E1C] animate-fade-up">
      {/* Floating Confetti Layer */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-around opacity-80 z-0">
          <span className="animate-bounce text-2xl">🎉</span>
          <span className="animate-pulse text-3xl">✨</span>
          <span className="animate-bounce text-2xl delay-100">🎂</span>
          <span className="animate-pulse text-3xl delay-200">🎈</span>
          <span className="animate-bounce text-2xl delay-300">🥂</span>
        </div>
      )}

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-dark bg-yellow shadow-[3px_3px_0px_#060E1C]">
            {isBirthday ? <Cake className="h-8 w-8 text-dark" /> : <Heart className="h-8 w-8 text-rose-600 fill-rose-500" />}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border-[2px] border-dark bg-white text-[10px] font-black uppercase tracking-widest text-dark mb-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              {isBirthday ? '🎉 Happy Birthday Celebration!' : '🥂 Happy Wedding Anniversary!'}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight">
              {isBirthday
                ? `Happy Birthday, ${userName}! 🎂`
                : `Happy Wedding Anniversary, ${userName}! 🥂`}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-dark/80 max-w-xl mt-0.5">
              {isBirthday
                ? 'Edvoura Learning Hub celebrates you today! May your year ahead be filled with brilliant discoveries, joy, and excellence!'
                : 'Edvoura Learning Hub celebrates your love, partnership, and family joy today! Wishing you endless happiness together!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={() => setVisible(false)}
            className="p-2 hover:bg-white/50 rounded-xl transition-all cursor-pointer text-dark/70"
            title="Dismiss Celebration Banner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
