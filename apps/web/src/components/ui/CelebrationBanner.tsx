'use client';

import { useState, useEffect } from 'react';
import { Cake, Heart, Sparkles, X } from 'lucide-react';

interface CelebrationBannerProps {
  userName: string;
  userRole?: 'student' | 'parent' | 'tutor';
  dateOfBirth?: string | null;
  weddingAnniversary?: string | null;
  eventType?: 'birthday' | 'anniversary';
}

function parseMonthAndDay(dateStr?: string | null): { month: number; day: number } | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return { month: d.getMonth() + 1, day: d.getDate() };
    }
    // Handle MM-DD or YYYY-MM-DD
    const parts = dateStr.split(/[-/]/);
    if (parts.length >= 2) {
      const month = parseInt(parts[parts.length === 3 ? 1 : 0], 10);
      const day = parseInt(parts[parts.length === 3 ? 2 : 1], 10);
      if (!isNaN(month) && !isNaN(day)) return { month, day };
    }
  } catch {
    // Ignore invalid date format
  }
  return null;
}

export function CelebrationBanner({
  userName,
  userRole = 'student',
  dateOfBirth,
  weddingAnniversary,
  eventType: overrideEventType,
}: CelebrationBannerProps) {
  const [visible, setVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [activeEvent, setActiveEvent] = useState<'birthday' | 'anniversary'>('birthday');

  useEffect(() => {
    // Check local date
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    const todayKey = `${today.getFullYear()}-${currentMonth}-${currentDay}`;
    const dismissKey = `edvoura_dismissed_celebration_${userName.toLowerCase().trim()}_${todayKey}`;

    // 1. Check if user dismissed today
    if (typeof window !== 'undefined') {
      const isDismissed = localStorage.getItem(dismissKey);
      if (isDismissed === 'true') {
        setVisible(false);
        return;
      }

      // Check query param override for preview testing (e.g. ?test_celebration=birthday)
      const urlParams = new URLSearchParams(window.location.search);
      const testParam = urlParams.get('test_celebration');
      if (testParam === 'birthday' || testParam === 'anniversary') {
        setActiveEvent(testParam);
        setVisible(true);
        return;
      }
    }

    // 2. Automatic Date Identification Logic
    if (overrideEventType) {
      setActiveEvent(overrideEventType);
    }

    let isMatch = false;

    // Check birthday
    if (dateOfBirth) {
      const parsedDob = parseMonthAndDay(dateOfBirth);
      if (parsedDob && parsedDob.month === currentMonth && parsedDob.day === currentDay) {
        isMatch = true;
        setActiveEvent('birthday');
      }
    }

    // Check wedding anniversary (Parents & Tutors)
    if (!isMatch && weddingAnniversary && (userRole === 'parent' || userRole === 'tutor')) {
      const parsedAnniv = parseMonthAndDay(weddingAnniversary);
      if (parsedAnniv && parsedAnniv.month === currentMonth && parsedAnniv.day === currentDay) {
        isMatch = true;
        setActiveEvent('anniversary');
      }
    }

    // ONLY show if today matches user's birthday/anniversary date!
    if (isMatch) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [dateOfBirth, weddingAnniversary, userName, userRole, overrideEventType]);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setShowConfetti(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleDismiss = () => {
    setVisible(false);
    if (typeof window !== 'undefined') {
      const today = new Date();
      const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      const dismissKey = `edvoura_dismissed_celebration_${userName.toLowerCase().trim()}_${todayKey}`;
      localStorage.setItem(dismissKey, 'true');
    }
  };

  if (!visible) return null;

  const isBirthday = activeEvent === 'birthday';

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
            onClick={handleDismiss}
            className="p-2.5 bg-white/80 hover:bg-white border-[2px] border-dark rounded-xl transition-all cursor-pointer text-dark font-black text-xs flex items-center gap-1 shadow-[2px_2px_0px_#060E1C]"
            title="Dismiss Celebration Banner"
          >
            <X className="h-4 w-4" /> Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
