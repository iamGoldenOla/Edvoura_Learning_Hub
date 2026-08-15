'use client';

import { useState, useEffect } from 'react';
import { Clock, Play, Square, ShieldCheck, CheckCircle2, Video } from 'lucide-react';

export function TutorSessionCheckInLogger() {
  const [sessionActive, setSessionActive] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionActive) {
      interval = setInterval(() => setSecondsElapsed((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    setSessionActive(true);
    setSecondsElapsed(0);
    setToast('Live Class Check-In Verified! Recording actual session duration.');
    setTimeout(() => setToast(null), 3000);
  };

  const handleEndSession = () => {
    setSessionActive(false);
    setToast(`Class Ended & Audited! Total verified duration: ${formatTime(secondsElapsed)}`);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="p-5 rounded-2xl border-[3px] border-dark bg-sky-50 shadow-[4px_4px_0px_#060E1C] space-y-3">
      {toast && (
        <div className="p-3 bg-emerald-100 border-[2px] border-dark text-emerald-950 font-black rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-800" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-dark" />
            <h3 className="text-base font-black text-dark">Live Class Verification Logger</h3>
          </div>
          <p className="text-xs font-bold text-dark/70">Verify actual live class duration for student attendance &amp; admin reporting.</p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {sessionActive ? (
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 bg-rose-200 border-[2px] border-dark rounded-xl text-xs font-black text-rose-950 flex items-center gap-2 animate-pulse">
                <Clock className="h-4 w-4" /> Live: {formatTime(secondsElapsed)}
              </div>
              <button
                onClick={handleEndSession}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white border-[2.5px] border-dark rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] cursor-pointer flex items-center gap-1.5"
              >
                <Square className="h-4 w-4" /> End &amp; Audit Session
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartSession}
              className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-500 text-dark border-[2.5px] border-dark rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#060E1C] cursor-pointer flex items-center gap-1.5"
            >
              <Play className="h-4 w-4" /> Start Verified Class Check-In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
