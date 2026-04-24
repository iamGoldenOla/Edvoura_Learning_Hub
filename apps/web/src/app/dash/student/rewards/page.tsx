'use client';

import { useState } from 'react';
import { Star, Trophy, Sparkles, Medal, Heart, Coins } from 'lucide-react';
import Link from 'next/link';

export default function RewardsPage() {
  const stars = 450;
  const tokens = 120;
  const badges = 5;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow text-dark border-[3px] border-dark font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_#060E1C]">
          <Sparkles className="h-4 w-4" />
          My Treasure Chest
        </div>
        <h1 className="text-5xl font-heading font-black text-dark tracking-tight">Level Up!</h1>
        <p className="text-dark/60 font-semibold italic">Look at all the amazing things you have earned!</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <RewardCard 
          label="Magic Stars" 
          value={stars} 
          icon={Star} 
          color="bg-yellow-100" 
          textColor="text-yellow-600" 
          description="Earned from lessons"
         />
         <RewardCard 
          label="Edvoura Tokens" 
          value={tokens} 
          icon={Coins} 
          color="bg-blue-100" 
          textColor="text-blue-600" 
          description="Spend in the Shop"
         />
         <RewardCard 
          label="Total Badges" 
          value={badges} 
          icon={Medal} 
          color="bg-purple-100" 
          textColor="text-purple-600" 
          description="Super Scholar status"
         />
      </div>

      <div className="bg-white border-[6px] border-dark rounded-[60px] p-12 shadow-[16px_16px_0px_#060E1C] relative overflow-hidden">
        <h2 className="text-3xl font-black text-dark mb-8 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow" />
          Hall of Fame
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
           <BadgeItem icon="🥇" name="First Lesson" date="2 days ago" />
           <BadgeItem icon="🌟" name="Math Wizard" date="1 week ago" />
           <BadgeItem icon="📚" name="Super Reader" date="Oct 15" />
           <BadgeItem icon="🤝" name="Kind Friend" date="Oct 12" />
           <BadgeItem icon="🚀" name="Fast Learner" date="Oct 10" />
        </div>

        <div className="mt-12 p-8 rounded-[40px] bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-6">
             <div className="h-20 w-20 rounded-full bg-yellow border-4 border-white flex items-center justify-center text-4xl animate-bounce">
                💎
             </div>
             <div>
               <h3 className="text-2xl font-black">Next Big Reward</h3>
               <p className="text-slate-400 font-bold">Reach 500 Stars to unlock the Diamond Avatar!</p>
             </div>
           </div>
           <Link 
             href="/dash/student/garden"
             className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-slate-100 transition-all"
           >
             Go to Garden
           </Link>
        </div>
      </div>
    </div>
  );
}

function RewardCard({ label, value, icon: Icon, color, textColor, description }: any) {
  return (
    <div className={`${color} border-[4px] border-dark rounded-[40px] p-8 shadow-[8px_8px_0px_#060E1C] flex flex-col items-center text-center group hover:translate-y-[-4px] transition-all`}>
       <div className={`h-20 w-20 rounded-[28px] bg-white border-[3px] border-dark flex items-center justify-center mb-6 shadow-[4px_4px_0px_#060E1C] group-hover:scale-110 transition-transform`}>
          <Icon className={`h-10 w-10 ${textColor}`} />
       </div>
       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/30 mb-1">{label}</p>
       <p className={`text-5xl font-black text-dark mb-2`}>{value}</p>
       <p className="text-xs font-bold text-dark/40 italic">{description}</p>
    </div>
  );
}

function BadgeItem({ icon, name, date }: any) {
  return (
    <div className="flex flex-col items-center gap-3">
       <div className="h-24 w-24 rounded-full border-[4px] border-dark bg-off-white flex items-center justify-center text-5xl shadow-[4px_4px_0px_#060E1C] hover:rotate-12 transition-transform cursor-help">
          {icon}
       </div>
       <div className="text-center">
         <p className="text-xs font-black text-dark">{name}</p>
         <p className="text-[9px] font-bold text-dark/30 uppercase tracking-widest">{date}</p>
       </div>
    </div>
  );
}

