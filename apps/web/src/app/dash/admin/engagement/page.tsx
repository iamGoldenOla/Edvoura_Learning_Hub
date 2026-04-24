import Link from 'next/link';
import { Award, Flame, Gift, Trophy, Zap } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export default async function AdminEngagementPage() {
  const supabase = await createClient();

  const [
    { count: activitiesCount },
    { count: resourceUploadsCount },
    { count: spellingBeeCount },
  ] = await Promise.all([
    supabase.from('learning_activity_events').select('*', { count: 'exact', head: true }),
    supabase.from('learning_activity_events').select('*', { count: 'exact', head: true }).eq('event_type', 'lesson_resource_uploaded'),
    supabase.from('learning_activity_events').select('*', { count: 'exact', head: true }).eq('event_type', 'spelling_bee_created'),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-6 sm:p-8 pb-20">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-yellow">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
            Engagement and Rewards
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Platform-wide gamification controls for XP, badges, streaks, rewards, and challenges.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-[28px] border-[4px] border-dark bg-blue-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Platform Activities</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{activitiesCount ?? 0}</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-emerald-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Resource Uploads</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{resourceUploadsCount ?? 0}</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-amber-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Spelling Bee Events</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{spellingBeeCount ?? 0}</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-rose-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Live Activity Events</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{activitiesCount ?? 0}</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-purple-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <Gift className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Resource Ratio</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">
              {activitiesCount ? `${Math.round(((resourceUploadsCount ?? 0) / activitiesCount) * 100)}%` : '--'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden flex flex-col">
          <div className="p-6 border-b-[4px] border-dark bg-sky-100 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-dark tracking-tight">Global Gamification Rules</h2>
          </div>
          <div className="p-6 sm:p-8 space-y-4 flex-1">
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">XP rule engine and multipliers by grade band</div>
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">Badge taxonomy and unlock criteria</div>
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">Leaderboard rules and anti-abuse thresholds</div>
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">Reward catalog configuration and redemption limits</div>
          </div>
        </div>

        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden flex flex-col">
          <div className="p-6 border-b-[4px] border-dark bg-emerald-100 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-dark tracking-tight">Role-Specific Visibility</h2>
          </div>
          <div className="p-6 sm:p-8 space-y-4 flex-1">
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">Students: XP, badges, streaks, achievements</div>
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">Parents: engagement summaries and drop alerts</div>
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">Tutors: assign challenges and trigger rewards</div>
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-lg">Admins: trend monitoring and global challenge templates</div>
          </div>
        </div>
      </div>

      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-6 border-b-[4px] border-dark bg-amber-100 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-dark tracking-tight">Actions</h2>
        </div>
        <div className="p-6 sm:p-8 flex flex-wrap gap-4">
          <Link href="/dash/admin/settings?tab=gamification" className="bg-dark border-[3px] border-dark text-white font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 inline-flex items-center">
            Save Reward Rules
          </Link>
          <Link href="/dash/admin/engagement?action=create-template" className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 inline-flex items-center">
            Create Challenge Template
          </Link>
          <Link href="/dash/admin/engagement?action=leaderboard" className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 inline-flex items-center">
            Configure Leaderboard
          </Link>
          <Link href="/dash/admin/academic?tab=spelling-bee" className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 inline-flex items-center">
            Open Spelling Bee Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
