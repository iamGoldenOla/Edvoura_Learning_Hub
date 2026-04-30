'use client';

import { Sparkles, Flower, CloudSun, Droplets, Trophy } from 'lucide-react';

export default function GardenPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 pb-20 px-4 sm:px-8 animate-in fade-in duration-700 min-w-0">
      <header className="text-center bg-white border-[3px] sm:border-[4px] border-dark rounded-[28px] sm:rounded-[40px] p-6 sm:p-12 shadow-[6px_6px_0px_#060E1C] sm:shadow-[12px_12px_0px_#060E1C] min-w-0">
        <h1 className="text-4xl sm:text-6xl font-heading font-black text-dark tracking-tight break-words">Magic Garden</h1>
        <p className="mt-2 sm:mt-4 text-lg sm:text-2xl text-dark/60 font-semibold italic break-words">Grow your garden by finishing your lessons!</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 min-w-0">
         <div className="lg:col-span-2 bg-gradient-to-b from-blue-100 to-green-100 border-[4px] sm:border-[6px] border-dark rounded-[32px] sm:rounded-[60px] p-6 sm:p-12 shadow-[8px_8px_0px_#060E1C] sm:shadow-[16px_16px_0px_#060E1C] relative overflow-hidden min-h-[400px] sm:min-h-[500px]">
            <div className="absolute top-10 right-10 animate-pulse text-6xl">☀️</div>
            <div className="absolute bottom-20 left-1/4 text-6xl animate-bounce duration-1000">🌻</div>
            <div className="absolute bottom-20 right-1/4 text-6xl animate-bounce duration-700">🌷</div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-8xl">🌳</div>
            
            <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
               <div className="bg-white border-[3px] sm:border-[4px] border-dark p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[4px_4px_0px_#000] sm:shadow-[8px_8px_0px_#000] text-center max-w-sm mx-4 min-w-0">
                  <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-yellow mx-auto mb-3 sm:mb-4" />
                  <h2 className="text-xl sm:text-2xl font-black text-dark uppercase break-words">Garden Level 2</h2>
                  <p className="text-xs sm:text-sm font-bold text-dark/60 mt-2 break-words">Finish 3 more missions to unlock the Magic Fountain! ⛲</p>
               </div>
            </div>
         </div>

         <div className="space-y-4 sm:space-y-6 min-w-0">
            <GardenStat icon={<Flower />} label="Flowers Grown" value="12" color="bg-pink-400" />
            <GardenStat icon={<Droplets />} label="Water Points" value="450" color="bg-blue-400" />
            <GardenStat icon={<Trophy />} label="Rare Seeds" value="3" color="bg-yellow" />
            
            <div className="bg-white border-[3px] sm:border-[4px] border-dark rounded-[24px] sm:rounded-[40px] p-6 sm:p-8 shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] space-y-4 min-w-0">
               <h3 className="text-lg sm:text-xl font-black text-dark uppercase tracking-tight break-words">Daily Care</h3>
               <button className="w-full py-3 sm:py-4 bg-blue-500 text-white border-[3px] border-dark rounded-xl sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] flex items-center justify-center gap-2 hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all active:scale-95 break-words">
                  <Droplets className="h-4 w-4 sm:h-5 sm:w-5" /> Water Garden
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

function GardenStat({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-white border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[32px] p-4 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex items-center gap-3 sm:gap-4 min-w-0">
       <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl ${color} border-[2px] sm:border-[3px] border-dark flex items-center justify-center text-white shrink-0`}>
          {icon}
       </div>
       <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-dark/30 break-words">{label}</p>
          <p className="text-xl sm:text-2xl font-black text-dark break-words">{value}</p>
       </div>
    </div>
  );
}
