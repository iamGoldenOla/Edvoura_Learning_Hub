import Link from 'next/link';
import { Activity, BarChart3, ChartSpline, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminAnalyticsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">Reports and Analytics</h1>
        <p className="mt-1 text-sm text-slate-600">
          Cross-platform visibility for academics, engagement, billing, and operations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Daily Active Learners', value: '3,842', icon: Users },
          { label: 'Attendance Rate', value: '92.4%', icon: Activity },
          { label: 'Assignment Completion', value: '88.1%', icon: ChartSpline },
          { label: 'Revenue Growth', value: '+14.8%', icon: BarChart3 },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <item.icon className="h-5 w-5 text-indigo-600" />
              <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">{item.label}</p>
              <p className="text-2xl font-bold text-slate-900">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Exportable Reports</CardTitle>
          <Link
            href="/dash/admin/notifications?action=schedule-weekly-digest"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Schedule Weekly Digest
          </Link>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="rounded-lg border border-slate-200 p-3">Learner-band performance report</div>
          <div className="rounded-lg border border-slate-200 p-3">Tutor delivery quality and response SLAs</div>
          <div className="rounded-lg border border-slate-200 p-3">Parent engagement and notification outcomes</div>
          <div className="rounded-lg border border-slate-200 p-3">Gamification health: XP, badges, streaks, challenges</div>
        </CardContent>
      </Card>
    </div>
  );
}
