'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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
  DollarSign,
  Gift,

  Home,
  LifeBuoy,
  MessageCircle,
  NotebookPen,
  PanelTop,
  ShieldCheck,
  ScrollText,
  Settings2,
  Search,
  Star,
  TrendingUp,

  UserCog,
  Users,
  Activity,
  CreditCard,
  Shield,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

import { BandProvider, useBand } from '@/components/dashboards/BandContext';
import DashboardQueryActionBridge from '@/components/dashboards/DashboardQueryActionBridge';
import DashboardToastViewport from '@/components/dashboards/DashboardToastViewport';
import StudentSidebarNav from '@/components/dashboards/StudentSidebarNav';
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
  children,
}: {
  role: string;
  initialBand: LearnerBand;
  viewerName: string;
  viewerSecondaryLabel: string;
  viewerAvatarPath?: string | null;
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isSuperAdmin = role === 'super_admin';
  
  const effectiveRole: 'student' | 'parent' | 'tutor' | 'admin' =
    pathname.startsWith('/dash/parent')
      ? 'parent'
      : pathname.startsWith('/dash/tutor')
        ? 'tutor'
        : pathname.startsWith('/dash/admin')
          ? 'admin'
          : 'student';

  const [timeLabel, setTimeLabel] = useState('--:--');
  const [avatarUrl, setAvatarUrl] = useState<string>(
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(viewerName)}`,
  );
  const showGrade13BottomNav = effectiveRole === 'student' && initialBand === '1-3';
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
      <div className="flex min-h-screen bg-slate-50 text-dark overflow-x-hidden">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-dark/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <aside className={`sticky top-0 z-50 flex h-screen w-[86vw] max-w-[320px] flex-col bg-dark p-5 transition-transform lg:w-72 lg:translate-x-0 lg:flex lg:p-6 shadow-[4px_0_0_#060E1C] ${
          isMobileMenuOpen ? 'fixed translate-x-0' : 'fixed -translate-x-full lg:sticky'
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

        <div className="flex h-screen flex-1 flex-col overflow-hidden bg-slate-50 w-full min-w-0">
          {/* ── Mobile-first header (LinkedIn-inspired) ── */}
          <header className="bg-white border-b border-slate-200 lg:border-b-[3px] lg:border-dark z-20 w-full min-w-0">
            <div className="flex items-center justify-between h-14 lg:h-auto lg:py-4 px-4 sm:px-6 lg:px-8 w-full min-w-0">
              {/* Left: Avatar / Menu */}
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="shrink-0 lg:hidden"
                >
                  <div className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-indigo-500/30">
                    <img src={avatarUrl} alt="You" className="w-full h-full object-cover" />
                  </div>
                </button>
                {/* Desktop: full search + label */}
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="hidden lg:flex items-center rounded-xl border-[3px] border-dark bg-white p-2 text-dark shadow-[2px_2px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none shrink-0"
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
                <div className="hidden lg:flex items-center gap-2 rounded-xl border-[3px] border-dark bg-off-white px-4 py-2 shadow-[2px_2px_0px_#060E1C] shrink-0">
                  <Search className="h-4 w-4 text-dark/50" />
                  <span className="text-xs font-black uppercase tracking-widest text-dark/50">Search</span>
                </div>
                <p className="hidden lg:block truncate text-sm font-black text-dark/60 min-w-0">{roleLabel}</p>
                {effectiveRole === 'student' ? <StudentBandSwitcher /> : null}
              </div>

              {/* Center: Brand (mobile only) */}
              <div className="lg:hidden flex items-center gap-1.5">
                <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Crown className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-black tracking-tight text-slate-800">Edvoura</span>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Mobile search icon */}
                <button type="button" className="lg:hidden relative rounded-full p-2 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all" aria-label="Search">
                  <Search className="h-5 w-5" />
                </button>
                <div className="hidden lg:block rounded-xl border-[3px] border-dark bg-white px-4 py-2 text-right shadow-[2px_2px_0px_#060E1C]">
                  <p suppressHydrationWarning className="text-sm font-black text-dark">{timeLabel}</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-dark/50">Local Time</p>
                </div>
                <button type="button" className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 lg:rounded-xl lg:border-[3px] lg:border-dark lg:bg-white lg:p-2.5 lg:text-dark lg:shadow-[2px_2px_0px_#060E1C] lg:hover:translate-x-[1px] lg:hover:translate-y-[1px] lg:hover:shadow-none active:scale-95 transition-all shrink-0" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                </button>
              </div>
            </div>
          </header>

          <main className={`custom-scrollbar flex-1 overflow-y-auto w-full min-w-0 overflow-x-hidden relative ${
            showGrade13BottomNav ? 'pb-24 p-0 sm:p-5 lg:p-10 xl:p-12' : 'p-4 sm:p-7 lg:p-10 xl:p-12'
          }`}>
            <div className="mx-auto w-full max-w-[1760px] min-w-0">{children}</div>
          </main>
        </div>

        {showGrade13BottomNav ? (
          <nav className="fixed inset-x-0 bottom-0 z-40 bg-white border-t border-slate-200 lg:hidden safe-bottom">
            <div className="mx-auto grid max-w-lg grid-cols-5 px-1">
              <BottomNavItem href="/dash/student" label="Home" icon={Home} active={pathname === '/dash/student'} />
              <BottomNavItem href="/dash/student/subjects" label="Subjects" icon={BookMarked} active={pathname === '/dash/student/subjects'} />
              <BottomNavItem href="/dash/student/homework" label="Tasks" icon={CheckCircle2} active={pathname === '/dash/student/homework' || pathname === '/dash/student/assignments'} />
              <BottomNavItem href="/dash/student/notes" label="Notes" icon={NotebookPen} active={pathname === '/dash/student/notes'} />
              <BottomNavItem href="/dash/student/tracker" label="Progress" icon={TrendingUp} active={pathname === '/dash/student/tracker'} />
            </div>
          </nav>
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

const BottomNavItem = ({ href, icon: Icon, label, active }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string; active?: boolean; }) => (
  <Link href={href} className={`relative flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
    active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
  }`}>
    {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-full bg-indigo-600" />}
    <Icon className={`h-[22px] w-[22px] ${active ? 'stroke-[2.5]' : ''}`} />
    <span className={`text-[10px] leading-tight ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
  </Link>
);

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
    if (!(pathname === basePath || pathname.startsWith(`${basePath}/`))) {
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
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
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
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return (
    <div className="space-y-1.5">
      <p className="mb-2 mt-4 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{isSuperAdmin ? 'Super Admin Workspace' : 'Admin Workspace'}</p>
      {adminNav.filter((item) => (item.superAdminOnly ? isSuperAdmin : true)).map((item) => <NavItem key={`${item.href}-${item.label}`} href={item.href} icon={item.icon} label={item.label} active={isActive(item.href)} />)}
    </div>
  );
}
