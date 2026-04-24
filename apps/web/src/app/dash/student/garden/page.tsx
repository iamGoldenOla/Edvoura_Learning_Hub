'use client';

import { Sparkles, Flower, CloudSun, Droplets, Trophy } from 'lucide-react';

export default function GardenPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      <header className="text-center bg-white border-[4px] border-dark rounded-[40px] p-12 shadow-[12px_12px_0px_#060E1C]">
        <h1 className="text-6xl font-heading font-black text-dark tracking-tight">Magic Garden</h1>
        <p className="mt-4 text-2xl text-dark/60 font-semibold italic">Grow your garden by finishing your lessons!</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-gradient-to-b from-blue-100 to-green-100 border-[6px] border-dark rounded-[60px] p-12 shadow-[16px_16px_0px_#060E1C] relative overflow-hidden min-h-[500px]">
            <div className="absolute top-10 right-10 animate-pulse text-6xl">☀️</div>
            <div className="absolute bottom-20 left-1/4 text-6xl animate-bounce duration-1000">🌻</div>
            <div className="absolute bottom-20 right-1/4 text-6xl animate-bounce duration-700">🌷</div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-8xl">🌳</div>
            
            <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
               <div className="bg-white border-[4px] border-dark p-8 rounded-3xl shadow-[8px_8px_0px_#000] text-center max-w-sm">
                  <Sparkles className="h-12 w-12 text-yellow mx-auto mb-4" />
                  <h2 className="text-2xl font-black text-dark uppercase">Garden Level 2</h2>
                  <p className="text-sm font-bold text-dark/60 mt-2">Finish 3 more missions to unlock the Magic Fountain! ⛲</p>
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <GardenStat icon={<Flower />} label="Flowers Grown" value="12" color="bg-pink-400" />
            <GardenStat icon={<Droplets />} label="Water Points" value="450" color="bg-blue-400" />
            <GardenStat icon={<Trophy />} label="Rare Seeds" value="3" color="bg-yellow" />
            
            <div className="bg-white border-[4px] border-dark rounded-[40px] p-8 shadow-[8px_8px_0px_#060E1C] space-y-4">
               <h3 className="text-xl font-black text-dark uppercase tracking-tight">Daily Care</h3>
               <button className="w-full py-4 bg-blue-500 text-white border-[3px] border-dark rounded-2xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#000] flex items-center justify-center gap-2">
                  <Droplets className="h-5 w-5" /> Water Garden
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

function GardenStat({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-white border-[4px] border-dark rounded-[32px] p-6 shadow-[6px_6px_0px_#060E1C] flex items-center gap-4">
       <div className={`h-12 w-12 rounded-2xl ${color} border-[3px] border-dark flex items-center justify-center text-white`}>
          {icon}
       </div>
       <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-dark/30">{label}</p>
          <p className="text-2xl font-black text-dark">{value}</p>
       </div>
    </div>
  );
}
