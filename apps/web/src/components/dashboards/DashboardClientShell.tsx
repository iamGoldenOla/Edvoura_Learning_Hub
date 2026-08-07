'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import {
  BarChart3,
  ArrowLeft,
  BookMarked,
  BookCheck,
  Bell,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Crown,
  Info,
  DollarSign,
  Flame,
  Gamepad2,
  Gift,
  Home,
  Layers,
  LifeBuoy,
  MessageCircle,
  NotebookPen,
  PanelTop,
  PlayCircle,
  ShieldCheck,
  ScrollText,
  Settings2,
  Search,
  Star,
  TrendingUp,
  User,
  UserCog,
  Users,
  Activity,
  CreditCard,
  Shield,
  Sparkles,
  Menu,
  Volume2,
  X,
} from 'lucide-react';

import { BandProvider, useBand } from '@/components/dashboards/BandContext';
import DashboardQueryActionBridge from '@/components/dashboards/DashboardQueryActionBridge';
import DashboardToastViewport from '@/components/dashboards/DashboardToastViewport';
import StudentSidebarNav, { StudentBottomNav } from '@/components/dashboards/StudentSidebarNav';
import { LogoutButton } from '@/components/ui/logout-button';
import type { LearnerBand } from '@/components/dashboards/BandContext';
import { createClient } from '@/utils/supabase/client';

