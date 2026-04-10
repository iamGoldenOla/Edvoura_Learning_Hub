import React from 'react';
import { Bookmark, Lock, Sparkles, Medal, Rocket, Trophy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function StickerBookPage() {
  // Mock Data for Stickers
  const stickers = [
    { id: 1, name: 'Math Logic', unlocked: true, icon: <Rocket className="w-8 h-8 text-edvoura-navy" />, status: 'Earned Oct 12' },
    { id: 2, name: 'Science Discovery', unlocked: true, icon: <Sparkles className="w-8 h-8 text-edvoura-navy" />, status: 'Earned Oct 10' },
    { id: 3, name: 'Literature Review', unlocked: true, icon: <Bookmark className="w-8 h-8 text-edvoura-navy" />, status: 'Earned Oct 05' },
    { id: 4, name: 'Perfect Spelling', unlocked: false, icon: <Lock className="w-8 h-8 text-slate-300" />, status: 'Requires: 100 XP' },
    { id: 5, name: 'Punctuality', unlocked: false, icon: <Lock className="w-8 h-8 text-slate-300" />, status: 'Requires: 5 On-Time' },
    { id: 6, name: 'Peer Support', unlocked: false, icon: <Lock className="w-8 h-8 text-slate-300" />, status: 'Requires: Tutor Nom.' },
    { id: 7, name: '7-Day Streak', unlocked: false, icon: <Lock className="w-8 h-8 text-slate-300" />, status: 'Current: 4 Days' },
    { id: 8, name: 'Master Scholar', unlocked: false, icon: <Lock className="w-8 h-8 text-slate-300" />, status: 'Requires: All Badges' }
  ];

  const unlockedCount = stickers.filter(s => s.unlocked).length;
  const progressPercent = (unlockedCount / stickers.length) * 100;

  return (
    <div className="p-8 max-w-[1400px] mx-auto animate-in slide-in-from-bottom-4 duration-500 space-y-8">
      
      {/* Mature Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-edvoura-navy rounded-2xl p-8 text-white shadow-md">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-white">
            <Trophy className="w-7 h-7 text-edvoura-gold" /> Achievements & Badges
          </h1>
          <p className="mt-2 text-slate-300 text-sm">Review your earned academic milestones and upcoming reward thresholds.</p>
        </div>
        <div className="mt-6 md:mt-0 flex gap-4 text-center">
          <div className="bg-slate-800 border border-slate-700 px-6 py-3 rounded-xl min-w-32">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Earned</p>
            <p className="text-3xl font-black text-edvoura-gold">{unlockedCount} <span className="text-sm text-slate-500 font-bold">/ {stickers.length}</span></p>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm border-slate-200">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Mastery Progression</CardTitle>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">{progressPercent}% Completed</span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-edvoura-navy h-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stickers.map((sticker) => (
          <div 
            key={sticker.id}
            className={`
              relative flex flex-col p-6 rounded-2xl border transition-all duration-300
              ${sticker.unlocked ? 'bg-white border-slate-200 shadow-sm hover:border-edvoura-navy hover:shadow-md' : 'bg-slate-50/50 border-slate-100 border-dashed'}
            `}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${sticker.unlocked ? 'bg-slate-100' : 'bg-slate-100/50'}`}>
                {sticker.icon}
              </div>
              {sticker.unlocked && (
                <Medal className="w-5 h-5 text-edvoura-gold" />
              )}
            </div>
            
            <h3 className={`font-bold text-sm mb-1 ${sticker.unlocked ? 'text-slate-800' : 'text-slate-500'}`}>
              {sticker.name}
            </h3>
            
            <p className={`text-[10px] uppercase font-bold tracking-wider ${sticker.unlocked ? 'text-green-600' : 'text-slate-400'}`}>
              {sticker.status}
            </p>
          </div>
        ))}
      </div>
      
    </div>
  );
}
