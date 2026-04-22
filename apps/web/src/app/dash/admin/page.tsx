import Link from 'next/link';
import { Activity, BookOpenCheck, CreditCard, Gift, LifeBuoy, ShieldCheck, UserPlus, Users } from 'lucide-react';

import RecentUiActionsPanel from '@/components/dashboards/RecentUiActionsPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAdminAccess } from './_lib/role-guard';
import { getAdminDashboardData } from '@/lib/app-context';

const sectionCards = [
  {
    title: 'Users and Roles',
    description: 'User management, role permissions, parent/student/tutor oversight.',
    href: '/dash/admin/users',
    icon: Users,
  },
  {
    title: 'Tutors and Approvals',
    description: 'Tutor onboarding, approval workflow, quality and compliance checks.',
    href: '/dash/admin/tutors',
    icon: ShieldCheck,
  },
  {
    title: 'Academic Setup',
    description: 'Subjects, curriculum, grade-band configuration, lesson oversight.',
    href: '/dash/admin/academic',
    icon: BookOpenCheck,
  },
  {
    title: 'Engagement and Rewards',
    description: 'Global XP, badges, streaks, rewards, challenge and spelling bee rules.',
    href: '/dash/admin/engagement',
    icon: Gift,
  },
  {
    title: 'Billing and Revenue',
    description: 'Subscriptions, invoices, payment monitoring and finance controls.',
    href: '/dash/admin/finance',
    icon: CreditCard,
  },
  {
    title: 'Support and Moderation',
    description: 'Support ticket queue, content moderation, alerts and notification operations.',
    href: '/dash/admin/support',
    icon: LifeBuoy,
  },
];

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '--';
  }
};

export default async function AdminDashboard() {
  const { isSuperAdmin, viewer } = await requireAdminAccess();
  const dashboard = await getAdminDashboardData();

  const title = isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard';
  const subtitle = isSuperAdmin
    ? 'Full business, learning, and engagement control center across student, tutor, and parent systems.'
    : 'Operational control center for day-to-day platform, learning, and support workflows.';

  const statCards = [
    { label: 'Students', value: dashboard.totalStudents.toLocaleString() },
    { label: 'Tutors', value: dashboard.totalTutors.toLocaleString() },
    { label: 'Parents', value: dashboard.totalParents.toLocaleString() },
    { label: 'Active Classes', value: dashboard.totalClasses.toLocaleString() },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl bg-slate-900 p-6 text-white">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Activity className="h-6 w-6 text-amber-400" />
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/dash/admin/analytics"
            className="inline-flex items-center justify-center rounded-md border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700"
          >
            Reports and Analytics
          </Link>
          {isSuperAdmin ? (
            <Link
              href="/dash/admin/audit-logs"
              className="inline-flex items-center justify-center rounded-md bg-amber-400 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-amber-300"
            >
              Audit Logs
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {dashboard.pendingTutorApprovals > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    {dashboard.pendingTutorApprovals} tutor{dashboard.pendingTutorApprovals > 1 ? 's' : ''} pending approval
                  </p>
                  <p className="text-xs text-amber-700">Review and approve tutor applications</p>
                </div>
              </div>
              <Link
                href="/dash/admin/tutors"
                className="inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
              >
                Review Now
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sectionCards.map((item) => (
          <Card key={item.title}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <item.icon className="h-5 w-5 text-blue-600" />
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-slate-600">{item.description}</p>
              <Link
                href={item.href}
                className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                Open Section
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {dashboard.recentSignups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Recent Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dashboard.recentSignups.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{u.fullName ?? '--'}</td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 capitalize">
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <RecentUiActionsPanel
        viewer={viewer}
        scope="admin"
        title={isSuperAdmin ? 'Recent Super Admin Actions' : 'Recent Admin Actions'}
      />
    </div>
  );
}
