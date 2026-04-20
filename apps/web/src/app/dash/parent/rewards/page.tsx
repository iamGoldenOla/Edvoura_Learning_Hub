import { Award, Flame, Star, Trophy } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, MetricCard } from '@/components/ui/card';

const rewards = [
  { id: 'rw-1', title: 'Math Sprint Champion', date: 'Apr 10', points: 120 },
  { id: 'rw-2', title: 'Reading Streak', date: 'Apr 08', points: 90 },
  { id: 'rw-3', title: 'Science Challenge', date: 'Apr 05', points: 75 },
];

export default function ParentRewardsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-edvoura-navy">Rewards and Engagement</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track XP, badges, streaks, and challenge completions for your child.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard title="Current XP" value="2,430" description="This term" icon={<Star className="h-4 w-4" />} />
        <MetricCard title="Active Streak" value="9 days" description="Daily learning streak" icon={<Flame className="h-4 w-4" />} />
        <MetricCard title="Badges Earned" value="14" description="Across all subjects" icon={<Award className="h-4 w-4" />} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-edvoura-navy" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rewards.map((reward) => (
            <div key={reward.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{reward.title}</p>
              <p className="mt-1 text-xs text-slate-600">
                {reward.date} | +{reward.points} XP
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