const NavItem = ({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) => (
  <Link href={href} className="block group mb-1.5">
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all border-[3px] ${
        active 
          ? 'bg-yellow border-dark text-dark shadow-[3px_3px_0px_#ffffff] translate-x-[-2px] translate-y-[-2px]' 
          : 'bg-transparent border-transparent text-white/80 hover:bg-white/10 hover:border-white/20 hover:text-white'
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="text-sm font-black tracking-tight">{label}</span>
      {active ? <div className="ml-auto h-2.5 w-2.5 rounded-full border-[2px] border-dark bg-white" /> : null}
    </div>
  </Link>
);

export default function DashboardClientShell({
  role,
  initialBand,
  viewerName,
  viewerSecondaryLabel,
  viewerAvatarPath,
  subscriptionStatus,
  hasAccess = true,
  children,
}: {
  role: string;
  initialBand: LearnerBand;
  viewerName: string;
  viewerSecondaryLabel: string;
  viewerAvatarPath?: string | null;
  subscriptionStatus?: string | null;
  hasAccess?: boolean;
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isSuperAdmin = role === 'super_admin';
  
  const effectiveRole: 'student' | 'parent' | 'tutor' | 'admin' =
    pathname.startsWith('/dash/parent')
      ? 'parent'
      : pathname.startsWith('/dash/tutor')
        ? 'tutor'
        : pathname.startsWith('/dash/admin')
          ? 'admin'
          : 'student';

  useEffect(() => {
    if (hasAccess === false) {
      if (effectiveRole === 'parent' && pathname !== '/dash/parent/billing' && pathname !== '/dash/profile') {
        router.push('/dash/parent/billing');
      } else if (effectiveRole === 'student' && pathname !== '/dash/student/subscription-inactive' && pathname !== '/dash/profile') {
        router.push('/dash/student/subscription-inactive');
      }
    }
  }, [hasAccess, effectiveRole, pathname, router]);

  const [timeLabel, setTimeLabel] = useState('--:--');
  const [avatarUrl, setAvatarUrl] = useState<string>(
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(viewerName)}`,
  );
  const showStudentBottomNav = effectiveRole === 'student';
  const showTutorBottomNav = effectiveRole === 'tutor';
  const showParentBottomNav = effectiveRole === 'parent';
  const showAdminBottomNav = effectiveRole === 'admin';
  const roleLabel =
    effectiveRole === 'tutor'
      ? 'Tutor teaching dashboard'
      : effectiveRole === 'parent'
        ? 'Parent dashboard'
        : effectiveRole === 'admin'
          ? isSuperAdmin
            ? 'Super Admin dashboard'
            : 'Admin dashboard'
          : 'Student learning dashboard';

  useEffect(() => {
    const updateTime = () => {
      setTimeLabel(
        new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadAvatar = async () => {
      if (!viewerAvatarPath) {
        setAvatarUrl(`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(viewerName)}`);
        return;
      }
      const supabase = createClient();
      const signed = await supabase.storage.from('avatars').createSignedUrl(viewerAvatarPath, 60 * 60 * 24 * 7);
      if (cancelled) return;
      if (!signed.error && signed.data?.signedUrl) {
        setAvatarUrl(signed.data.signedUrl);
        return;
      }
      const fallback = supabase.storage.from('avatars').getPublicUrl(viewerAvatarPath);
      if (fallback.data.publicUrl) {
        setAvatarUrl(fallback.data.publicUrl);
      }
    };
    loadAvatar();
    return () => { cancelled = true; };
  }, [viewerAvatarPath, viewerName]);

  // Close mobile menu on navigation
  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setIsMobileMenuOpen(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname, isMobileMenuOpen]);

  return (
    <BandProvider initialBand={initialBand}>
      <DashboardToastViewport />
      <DashboardQueryActionBridge />
      <div className="flex min-h-screen bg-off-white text-dark overflow-x-hidden">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-dark/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <aside className={`fixed top-0 z-50 flex h-screen w-[86vw] max-w-[320px] flex-col bg-dark p-5 transition-transform lg:sticky lg:w-72 lg:translate-x-0 lg:p-6 shadow-[4px_0_0_#060E1C] ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="mb-8 flex items-center gap-4 rounded-2xl border-[3px] border-dark bg-yellow px-4 py-4 shadow-[4px_4px_0px_#ffffff]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border-[3px] border-dark bg-white text-dark shadow-[2px_2px_0px_#060E1C]">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-black text-dark tracking-tight leading-none">EDVOURA</p>
              <p className="text-[9px] font-black text-dark/70 uppercase tracking-[0.2em] mt-1">
                {effectiveRole.toUpperCase()} PORTAL
              </p>
            </div>
          </div>

          <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto pr-2 pb-6">
            <p className="px-4 mb-2 mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Navigation</p>

            {hasAccess === false ? (
              <>
                {effectiveRole === 'parent' ? (
                  <NavItem
                    href="/dash/parent/billing"
                    icon={CreditCard}
                    label="Billing & Subscription"
                    active={pathname === '/dash/parent/billing'}
                  />
                ) : null}
                {effectiveRole === 'student' ? (
                  <NavItem
                    href="/dash/student/subscription-inactive"
                    icon={Info}
                    label="Subscription Inactive"
                    active={pathname === '/dash/student/subscription-inactive'}
                  />
                ) : null}
              </>
            ) : (
              <>
                <NavItem
                  href={`/dash/${effectiveRole}`}
                  icon={Crown}
                  label="Overview"
                  active={pathname === `/dash/${effectiveRole}`}
                />

                {effectiveRole === 'student' ? <StudentSidebarNav initialBand={initialBand} /> : null}
                {effectiveRole === 'tutor' ? <TutorSidebarNav /> : null}
                {effectiveRole === 'parent' ? <ParentSidebarNav /> : null}
                {effectiveRole === 'admin' ? <AdminSidebarNav isSuperAdmin={isSuperAdmin} /> : null}
              </>
            )}

            <p className="px-4 mb-2 mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">System</p>
            <NavItem href="/" icon={ArrowLeft} label="Exit Portal" />
          </nav>

          <div className="mt-4 space-y-4 border-t-[3px] border-white/10 pt-6">
            <div className="flex items-center gap-3 rounded-2xl border-[3px] border-dark bg-white p-3 shadow-[4px_4px_0px_#ffffff]">
              <div className="h-10 w-10 overflow-hidden rounded-xl border-[2px] border-dark bg-off-white">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-dark">{viewerName}</p>
                <p className="truncate text-[10px] font-bold text-dark/60 uppercase tracking-widest">
                  {viewerSecondaryLabel || effectiveRole}
                </p>
              </div>
            </div>
            <LogoutButton variant="brutalist" />
          </div>
        </aside>

        <div className="flex h-screen flex-1 flex-col overflow-hidden bg-off-white w-full min-w-0">
          <header className="border-b-[4px] border-dark bg-white px-4 py-3 sm:px-8 sm:py-4 z-[45] relative w-full min-w-0">
            <div className="flex items-center justify-between gap-2 sm:gap-4 w-full min-w-0">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3 flex-shrink">
                {/* Mobile Menu Toggle */}
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="rounded-xl border-[3px] border-dark bg-white p-2 text-dark shadow-[2px_2px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none lg:hidden shrink-0"
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>

                <div className="hidden sm:flex items-center gap-2 rounded-xl border-[3px] border-dark bg-off-white px-4 py-2 shadow-[2px_2px_0px_#060E1C] shrink-0">
                  <Search className="h-4 w-4 text-dark/50" />
                  <span className="text-xs font-black uppercase tracking-widest text-dark/50">Search</span>
                </div>
                <p className="truncate text-xs sm:text-sm font-black text-dark/60 min-w-0">{roleLabel}</p>
                {subscriptionStatus && (
                  <span
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border-[2.5px] border-dark px-2.5 py-1 text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_#060E1C] shrink-0"
                    style={{
                      background: subscriptionStatus === 'active' ? '#dcfce7'
                        : subscriptionStatus === 'trialing' ? '#fef3c7'
                        : subscriptionStatus === 'past_due' ? '#ffedd5'
                        : '#fecaca',
                      color: subscriptionStatus === 'active' ? '#15803d'
                        : subscriptionStatus === 'trialing' ? '#a16207'
                        : subscriptionStatus === 'past_due' ? '#c2410c'
                        : '#b91c1c',
                    }}
                  >
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: subscriptionStatus === 'active' ? '#22c55e'
                        : subscriptionStatus === 'trialing' ? '#f59e0b'
                        : subscriptionStatus === 'past_due' ? '#f97316'
                        : '#ef4444',
                    }} />
                    {subscriptionStatus === 'active' ? 'Active'
                      : subscriptionStatus === 'trialing' ? 'Trial'
                      : subscriptionStatus === 'past_due' ? 'Past Due'
                      : subscriptionStatus === 'canceled' ? 'Canceled'
                      : 'Inactive'}
                  </span>
                )}
                {effectiveRole === 'student' && role !== 'student' ? <StudentBandSwitcher /> : null}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="hidden sm:block rounded-xl border-[3px] border-dark bg-white px-3 py-2 text-right shadow-[2px_2px_0px_#060E1C]">
                  <p suppressHydrationWarning className="text-sm font-black text-dark">{timeLabel}</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-dark/50">Local Time</p>
                </div>
                <button type="button" className="relative rounded-xl border-[3px] border-dark bg-white p-2 sm:p-2.5 text-dark transition-all hover:translate-x-[1px] hover:translate-y-[1px] shadow-[2px_2px_0px_#060E1C] hover:shadow-none active:scale-95 shrink-0" aria-label="Notifications">
                  <Bell className="h-5 w-5 sm:h-5 sm:w-5" />
                  <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-[2px] border-white bg-rose-500" />
                </button>
                <div className="lg:hidden shrink-0">
                  <LogoutButton />
                </div>
              </div>
            </div>
          </header>

          <main className={`custom-scrollbar flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 xl:p-12 w-full min-w-0 overflow-x-hidden relative ${showStudentBottomNav || showTutorBottomNav || showParentBottomNav || showAdminBottomNav ? 'pb-28' : ''}`}>
            <div className="mx-auto w-full max-w-[1760px] min-w-0">{children}</div>
          </main>
        </div>

        {showStudentBottomNav ? (
          <StudentBottomNav initialBand={initialBand} />
        ) : null}
        {showTutorBottomNav ? (
          <TutorBottomNav />
        ) : null}
        {showParentBottomNav ? (
          <ParentBottomNav />
        ) : null}
        {showAdminBottomNav ? (
          <AdminBottomNav isSuperAdmin={isSuperAdmin} />
        ) : null}
      </div>
    </BandProvider>
  );
}

