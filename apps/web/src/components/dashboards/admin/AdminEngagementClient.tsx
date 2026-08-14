'use client';

import { useState } from 'react';
import { Zap, Award, Flame, Trophy, Gift, Plus, CheckCircle2, X } from 'lucide-react';

export function AdminEngagementClient({
  activitiesCount,
  resourceUploadsCount,
  spellingBeeCount,
}: {
  activitiesCount: number;
  resourceUploadsCount: number;
  spellingBeeCount: number;
}) {
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [xpReward, setXpReward] = useState('100');
  const [toast, setToast] = useState<string | null>(null);

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeTitle.trim()) return;

    setToast(`Challenge Template "${challengeTitle}" (+${xpReward} XP) created and published to all students!`);
    setChallengeTitle('');
    setShowChallengeModal(false);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-8">
      {toast && (
        <div className="p-4 bg-emerald-100 border-[3px] border-dark text-emerald-950 font-black rounded-2xl shadow-[4px_4px_0px_#060E1C] flex items-center justify-between gap-3 animate-fade-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-800" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-blue-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Platform Activities</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{activitiesCount}</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-emerald-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Resource Uploads</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{resourceUploadsCount}</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-amber-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Spelling Bee Events</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{spellingBeeCount}</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-rose-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Live Activity Events</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{activitiesCount}</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-purple-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <Gift className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Resource Ratio</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">
              {activitiesCount ? `${Math.round((resourceUploadsCount / activitiesCount) * 100)}%` : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0 flex flex-col">
          <div className="p-6 border-b-[4px] border-dark bg-sky-100 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-dark tracking-tight">Global Gamification Rules</h2>
          </div>
          <div className="p-6 sm:p-8 space-y-4 flex-1">
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-sm sm:text-base">
              XP rule engine: +50 XP per retention quiz completion, +100 XP per 3-day learning streak
            </div>
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-sm sm:text-base">
              Badge taxonomy: Subject Master, Spelling Bee Champ, Quiz Wizard, Math Explorer
            </div>
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-sm sm:text-base">
              Leaderboard rules: Real-time XP rank updates across Grade 1 to SS 3
            </div>
          </div>
        </div>

        <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0 flex flex-col">
          <div className="p-6 border-b-[4px] border-dark bg-emerald-100 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-dark tracking-tight">Engagement Actions</h2>
          </div>
          <div className="p-6 sm:p-8 flex flex-col gap-4 flex-1">
            <button
              onClick={() => setToast('Reward rules saved and synchronized with active student sessions!')}
              className="bg-dark border-[3px] border-dark text-white font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 flex items-center justify-center text-center text-sm cursor-pointer"
            >
              Save & Apply Reward Rules
            </button>
            <button
              onClick={() => setShowChallengeModal(true)}
              className="bg-yellow border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 flex items-center justify-center text-center text-sm cursor-pointer"
            >
              + Create Challenge Template
            </button>
          </div>
        </div>
      </div>

      {/* Create Challenge Modal */}
      {showChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[24px] border-[4px] border-dark bg-white p-6 shadow-[10px_10px_0px_#060E1C] animate-fade-up">
            <div className="flex items-center justify-between border-b-[3px] border-dark pb-3 mb-4">
              <h3 className="text-xl font-black text-dark">Create Challenge Template</h3>
              <button onClick={() => setShowChallengeModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5 text-dark" />
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-dark mb-1">Challenge Title</label>
                <input
                  type="text"
                  required
                  value={challengeTitle}
                  onChange={(e) => setChallengeTitle(e.target.value)}
                  placeholder="e.g. 7-Day Math Mastery Quest"
                  className="w-full px-4 py-3 rounded-xl border-[2.5px] border-dark text-sm font-bold text-dark focus:outline-none focus:border-yellow"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-dark mb-1">XP Reward</label>
                <select
                  value={xpReward}
                  onChange={(e) => setXpReward(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-[2.5px] border-dark text-sm font-bold text-dark focus:outline-none focus:border-yellow bg-white"
                >
                  <option value="50">+50 XP</option>
                  <option value="100">+100 XP (Recommended)</option>
                  <option value="250">+250 XP (Super Quest)</option>
                  <option value="500">+500 XP (Grand Master)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowChallengeModal(false)}
                  className="px-4 py-2.5 rounded-xl border-[2px] border-dark text-xs font-bold text-dark hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-yellow border-[2.5px] border-dark rounded-xl text-xs font-black text-dark shadow-[3px_3px_0px_#060E1C]"
                >
                  Publish Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
