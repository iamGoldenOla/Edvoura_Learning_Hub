'use client';

import { useState } from 'react';
import { Sparkles, Trophy, Star, Lock, Heart, Sun, Cloud, Moon } from 'lucide-react';

const STICKERS = [
  { id: 1, name: 'Math Star', unlocked: true, icon: '⭐', color: 'bg-yellow-100', rarity: 'Common' },
  { id: 2, name: 'Science Wiz', unlocked: true, icon: '🧪', color: 'bg-green-100', rarity: 'Rare' },
  { id: 3, name: 'Speed Reader', unlocked: true, icon: '🚀', color: 'bg-blue-100', rarity: 'Epic' },
  { id: 4, name: 'Kind Heart', unlocked: false, icon: '❤️', color: 'bg-pink-100', rarity: 'Common' },
  { id: 5, name: 'Art Master', unlocked: false, icon: '🎨', color: 'bg-purple-100', rarity: 'Rare' },
  { id: 6, name: 'Music Maker', unlocked: false, icon: '🎵', color: 'bg-indigo-100', rarity: 'Common' },
  { id: 7, name: 'Nature Lover', unlocked: false, icon: '🌿', color: 'bg-emerald-100', rarity: 'Epic' },
  { id: 8, name: 'Early Bird', unlocked: false, icon: '☀️', color: 'bg-amber-100', rarity: 'Common' },
];

export default function StickerBookPage() {
  const unlockedCount = STICKERS.filter(s => s.unlocked).length;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      <header className="bg-white border-[4px] border-dark rounded-[40px] p-10 shadow-[10px_10px_0px_#060E1C] flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-700 border-[3px] border-dark font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_#060E1C] mb-4">
            <Sparkles className="h-4 w-4" />
            My Sticker Book
          </div>
          <h1 className="text-5xl font-heading font-black text-dark tracking-tight">Prize Collection</h1>
          <p className="mt-2 text-xl text-dark/60 font-semibold italic">Collect all the magic stickers by finishing missions!</p>
        </div>
        
        <div className="bg-yellow border-[4px] border-dark rounded-[32px] p-8 shadow-[8px_8px_0px_#060E1C] text-center min-w-[160px]">
           <Trophy className="h-10 w-10 text-dark mx-auto mb-2" />
           <p className="text-[10px] font-black uppercase tracking-widest text-dark/30">Stickers Found</p>
           <p className="text-4xl font-black text-dark">{unlockedCount} / {STICKERS.length}</p>
        </div>
      </header>

      {/* The Sticker Book Grid */}
      <div className="bg-white border-[6px] border-dark rounded-[60px] p-12 shadow-[16px_16px_0px_#060E1C] grid grid-cols-2 md:grid-cols-4 gap-8">
        {STICKERS.map((sticker) => (
          <div 
            key={sticker.id}
            className={`
              relative aspect-square rounded-[32px] border-[4px] border-dark shadow-[6px_6px_0px_#060E1C] flex flex-col items-center justify-center transition-all group
              ${sticker.unlocked ? sticker.color : 'bg-slate-50 grayscale opacity-40'}
            `}
          >
            {sticker.unlocked ? (
              <>
                <div className="text-6xl group-hover:scale-125 transition-transform animate-in zoom-in duration-500">
                  {sticker.icon}
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white border-2 border-dark flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow fill-current" />
                </div>
                <div className="mt-4 px-3 py-1 bg-white/50 rounded-full border-2 border-dark text-[10px] font-black uppercase tracking-widest text-dark">
                  {sticker.name}
                </div>
              </>
            ) : (
              <>
                <Lock className="h-12 w-12 text-slate-400" />
                <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Locked</div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-blue-600 border-[4px] border-dark rounded-[32px] p-8 shadow-[8px_8px_0px_#060E1C] text-white">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <Sun className="h-6 w-6" /> Daily Boost
            </h3>
            <p className="text-sm font-bold text-blue-100">Log in tomorrow to get a mystery sticker pack!</p>
            <div className="mt-6 h-3 w-full bg-white/20 rounded-full overflow-hidden border-2 border-dark">
               <div className="h-full bg-white w-3/4"></div>
            </div>
         </div>
         
         <div className="bg-indigo-600 border-[4px] border-dark rounded-[32px] p-8 shadow-[8px_8px_0px_#060E1C] text-white md:col-span-2 flex flex-col md:flex-row items-center gap-8">
            <div className="h-24 w-24 bg-white/20 rounded-[20px] flex items-center justify-center text-5xl border-2 border-dark rotate-3">
               🎁
            </div>
            <div>
               <h3 className="text-2xl font-black mb-2">Next Milestone</h3>
               <p className="text-indigo-100 font-bold">Collect 2 more stickers to unlock the <span className="text-yellow font-black underline">Super Scholar Card!</span></p>
            </div>
         </div>
      </div>
    </div>
  );
}