function StudentBandSwitcher() {
  const { band, setBand } = useBand();
  return (
    <label className="hidden items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 md:flex">
      Grade View
      <select aria-label="Switch student grade dashboard view" value={band} onChange={(event) => setBand(event.target.value as LearnerBand)} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
        <option value="1-3">Grades 1-3</option>
        <option value="4-6">Grades 4-6</option>
        <option value="7-12">Grades 7-12</option>
      </select>
    </label>
  );
}



function TutorSidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tutorNav = [
    { href: '/dash/tutor/schedule', label: "Today's Classes", icon: CalendarClock },
    { href: '/dash/tutor/roster', label: 'Students', icon: Users },
    { href: '/dash/tutor/lesson-notes', label: 'Lesson Notes & Plans', icon: ScrollText },
    { href: '/dash/tutor/builder?tool=assignment', label: 'Assignments', icon: NotebookPen },
    { href: '/dash/tutor/builder?tool=quiz', label: 'Quizzes & Challenges', icon: Star },
    { href: '/dash/tutor/grading', label: 'Grading Queue', icon: ClipboardCheck },
    { href: '/dash/tutor/roster', label: 'Engagement Insights', icon: TrendingUp },
    { href: '/dash/tutor/messages', label: 'Messages', icon: MessageCircle },
    { href: '/dash/tutor/builder?tool=resources', label: 'Resources', icon: BookOpen },
    { href: '/dash/tutor/earnings', label: 'Invoice and Payment', icon: DollarSign },
    { href: '/dash/tutor/profile', label: 'Profile and Availability', icon: Settings2 },
  ];
  const toolsNav = [
    { href: '/dash/tutor/schedule', label: 'Start or Join Lesson', icon: PanelTop },
    { href: '/dash/tutor/roster', label: 'Attendance and Performance', icon: BookCheck },
    { href: '/dash/tutor/ai', label: 'Edvoura AI Generator', icon: Sparkles },
  ];
  const isActive = (href: string) => {
    const [basePath, queryString] = href.split('?');
    if (basePath === '/dash/tutor') {
      if (pathname !== basePath) return false;
    } else if (!(pathname === basePath || pathname.startsWith(`${basePath}/`))) {
      return false;
    }

    if (!queryString) {
      return true;
    }

    const hrefParams = new URLSearchParams(queryString);
    return Array.from(hrefParams.entries()).every(
      ([key, value]) => searchParams.get(key) === value,
    );
  };
  return (
    <div className="space-y-1.5">
      <p className="mb-2 mt-4 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Tutor Workspace</p>
      {tutorNav.map((item) => <NavItem key={`${item.href}-${item.label}`} href={item.href} icon={item.icon} label={item.label} active={isActive(item.href)} />)}
      <div className="mt-4 space-y-1.5 border-t-[3px] border-white/10 pt-4">
        <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Teaching Tools</p>
        {toolsNav.map((item) => <NavItem key={item.label} href={item.href} icon={item.icon} label={item.label} active={isActive(item.href)} />)}
      </div>
    </div>
  );
}

