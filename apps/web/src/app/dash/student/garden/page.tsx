'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Flower, Droplets, Trophy, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const FLOWER_EMOJIS = ['🌻', '🌷', '🌸', '🌺', '🌼', '🌹', '🪻', '🪷'];

export default function GardenPage() {
  const [completedCount, setCompletedCount] = useState(0);
  const [waterDrops, setWaterDrops] = useState(0);
  const [hydrationBonus, setHydrationBonus] = useState(0);
  const [wateringAnim, setWateringAnim] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadGardenProgress = async () => {
      try {
        const supabase = createClient();
        const { data: userRes } = await supabase.auth.getUser();
        const uid = userRes?.user?.id;
        if (!uid) return;

        const [{ count: quizCount }, { count: subCount }] = await Promise.all([
          supabase
            .from('student_ai_practice_scores')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', uid),
          supabase
            .from('assignment_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('student_user_id', uid)
            .in('status', ['submitted', 'graded']),
        ]);

        const savedBonus = Number(localStorage.getItem(`edvoura-garden-bonus-${uid}`) || '0');
        if (active) {
          const totalDone = (quizCount ?? 0) + (subCount ?? 0);
          setCompletedCount(totalDone);
          setHydrationBonus(savedBonus);
          setWaterDrops(totalDone * 25 + savedBonus * 10);
        }
      } catch (_) {}
    };
    void loadGardenProgress();
    return () => {
      active = false;
    };
  }, []);

  const totalFlowers = Math.max(2, Math.min(16, 2 + completedCount + Math.floor(hydrationBonus / 2)));
  const gardenLevel = Math.max(1, Math.floor(totalFlowers / 3) + 1);
  const rareSeeds = Math.floor(completedCount / 2);
  const missionsToFountain = Math.max(0, 6 - completedCount);

  const handleWaterGarden = async () => {
    setWateringAnim(true);
    const nextBonus = hydrationBonus + 1;
    setHydrationBonus(nextBonus);
    setWaterDrops((prev) => prev + 10);
    setStatusMessage('💧 Splash! +10 Water Points — your garden is blooming!');
    try {
      const supabase = createClient();
      const { data: userRes } = await supabase.auth.getUser();
      if (userRes?.user?.id) {
        localStorage.setItem(`edvoura-garden-bonus-${userRes.user.id}`, String(nextBonus));
      }
    } catch (_) {}
    setTimeout(() => setWateringAnim(false), 900);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10 pb-20 px-4 sm:px-8 animate-in fade-in duration-700 min-w-0">
      <header className="text-center bg-white border-[3px] sm:border-[4px] border-dark rounded-[28px] sm:rounded-[40px] p-6 sm:p-10 shadow-[6px_6px_0px_#060E1C] sm:shadow-[12px_12px_0px_#060E1C] min-w-0">
        <h1 className="text-4xl sm:text-6xl font-heading font-black text-dark tracking-tight break-words">Magic Garden</h1>
        <p className="mt-2 sm:mt-4 text-base sm:text-xl text-dark/65 font-semibold italic break-words">
          Every quiz and assignment you complete grows new flowers in your garden!
        </p>
      </header>

      {statusMessage && (
        <div className="rounded-2xl border-[3px] border-dark bg-emerald-300 px-5 py-3 text-center text-sm font-black text-dark shadow-[4px_4px_0px_#060E1C] flex items-center justify-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 min-w-0">
        <div className="lg:col-span-2 bg-gradient-to-b from-sky-200 via-blue-100 to-emerald-200 border-[4px] sm:border-[6px] border-dark rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 shadow-[8px_8px_0px_#060E1C] sm:shadow-[14px_14px_0px_#060E1C] relative overflow-hidden min-h-[420px] sm:min-h-[500px] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="bg-white/95 border-[3px] border-dark px-5 py-3 rounded-2xl shadow-[4px_4px_0px_#060E1C]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow" />
                <h2 className="text-lg sm:text-xl font-black text-dark uppercase">Garden Level {gardenLevel}</h2>
              </div>
              <p className="text-xs font-bold text-dark/65 mt-1">
                {missionsToFountain > 0
                  ? `Finish ${missionsToFountain} more quiz or homework mission${missionsToFountain === 1 ? '' : 's'} to unlock the Magic Fountain! ⛲`
                  : 'Magic Fountain Unlocked! Your garden is flourishing! ⛲✨'}
              </p>
            </div>
            <div className="animate-pulse text-5xl sm:text-6xl">☀️</div>
          </div>

          {wateringAnim && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-6xl animate-bounce z-20">
              💧💧💧
            </div>
          )}

          <div className="relative pt-10 flex flex-wrap items-end justify-center gap-4 sm:gap-6">
            {missionsToFountain === 0 && <span className="text-6xl sm:text-7xl animate-pulse">⛲</span>}
            <span className="text-7xl sm:text-8xl">🌳</span>
            {Array.from({ length: totalFlowers }).map((_, i) => (
              <span
                key={i}
                className={`text-4xl sm:text-5xl transition-transform ${wateringAnim ? 'scale-125 -translate-y-2' : 'hover:scale-110'}`}
              >
                {FLOWER_EMOJIS[i % FLOWER_EMOJIS.length]}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6 min-w-0">
          <GardenStat icon={<Flower />} label="Flowers Grown" value={String(totalFlowers)} color="bg-pink-400" />
          <GardenStat icon={<Droplets />} label="Water Points" value={String(waterDrops)} color="bg-blue-400" />
          <GardenStat icon={<Trophy />} label="Rare Seeds Earned" value={String(rareSeeds)} color="bg-yellow" />

          <div className="bg-white border-[3px] sm:border-[4px] border-dark rounded-[24px] sm:rounded-[32px] p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] space-y-3 min-w-0">
            <h3 className="text-lg sm:text-xl font-black text-dark uppercase tracking-tight break-words">Daily Care</h3>
            <button
              type="button"
              onClick={handleWaterGarden}
              className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white border-[3px] border-dark rounded-xl sm:rounded-2xl font-black uppercase text-xs tracking-widest shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all active:scale-95 cursor-pointer"
            >
              <Droplets className="h-5 w-5" /> Water Garden (+10)
            </button>
            <Link
              href="/dash/student/quiz"
              className="w-full py-3 bg-yellow hover:bg-yellow/90 text-dark border-[3px] border-dark rounded-xl sm:rounded-2xl font-black uppercase text-xs tracking-widest shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all"
            >
              <Sparkles className="h-4 w-4" /> Earn More Seeds
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function GardenStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-white border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] p-4 sm:p-5 shadow-[4px_4px_0px_#060E1C] flex items-center gap-3 sm:gap-4 min-w-0">
      <div className={`h-11 w-11 rounded-xl sm:rounded-2xl ${color} border-[2px] sm:border-[3px] border-dark flex items-center justify-center text-white shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-dark/45 break-words">{label}</p>
        <p className="text-2xl font-black text-dark break-words">{value}</p>
      </div>
    </div>
  );
}
