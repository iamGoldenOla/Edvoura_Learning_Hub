'use client';

import { useState } from 'react';
import { Sprout, CloudRain, Sun, Star, Trophy, Sparkles } from 'lucide-react';

const PLANTS = [
  { id: 1, name: 'Daisy', stage: 3, icon: '🌼' },
  { id: 2, name: 'Tulip', stage: 2, icon: '🌷' },
  { id: 3, name: 'Sunflower', stage: 1, icon: '🌱' },
  { id: 4, name: 'Tree', stage: 0, icon: '🕳️' },
];

export default function GardenPage() {
  const [waterCount, setWaterCount] = useState(5);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      <header className="bg-white border-[4px] border-dark rounded-[40px] p-10 shadow-[10px_10px_0px_#060E1C] flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 border-[3px] border-dark font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_#060E1C] mb-4">
            <Sprout className="h-4 w-4" />
            My Magic Garden
          </div>
          <h1 className="text-5xl font-heading font-black text-dark tracking-tight">Growth Tracker</h1>
          <p className="mt-2 text-xl text-dark/60 font-semibold italic">Finish missions to get water and grow your plants!</p>
        </div>
        
        <div className="flex gap-4">
           <div className="bg-blue-50 border-[4px] border-dark rounded-[24px] p-6 shadow-[6px_6px_0px_#060E1C] text-center min-w-[120px]">
             <CloudRain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
             <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Water</p>
             <p className="text-3xl font-black text-blue-600">{waterCount}</p>
           </div>
           <div className="bg-yellow border-[4px] border-dark rounded-[24px] p-6 shadow-[6px_6px_0px_#060E1C] text-center min-w-[120px]">
             <Star className="h-8 w-8 text-dark mx-auto mb-2" />
             <p className="text-[10px] font-black uppercase tracking-widest text-dark/30">Sun Points</p>
             <p className="text-3xl font-black text-dark">120</p>
           </div>
        </div>
      </header>

      {/* The Garden Plot */}
      <div className="bg-[#8B4513]/10 border-[6px] border-dark rounded-[60px] p-12 shadow-[16px_16px_0px_#060E1C] relative overflow-hidden">
        {/* Background Grass */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-green-500/20"></div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
          {PLANTS.map((plant) => (
            <div key={plant.id} className="flex flex-col items-center gap-6">
               <div className="relative group">
                  <div className="h-40 w-40 rounded-full bg-white/40 border-[4px] border-dark border-dashed flex items-center justify-center text-7xl group-hover:scale-110 transition-transform">
                     {plant.stage === 0 ? '🌱' : plant.stage === 1 ? '🌿' : plant.stage === 2 ? '🪴' : plant.icon}
                  </div>
                  {plant.stage < 3 && (
                    <button 
                      onClick={() => setWaterCount(Math.max(0, waterCount - 1))}
                      className="absolute -bottom-4 -right-4 h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center border-[3px] border-dark shadow-[4px_4px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                    >
                      <CloudRain className="h-6 w-6" />
                    </button>
                  )}
               </div>
               <div className="text-center">
                 <h3 className="text-xl font-black text-dark">{plant.name}</h3>
                 <div className="mt-2 flex gap-1">
                   {[1, 2, 3].map((s) => (
                     <div key={s} className={`h-2 w-6 rounded-full border-2 border-dark ${s <= plant.stage ? 'bg-green-500' : 'bg-white'}`}></div>
                   ))}
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards Sidebar/Bottom */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className="bg-white border-[4px] border-dark rounded-[32px] p-8 shadow-[8px_8px_0px_#060E1C]">
          <h3 className="text-xl font-black text-dark flex items-center gap-2 mb-6">
            <Trophy className="h-6 w-6 text-yellow" />
            Badges
          </h3>
          <div className="flex flex-wrap gap-4">
             <div className="h-14 w-14 rounded-full bg-slate-100 border-2 border-dark flex items-center justify-center text-2xl">🥇</div>
             <div className="h-14 w-14 rounded-full bg-slate-100 border-2 border-dark flex items-center justify-center text-2xl">🌟</div>
             <div className="h-14 w-14 rounded-full bg-slate-100 border-2 border-dark flex items-center justify-center text-2xl">🚀</div>
          </div>
        </section>

        <section className="bg-white border-[4px] border-dark rounded-[32px] p-8 shadow-[8px_8px_0px_#060E1C] md:col-span-2">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-xl font-black text-dark flex items-center gap-2">
               <Sparkles className="h-6 w-6 text-purple-500" />
               Recent Achievements
             </h3>
             <button className="text-xs font-black text-blue-600 uppercase tracking-widest">See All</button>
           </div>
           <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-xl">💧</div>
                   <p className="font-bold text-slate-700">Watered the Daisy</p>
                 </div>
                 <span className="text-xs font-black text-slate-400">2 hours ago</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-full bg-yellow flex items-center justify-center text-xl">✨</div>
                   <p className="font-bold text-slate-700">Finished Math Mission</p>
                 </div>
                 <span className="text-xs font-black text-slate-400">Yesterday</span>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
