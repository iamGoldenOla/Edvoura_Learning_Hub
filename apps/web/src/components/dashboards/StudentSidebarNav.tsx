'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BadgeCheck,
  BookOpen,
  Calendar,
  ClipboardList,
  Flame,
  Gamepad2,
  GraduationCap,
  Layers,
  Layout,
  Library,
  LineChart,
  MessageCircle,
  MessageSquare,
  MonitorPlay,
  NotebookPen,
  PenSquare,
  PlayCircle,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Star,
  Sticker,
  Target,
  Trophy,
  Tv,
  UserCircle2,
  Users,
  Video,
} from 'lucide-react';

import { useBand } from './BandContext';
import type { LearnerBand } from './BandContext';

type NavEntry = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  exact?: boolean;
};

type NavSection = {
  title: string;
  items: NavEntry[];
};

const KNOWN_STUDENT_ROUTES = new Set([
  '/dash/student',
  '/dash/student/analytics',
  '/dash/student/assignments',
  '/dash/student/badges',
  '/dash/student/classes',
  '/dash/student/exam-prep',
  '/dash/student/flashcards',
  '/dash/student/games',
  '/dash/student/garden',
  '/dash/student/leaderboard',
  '/dash/student/library',
  '/dash/student/live',
  '/dash/student/message',
  '/dash/student/mock-exams',
  '/dash/student/notes',
  '/dash/student/past-questions',
  '/dash/student/planner',
  '/dash/student/quiz',
  '/dash/student/read',
  '/dash/student/rewards',
  '/dash/student/stickers',
  '/dash/student/stories',
  '/dash/student/streak',
  '/dash/student/subjects',
  '/dash/student/tracker',
  '/dash/student/tutor',
  '/dash/student/tutor-chat',
  '/dash/student/videos',
  '/dash/profile',
]);

const LOCKED_NAV_BY_BAND: Record<LearnerBand, NavSection[]> = {
  '1-3': [
    {
      title: 'Explorer Core',
      items: [
        { href: '/dash/student', icon: Layout, label: 'Home', exact: true },
        { href: '/dash/student/classes', icon: BookOpen, label: 'Classes' },
        { href: '/dash/student/live', icon: Video, label: 'Join Lesson' },
        { href: '/dash/student/assignments', icon: ClipboardList, label: 'Homework' },
      ],
    },
    {
      title: 'Fun and Practice',
      items: [
        { href: '/dash/student/games', icon: Gamepad2, label: 'Games' },
        { href: '/dash/student/flashcards', icon: Layers, label: 'Flashcards' },
        { href: '/dash/student/read', icon: BookOpen, label: 'Read' },
        { href: '/dash/student/stories', icon: ScrollText, label: 'Stories' },
      ],
    },
    {
      title: 'Rewards',
      items: [
        { href: '/dash/student/garden', icon: Sparkles, label: 'Garden' },
        { href: '/dash/student/stickers', icon: Sticker, label: 'Stickers' },
        { href: '/dash/student/rewards', icon: Star, label: 'Rewards' },
        { href: '/dash/student/tracker', icon: LineChart, label: 'Progress' },
        { href: '/dash/student/streak', icon: Flame, label: 'Streak' },
      ],
    },
    {
      title: 'Account',
      items: [{ href: '/dash/profile', icon: UserCircle2, label: 'Profile' }],
    },
  ],
  '4-6': [
    {
      title: 'Mission Core',
      items: [
        { href: '/dash/student', icon: Layout, label: 'Home', exact: true },
        { href: '/dash/student/planner', icon: Calendar, label: 'Planner' },
        { href: '/dash/student/classes', icon: BookOpen, label: 'Classes' },
        { href: '/dash/student/subjects', icon: GraduationCap, label: 'Subjects' },
        { href: '/dash/student/assignments', icon: ClipboardList, label: 'Assignments' },
      ],
    },
    {
      title: 'Practice',
      items: [
        { href: '/dash/student/games', icon: Gamepad2, label: 'Games' },
        { href: '/dash/student/quiz', icon: Target, label: 'Quiz' },
        { href: '/dash/student/flashcards', icon: Layers, label: 'Flashcards' },
        { href: '/dash/student/library', icon: Library, label: 'Library' },
        { href: '/dash/student/videos', icon: Tv, label: 'Videos' },
      ],
    },
    {
      title: 'Growth',
      items: [
        { href: '/dash/student/tracker', icon: LineChart, label: 'Progress' },
        { href: '/dash/student/streak', icon: Flame, label: 'Streak' },
        { href: '/dash/student/leaderboard', icon: Trophy, label: 'Leaderboard' },
        { href: '/dash/student/badges', icon: BadgeCheck, label: 'Badges' },
        { href: '/dash/student/rewards', icon: Star, label: 'Rewards' },
      ],
    },
    {
      title: 'Support',
      items: [
        { href: '/dash/student/live', icon: Video, label: 'Live Class' },
        { href: '/dash/student/message', icon: MessageSquare, label: 'Messages' },
        { href: '/dash/profile', icon: UserCircle2, label: 'Profile' },
      ],
    },
  ],
  '7-12': [
    {
      title: 'Academic Core',
      items: [
        { href: '/dash/student', icon: Layout, label: 'Home', exact: true },
        { href: '/dash/student/planner', icon: Calendar, label: 'Planner' },
        { href: '/dash/student/classes', icon: BookOpen, label: 'Classes' },
        { href: '/dash/student/subjects', icon: GraduationCap, label: 'Subjects' },
        { href: '/dash/student/assignments', icon: ClipboardList, label: 'Assignments' },
      ],
    },
    {
      title: 'Exam Readiness',
      items: [
        { href: '/dash/student/exam-prep', icon: Target, label: 'Exam Prep' },
        { href: '/dash/student/mock-exams', icon: ShieldCheck, label: 'Mock Exams' },
        { href: '/dash/student/past-questions', icon: ScrollText, label: 'Past Questions' },
        { href: '/dash/student/quiz', icon: PenSquare, label: 'Quiz Center' },
      ],
    },
    {
      title: 'Resources and Revision',
      items: [
        { href: '/dash/student/notes', icon: NotebookPen, label: 'Notes' },
        { href: '/dash/student/library', icon: Library, label: 'Library' },
        { href: '/dash/student/videos', icon: MonitorPlay, label: 'Videos' },
        { href: '/dash/student/read', icon: BookOpen, label: 'Read' },
        { href: '/dash/student/flashcards', icon: Layers, label: 'Flashcards' },
      ],
    },
    {
      title: 'Performance',
      items: [
        { href: '/dash/student/tracker', icon: LineChart, label: 'Subject Mastery' },
        { href: '/dash/student/analytics', icon: LineChart, label: 'Analytics' },
        { href: '/dash/student/streak', icon: Flame, label: 'Streak' },
        { href: '/dash/student/leaderboard', icon: Trophy, label: 'Leaderboard' },
        { href: '/dash/student/badges', icon: BadgeCheck, label: 'Badges' },
        { href: '/dash/student/rewards', icon: Star, label: 'Rewards' },
      ],
    },
    {
      title: 'Communication',
      items: [
        { href: '/dash/student/live', icon: PlayCircle, label: 'Live Room' },
        { href: '/dash/student/tutor', icon: Users, label: 'Tutor' },
        { href: '/dash/student/tutor-chat', icon: MessageCircle, label: 'Tutor Chat' },
        { href: '/dash/student/message', icon: MessageSquare, label: 'Messages' },
      ],
    },
    {
      title: 'Account',
      items: [{ href: '/dash/profile', icon: UserCircle2, label: 'Profile' }],
    },
  ],
};

class SidebarErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Keep silent in UI; fallback renders the locked sidebar.
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const safeHref = (href: string) => (KNOWN_STUDENT_ROUTES.has(href) ? href : '/dash/student');

const isActiveRoute = (pathname: string, href: string, exact?: boolean) =>
  exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

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
  <Link
    href={safeHref(href)}
    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
      active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
    }`}
  >
    <Icon className="h-4 w-4 shrink-0" />
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

const renderSections = (pathname: string, sections: NavSection[]) =>
  sections.map((section, sectionIndex) => (
    <div
      key={section.title}
      className={sectionIndex === 0 ? 'space-y-1.5' : 'mt-4 space-y-1.5 border-t border-slate-800 pt-4'}
    >
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{section.title}</p>
      {section.items.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          active={isActiveRoute(pathname, item.href, item.exact)}
        />
      ))}
    </div>
  ));

function LockedSidebarNav({ initialBand }: { initialBand: LearnerBand }) {
  const pathname = usePathname();
  const sections = LOCKED_NAV_BY_BAND[initialBand] ?? LOCKED_NAV_BY_BAND['7-12'];
  return <div>{renderSections(pathname, sections)}</div>;
}

function StudentSidebarNavContent({ initialBand }: { initialBand: LearnerBand }) {
  const { band } = useBand();
  const pathname = usePathname();
  const activeBand = band || initialBand;
  const sections = LOCKED_NAV_BY_BAND[activeBand] ?? LOCKED_NAV_BY_BAND[initialBand] ?? LOCKED_NAV_BY_BAND['7-12'];

  return <div>{renderSections(pathname, sections)}</div>;
}

export default function StudentSidebarNav({ initialBand }: { initialBand: LearnerBand }) {
  return (
    <SidebarErrorBoundary fallback={<LockedSidebarNav initialBand={initialBand} />}>
      <StudentSidebarNavContent initialBand={initialBand} />
    </SidebarErrorBoundary>
  );
}
