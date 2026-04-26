import Link from 'next/link';
import { Activity, BookOpenCheck, CreditCard, Gift, LifeBuoy, ShieldCheck, UserPlus, Users, ArrowRight } from 'lucide-react';

import RecentUiActionsPanel from '@/components/dashboards/RecentUiActionsPanel';
import { requireAdminAccess } from './_lib/role-guard';
import { getAdminDashboardData } from '@/lib/app-context';

const sectionCards = [
  {
    title: 'Users and Roles',
    description: 'User management, role permissions, parent/student/tutor oversight.',
    href: '/dash/admin/users',
    icon: Users,
    bg: 'bg-emerald-100',
  },
  {
    title: 'Tutors and Approvals',
    description: 'Tutor onboarding, approval workflow, quality and compliance checks.',
    href: '/dash/admin/tutors',
    icon: ShieldCheck,
    bg: 'bg-rose-100',
  },
  {
    title: 'Academic Setup',
    description: 'Subjects, curriculum, grade-band configuration, lesson oversight.',
    href: '/dash/admin/academic',
    icon: BookOpenCheck,
    bg: 'bg-blue-100',
  },
  {
    title: 'Engagement and Rewards',
    description: 'Global XP, badges, streaks, rewards, challenge and spelling bee rules.',
    href: '/dash/admin/engagement',
    icon: Gift,
    bg: 'bg-yellow',
  },
  {
    title: 'Billing and Revenue',
    description: 'Subscriptions, invoices, payment monitoring and finance controls.',
    href: '/dash/admin/finance',
    icon: CreditCard,
    bg: 'bg-sky-100',
  },
  {
    title: 'Support and Moderation',
    description: 'Support ticket queue, content moderation, alerts and notification operations.',
    href: '/dash/admin/support',
    icon: LifeBuoy,
    bg: 'bg-amber-100',
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
    { label: 'Students', value: dashboard.totalStudents.toLocaleString(), bg: 'bg-yellow' },
    { label: 'Tutors', value: dashboard.totalTutors.toLocaleString(), bg: 'bg-emerald-300' },
    { label: 'Parents', value: dashboard.totalParents.toLocaleString(), bg: 'bg-blue-300' },
    { label: 'Active Classes', value: dashboard.totalClasses.toLocaleString(), bg: 'bg-rose-300' },
  ];
  const healthCards = [
    { label: 'OpenRouter Keys', value: dashboard.healthPanel.openRouterKeysConfigured, bg: 'bg-emerald-100' },
    { label: 'Gemini Keys', value: dashboard.healthPanel.geminiKeysConfigured, bg: 'bg-blue-100' },
    { label: 'AI Draft Queue', value: dashboard.healthPanel.aiDraftQueue, bg: 'bg-yellow/60' },
    { label: 'AI Failures (24h)', value: dashboard.healthPanel.aiFailedGenerations24h, bg: 'bg-rose-100' },
    { label: 'Chat Messages (24h)', value: dashboard.healthPanel.chatMessages24h, bg: 'bg-sky-100' },
    { label: 'Silent Channels (24h)', value: dashboard.healthPanel.chatSilentChannels, bg: 'bg-amber-100' },
  ];

  return (
    <div className="mx-auto max-w-[1680px] space-y-10 p-6 sm:p-8 pb-24">
      
      {/* Header Section */}
      <section className="border-[4px] border-dark rounded-[28px] bg-dark text-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-4 min-w-0">
              <span className="inline-flex items-center gap-2 px-4 py-2 border-[3px] border-white bg-dark text-white text-[10px] tracking-[0.2em] font-black shadow-[4px_4px_0px_#ffffff]">
                COMMAND CENTER
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] flex items-center gap-4">
                {title}
                <div className="hidden md:flex h-12 w-12 rounded-2xl border-[3px] border-dark bg-yellow items-center justify-center shadow-[4px_4px_0px_#ffffff] rotate-6">
                  <Activity className="h-6 w-6 text-dark" />
                </div>
              </h1>
              <p className="text-sm md:text-base font-bold text-white/70 max-w-2xl">
                {subtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/dash/admin/analytics"
                className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#ffffff] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-3 h-auto inline-flex items-center"
              >
                Reports and Analytics
              </Link>
              {isSuperAdmin ? (
                <Link
                  href="/dash/admin/audit-logs"
                  className="bg-yellow border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#ffffff] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-3 h-auto inline-flex items-center"
                >
                  Audit Logs
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, bg }) => (
          <div key={label} className={`rounded-3xl border-[4px] border-dark ${bg} p-6 shadow-[6px_6px_0px_#060E1C]`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">{label}</p>
            <p className="mt-2 text-4xl font-black text-dark">{value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-[24px] border-[4px] border-dark bg-white shadow-[8px_8px_0px_#060E1C]">
        <div className="border-b-[4px] border-dark bg-dark p-5 text-white">
          <h2 className="text-2xl font-black tracking-tight">System Health Panel</h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-white/70">
            AI providers, generation queue, and chat delivery pulse
          </p>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {healthCards.map((card) => (
            <div key={card.label} className={`rounded-2xl border-[3px] border-dark ${card.bg} p-4 shadow-[4px_4px_0px_#060E1C]`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-dark/70">{card.label}</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-dark">{card.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>

      {dashboard.pendingTutorApprovals > 0 && (
        <div className="border-[4px] border-dark rounded-[24px] bg-rose-100 shadow-[8px_8px_0px_#060E1C] overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start md:items-center gap-4">
              <div className="h-14 w-14 bg-white border-[3px] border-dark rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_#060E1C] shrink-0">
                <ShieldCheck className="h-7 w-7 text-rose-600" />
              </div>
              <div>
                <p className="text-xl font-black text-dark">
                  {dashboard.pendingTutorApprovals} tutor{dashboard.pendingTutorApprovals > 1 ? 's' : ''} pending approval
                </p>
                <p className="text-sm font-bold text-dark/70 mt-1">Review and approve tutor applications to allow them to start teaching.</p>
              </div>
            </div>
            <Link
              href="/dash/admin/tutors"
              className="bg-dark border-[3px] border-dark text-white font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-8 py-4 shrink-0 inline-flex items-center"
            >
              Review Now
            </Link>
          </div>
        </div>
      )}

      {/* Sections Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sectionCards.map((item) => (
          <div key={item.title} className="border-[4px] border-dark rounded-[24px] bg-white shadow-[8px_8px_0px_#060E1C] overflow-hidden flex flex-col">
            <div className={`p-6 border-b-[4px] border-dark ${item.bg} flex items-center gap-3`}>
              <item.icon className="h-6 w-6 text-dark" />
              <h2 className="text-xl font-black text-dark tracking-tight">{item.title}</h2>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <p className="mb-6 text-sm font-bold text-dark/70 flex-1">{item.description}</p>
              <Link
                href={item.href}
                className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-4 py-3 flex justify-between items-center w-full"
              >
                <span>Open Section</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {dashboard.recentSignups.length > 0 && (
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-off-white flex items-center gap-3">
            <UserPlus className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">Recent Signups</h2>
          </div>
          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b-[4px] border-dark bg-slate-50 text-[10px] font-black uppercase tracking-widest text-dark/50">
                  <tr>
                    <th className="px-6 py-4 border-r-[3px] border-dark/10">Name</th>
                    <th className="px-6 py-4 border-r-[3px] border-dark/10">Email</th>
                    <th className="px-6 py-4 border-r-[3px] border-dark/10">Role</th>
                    <th className="px-6 py-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y-[3px] divide-dark/10">
                  {dashboard.recentSignups.map((u) => (
                    <tr key={u.id} className="hover:bg-yellow/10 transition-colors">
                      <td className="px-6 py-4 font-black text-dark border-r-[3px] border-dark/10">{u.fullName ?? '--'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-dark/70 border-r-[3px] border-dark/10">{u.email}</td>
                      <td className="px-6 py-4 border-r-[3px] border-dark/10">
                        <span className="inline-flex rounded-lg border-[2px] border-dark bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-dark shadow-[2px_2px_0px_#060E1C]">
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-dark/60">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <RecentUiActionsPanel
          viewer={viewer}
          scope="admin"
          title={isSuperAdmin ? 'Recent Super Admin Actions' : 'Recent Admin Actions'}
        />
      </div>
    </div>
  );
}
