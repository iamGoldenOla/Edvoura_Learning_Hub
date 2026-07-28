import { Star, Trophy, Sparkles, Medal, Coins } from 'lucide-react';
import Link from 'next/link';
import { getStudentDashboardData, requireAppViewer } from '@/lib/app-context';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RewardsPage() {
  const viewer = await requireAppViewer();
  let dashboard;

  try {
    dashboard = await getStudentDashboardData(viewer.accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load rewards.';
    return (
      <div className="max-w-5xl mx-auto bg-white border-[4px] border-dark rounded-[28px] p-10 shadow-[10px_10px_0px_#060E1C]">
        <h1 className="text-3xl font-heading font-black text-dark mb-4">Rewards unavailable</h1>
        <p className="text-sm text-dark/70 font-semibold normal-case mb-6">{message}</p>
        <Link
          href="/dash/student"
          className="inline-flex items-center justify-center px-6 py-3 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#060E1C]"
        >
          Back to Overview
        </Link>
      </div>
    );
  }

  // Calculate dynamic metrics
  const completedCount = dashboard.stats.completedAssignments;
  const classCount = dashboard.stats.activeClasses;
  const stars = completedCount * 8 + classCount * 4;
  const tokens = completedCount * 10;
  const badgesCount = Math.max(1, dashboard.progress.length);

  // Generate dynamic achievements list based on stats
  const dynamicBadges = [];
  if (completedCount > 0) {
    dynamicBadges.push({ icon: "🥇", name: "First Task", desc: "Completed first homework" });
  }
  if (classCount > 0) {
    dynamicBadges.push({ icon: "🏫", name: "Class Hero", desc: `Active in ${classCount} classes` });
  }
  if (Number(dashboard.stats.averageScore) > 70) {
    dynamicBadges.push({ icon: "🌟", name: "Math Wizard", desc: "Average score above 70%" });
  }
  if (Number(dashboard.stats.assignmentCompletionRate) > 80) {
    dynamicBadges.push({ icon: "🚀", name: "Super Scholar", desc: "Over 80% completion rate" });
  }
  dynamicBadges.push({ icon: "💎", name: "Resilient Learner", desc: "Signed up and learning!" });

  // Next Milestone calculations
  const nextTarget = stars < 500 ? 500 : Math.ceil((stars + 1) / 500) * 500;
  const starsNeeded = nextTarget - stars;
  const avatarName = nextTarget === 500 ? "Diamond Avatar" : "Royal Crown Avatar";

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
          description="Earned from lessons & tasks"
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
          value={badgesCount} 
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
          {dynamicBadges.map((badge, index) => (
            <BadgeItem key={index} icon={badge.icon} name={badge.name} date={badge.desc} />
          ))}
        </div>

        <div className="mt-12 p-8 rounded-[40px] bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-yellow border-4 border-white flex items-center justify-center text-4xl animate-bounce shrink-0">
              💎
            </div>
            <div>
              <h3 className="text-2xl font-black">Next Big Reward</h3>
              <p className="text-slate-400 font-bold">
                Reach {nextTarget} Stars to unlock the {avatarName}! (Only {starsNeeded} more stars needed)
              </p>
            </div>
          </div>
          <Link 
            href="/dash/student/garden"
            className="px-8 py-4 bg-white text-slate-900 border-[3px] border-dark rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-slate-100 shadow-[4px_4px_0px_#fff] transition-all"
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
      <div className="h-20 w-20 rounded-[28px] bg-white border-[3px] border-dark flex items-center justify-center mb-6 shadow-[4px_4px_0px_#060E1C] group-hover:scale-110 transition-transform">
        <Icon className={`h-10 w-10 ${textColor}`} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/30 mb-1">{label}</p>
      <p className="text-5xl font-black text-dark mb-2">{value}</p>
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
        <p className="text-[9px] font-bold text-dark/40 uppercase tracking-widest mt-1">{date}</p>
      </div>
    </div>
  );
}
