'use client';

import { Trophy, Star, Sparkles, Heart, Zap } from 'lucide-react';

export default function PrizeBoxPage() {
  const prizes = [
    { name: 'Speed Racer', icon: <Zap />, color: 'bg-yellow' },
    { name: 'Kind Heart', icon: <Heart />, color: 'bg-red-400' },
    { name: 'Star Pupil', icon: <Star />, color: 'bg-indigo-400' },
    { name: 'Mission Master', icon: <Trophy />, color: 'bg-orange-400' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      <header className="text-center bg-white border-[4px] border-dark rounded-[40px] p-12 shadow-[12px_12px_0px_#060E1C]">
        <h1 className="text-6xl font-heading font-black text-dark tracking-tight">My Prize Box</h1>
        <p className="mt-4 text-2xl text-dark/60 font-semibold italic">Collect stickers for every mission you finish!</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
         {prizes.map((prize, i) => (
           <div key={i} className="bg-white border-[4px] border-dark rounded-[40px] p-10 shadow-[8px_8px_0px_#060E1C] flex flex-col items-center gap-6 group hover:translate-y-[-8px] transition-all">
              <div className={`h-24 w-24 rounded-3xl ${prize.color} border-[4px] border-dark flex items-center justify-center text-5xl text-white group-hover:rotate-12 transition-transform`}>
                 {prize.icon}
              </div>
              <p className="text-xl font-black text-dark uppercase tracking-tight">{prize.name}</p>
              <div className="flex gap-1">
                 {[1,2,3].map(s => <Star key={s} className="h-4 w-4 text-yellow fill-current" />)}
              </div>
           </div>
         ))}
         
         {[1,2,3,4].map(i => (
           <div key={i} className="bg-slate-50 border-[4px] border-dark border-dashed rounded-[40px] p-10 flex flex-col items-center justify-center grayscale opacity-20">
              <div className="h-24 w-24 rounded-3xl bg-slate-200 flex items-center justify-center text-4xl">🔒</div>
           </div>
         ))}
      </div>

      <div className="bg-indigo-600 border-[4px] border-dark rounded-[40px] p-12 shadow-[12px_12px_0px_#000] text-center text-white">
         <Sparkles className="h-12 w-12 mx-auto mb-6" />
         <h2 className="text-3xl font-black uppercase tracking-tight">Earn more prizes!</h2>
         <p className="text-lg font-bold opacity-80 mt-2">Check your Homework missions to see what you can win next!</p>
      </div>
    </div>
  );
}