const BottomNavItem = ({ href, icon: Icon, label, active }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string; active?: boolean; }) => (
  <Link href={href} className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[9px] font-black uppercase tracking-wider transition-all shrink-0 min-w-[52px] ${
    active
      ? 'bg-yellow border-[2px] border-dark text-dark shadow-[2px_2px_0px_#060E1C]'
      : 'text-dark/40 hover:text-dark/70 border-[2px] border-transparent'
  }`}>
    <Icon className="h-4 w-4" />
    <span className="whitespace-nowrap">{label}</span>
  </Link>
);

function TutorBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const allItems = [
    { href: '/dash/tutor', label: "Home", icon: Crown },
    { href: '/dash/tutor/schedule', label: "Classes", icon: CalendarClock },
    { href: '/dash/tutor/roster', label: 'Students', icon: Users },
    { href: '/dash/tutor/lesson-notes', label: 'Notes', icon: ScrollText },
    { href: '/dash/tutor/builder?tool=assignment', label: 'Assign', icon: NotebookPen },
    { href: '/dash/tutor/builder?tool=quiz', label: 'Quizzes', icon: Star },
    { href: '/dash/tutor/grading', label: 'Grading', icon: ClipboardCheck },
    { href: '/dash/tutor/messages', label: 'Messages', icon: MessageCircle },
    { href: '/dash/tutor/earnings', label: 'Invoice', icon: DollarSign },
    { href: '/dash/tutor/profile', label: 'Profile', icon: Settings2 },
    { href: '/dash/tutor/ai', label: 'AI Gen', icon: Sparkles },
  ];

  const isActive = (href: string) => {
    const [basePath, queryString] = href.split('?');
    if (basePath === '/dash/tutor') {
      if (pathname !== basePath) return false;
    } else if (!(pathname === basePath || pathname.startsWith(`${basePath}/`))) {
      return false;
    }
    if (!queryString) {
      return true;
    }
    const hrefParams = new URLSearchParams(queryString);
    return Array.from(hrefParams.entries()).every(
      ([key, value]) => searchParams.get(key) === value,
    );
  };
  
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t-[3px] border-dark bg-white py-1.5 lg:hidden">
      <div className="mx-auto flex items-center gap-1 overflow-x-auto hide-scrollbar px-3 pb-1">
        {allItems.map((item) => (
          <BottomNavItem key={`${item.href}-${item.label}`} href={item.href} icon={item.icon} label={item.label} active={isActive(item.href)} />
        ))}
      </div>
    </nav>
  );
}

function ParentSidebarNav() {
  const pathname = usePathname();
  const parentNav = [
    { href: '/dash/parent/children', label: 'Child Snapshot', icon: Users },
    { href: '/dash/parent/monitor', label: 'Lessons & Attendance', icon: CalendarClock },
    { href: '/dash/parent/reports', label: 'Homework & Progress', icon: Activity },
    { href: '/dash/parent/rewards', label: 'Rewards & Engagement', icon: Star },
    { href: '/dash/parent/messages', label: 'Messages', icon: MessageCircle },
    { href: '/dash/parent/billing', label: 'Billing', icon: CreditCard },
    { href: '/dash/parent/notifications', label: 'Notifications', icon: Bell },
    { href: '/dash/parent?ai-insight=true', label: 'Edvoura AI Insights', icon: Sparkles },
    { href: '/dash/profile', label: 'Consent & Settings', icon: Shield },
  ];
  const isActive = (href: string) => {
    if (href === '/dash/parent') {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  return (
    <div className="space-y-1.5">
      <p className="mb-2 mt-4 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Parent Workspace</p>
      {parentNav.map((item) => <NavItem key={`${item.href}-${item.label}`} href={item.href} icon={item.icon} label={item.label} active={isActive(item.href)} />)}
    </div>
  );
}

function AdminSidebarNav({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const pathname = usePathname();
  const adminNav = [
    { href: '/dash/admin', label: 'Operational Overview', icon: Activity, superAdminOnly: false },
    { href: '/dash/admin/users', label: 'Users & Roles', icon: UserCog, superAdminOnly: true },
    { href: '/dash/admin/students', label: 'Student Management', icon: Users, superAdminOnly: false },
    { href: '/dash/admin/parents', label: 'Parent Management', icon: Users, superAdminOnly: false },
    { href: '/dash/admin/tutors', label: 'Tutors & Approvals', icon: ShieldCheck, superAdminOnly: false },
    { href: '/dash/admin/academic', label: 'Academic Setup', icon: BookMarked, superAdminOnly: false },
    { href: '/dash/admin/lessons', label: 'Lesson Oversight', icon: BookCheck, superAdminOnly: false },
    { href: '/dash/admin/assignments', label: 'Assignment Oversight', icon: ClipboardCheck, superAdminOnly: false },
    { href: '/dash/admin/engagement', label: 'Engagement & Rewards', icon: Gift, superAdminOnly: false },
    { href: '/dash/admin/finance', label: 'Billing & Revenue', icon: DollarSign, superAdminOnly: false },
    { href: '/dash/admin/finance/plans', label: 'Subscription Plans', icon: CreditCard, superAdminOnly: true },
    { href: '/dash/admin/ai', label: 'AI Control Center', icon: Sparkles, superAdminOnly: false },
    { href: '/dash/admin/notifications', label: 'Notification Center', icon: Bell, superAdminOnly: false },
    { href: '/dash/admin/support', label: 'Support & Moderation', icon: LifeBuoy, superAdminOnly: false },
    { href: '/dash/admin/analytics', label: 'Reports & Analytics', icon: BarChart3, superAdminOnly: false },
    { href: '/dash/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList, superAdminOnly: true },
    { href: '/dash/admin/settings', label: 'Settings', icon: Settings2, superAdminOnly: true },
  ];
  const isActive = (href: string) => {
    if (href === '/dash/admin') {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  return (
    <div className="space-y-1.5">
      <p className="mb-2 mt-4 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{isSuperAdmin ? 'Super Admin Workspace' : 'Admin Workspace'}</p>
      {adminNav.filter((item) => (item.superAdminOnly ? isSuperAdmin : true)).map((item) => <NavItem key={`${item.href}-${item.label}`} href={item.href} icon={item.icon} label={item.label} active={isActive(item.href)} />)}
    </div>
  );
}

function ParentBottomNav() {
  const pathname = usePathname();
  const parentNav = [
    { href: '/dash/parent/children', label: 'Children', icon: Users },
    { href: '/dash/parent/monitor', label: 'Monitor', icon: CalendarClock },
    { href: '/dash/parent/reports', label: 'Reports', icon: Activity },
    { href: '/dash/parent/rewards', label: 'Rewards', icon: Star },
    { href: '/dash/parent/messages', label: 'Messages', icon: MessageCircle },
    { href: '/dash/parent/billing', label: 'Billing', icon: CreditCard },
    { href: '/dash/parent/notifications', label: 'Alerts', icon: Bell },
    { href: '/dash/profile', label: 'Settings', icon: Shield },
  ];
  const isActive = (href: string) => {
    if (href === '/dash/parent') {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t-[3px] border-dark bg-white py-1.5 lg:hidden">
      <div className="mx-auto flex items-center gap-1 overflow-x-auto hide-scrollbar px-3 pb-1">
        {parentNav.map((item) => (
          <BottomNavItem key={`${item.href}-${item.label}`} href={item.href} icon={item.icon} label={item.label} active={isActive(item.href)} />
        ))}
      </div>
    </nav>
  );
}

function AdminBottomNav({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const pathname = usePathname();
  const adminNav = [
    { href: '/dash/admin', label: 'Overview', icon: Activity, superAdminOnly: false },
    { href: '/dash/admin/users', label: 'Users', icon: UserCog, superAdminOnly: true },
    { href: '/dash/admin/students', label: 'Students', icon: Users, superAdminOnly: false },
    { href: '/dash/admin/tutors', label: 'Tutors', icon: ShieldCheck, superAdminOnly: false },
    { href: '/dash/admin/finance', label: 'Finance', icon: DollarSign, superAdminOnly: false },
    { href: '/dash/admin/ai', label: 'AI', icon: Sparkles, superAdminOnly: false },
    { href: '/dash/admin/support', label: 'Support', icon: LifeBuoy, superAdminOnly: false },
    { href: '/dash/admin/settings', label: 'Settings', icon: Settings2, superAdminOnly: true },
  ];
  const isActive = (href: string) => {
    if (href === '/dash/admin') {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t-[3px] border-dark bg-white py-1.5 lg:hidden">
      <div className="mx-auto flex items-center gap-1 overflow-x-auto hide-scrollbar px-3 pb-1">
        {adminNav.filter((item) => (item.superAdminOnly ? isSuperAdmin : true)).map((item) => (
          <BottomNavItem key={`${item.href}-${item.label}`} href={item.href} icon={item.icon} label={item.label} active={isActive(item.href)} />
        ))}
      </div>
    </nav>
  );
}

