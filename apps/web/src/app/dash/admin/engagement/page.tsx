import Link from 'next/link';
import { Award, Flame, Gift, Trophy, Zap } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/server';

export default async function AdminEngagementPage() {
  const supabase = await createClient();

  const [
    { count: activitiesCount },
  ] = await Promise.all([
    supabase.from('learning_activity_events').select('*', { count: 'exact', head: true }),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">Engagement and Rewards</h1>
        <p className="mt-1 text-sm text-slate-600">
          Platform-wide gamification controls for XP, badges, streaks, rewards, and challenges.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Platform Activities', value: activitiesCount ?? 0, icon: Zap },
          { label: 'Badges Awarded', value: 0, icon: Award },
          { label: 'Active Streaks', value: 0, icon: Flame },
          { label: 'Challenges Completed', value: 0, icon: Trophy },
          { label: 'Rewards Issued', value: 0, icon: Gift },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <item.icon className="h-5 w-5 text-emerald-600" />
              <p className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-bold">{item.label}</p>
              <p className="text-2xl font-bold text-slate-900">{item.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Global Gamification Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="rounded-lg border border-slate-200 p-3">XP rule engine and multipliers by grade band</div>
            <div className="rounded-lg border border-slate-200 p-3">Badge taxonomy and unlock criteria</div>
            <div className="rounded-lg border border-slate-200 p-3">Leaderboard rules and anti-abuse thresholds</div>
            <div className="rounded-lg border border-slate-200 p-3">Reward catalog configuration and redemption limits</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role-Specific Visibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="rounded-lg border border-slate-200 p-3">Students: XP, badges, streaks, achievements</div>
            <div className="rounded-lg border border-slate-200 p-3">Parents: engagement summaries and drop alerts</div>
            <div className="rounded-lg border border-slate-200 p-3">Tutors: assign challenges and trigger rewards</div>
            <div className="rounded-lg border border-slate-200 p-3">Admins: trend monitoring and global challenge templates</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/dash/admin/settings?tab=gamification" className="inline-flex items-center justify-center rounded-md bg-edvoura-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-edvoura-navy-light">
          Save Reward Rules
        </Link>
        <Link href="/dash/admin/engagement?action=create-template" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
          Create Challenge Template
        </Link>
        <Link href="/dash/admin/engagement?action=leaderboard" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
          Configure Leaderboard
        </Link>
        <Link href="/dash/admin/academic?tab=spelling-bee" className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
          Open Spelling Bee Settings
        </Link>
      </div>
    </div>
  );
}
