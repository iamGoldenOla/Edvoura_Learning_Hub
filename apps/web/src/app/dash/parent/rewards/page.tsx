import { Award, Flame, Star, Trophy } from 'lucide-react';

const rewards = [
  { id: 'rw-1', title: 'Math Sprint Champion', date: 'Apr 10', points: 120 },
  { id: 'rw-2', title: 'Reading Streak', date: 'Apr 08', points: 90 },
  { id: 'rw-3', title: 'Science Challenge', date: 'Apr 05', points: 75 },
];

export default function ParentRewardsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-6 sm:p-8 pb-20">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-yellow">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
            Rewards and Engagement
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Track XP, badges, streaks, and challenge completions for your child.
          </p>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-[28px] border-[4px] border-dark bg-purple-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <Star className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Current XP</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">2,430</p>
            <p className="text-xs font-bold text-dark/60 mt-2 uppercase tracking-widest">This term</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-rose-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Active Streak</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">9 days</p>
            <p className="text-xs font-bold text-dark/60 mt-2 uppercase tracking-widest">Daily learning streak</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-emerald-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Badges Earned</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">14</p>
            <p className="text-xs font-bold text-dark/60 mt-2 uppercase tracking-widest">Across all subjects</p>
          </div>
        </div>
      </section>

      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-6 border-b-[4px] border-dark bg-amber-100 flex items-center gap-3">
          <Trophy className="h-6 w-6 text-dark" />
          <h2 className="text-2xl font-black text-dark tracking-tight">Recent Achievements</h2>
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          {rewards.map((reward) => (
            <div key={reward.id} className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#060E1C] flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-lg font-black text-dark">{reward.title}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60 mt-1">
                  {reward.date}
                </p>
              </div>
              <span className="inline-flex rounded-xl border-[2px] border-dark bg-yellow px-4 py-2 text-sm font-black text-dark shadow-[2px_2px_0px_#060E1C]">
                +{reward.points} XP
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
