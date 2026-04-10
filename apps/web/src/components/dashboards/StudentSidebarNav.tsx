'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBand } from './BandContext';
import {
  BookOpen, Puzzle, Sparkles, PencilLine, Sticker, Star, Headphones, Sprout, GraduationCap, Bell,
  Video, Microscope, ClipboardList, Target, MonitorPlay, Library, BarChart, NotepadText, Award, Trophy, Flame,
  LayoutDashboard, LineChart, Calendar, FolderOpen, LibraryBig, MessageSquare,
  Compass, Zap, Layout, BookMarked
} from 'lucide-react';

const NavItem = ({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active?: boolean }) => (
  <Link 
    href={href} 
    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${
      active 
        ? 'bg-yellow/10 text-yellow border border-yellow/20' 
        : 'text-grey hover:bg-white/5 hover:text-white'
    }`}
  >
    <Icon className={`w-4 h-4 ${active ? 'text-yellow' : 'text-grey group-hover:text-yellow'}`} />
    <span className={`text-[13px] font-bold tracking-tight ${active ? 'text-yellow' : ''}`}>{label}</span>
  </Link>
);

export default function StudentSidebarNav({ initialBand }: { initialBand: string }) {
  const { band } = useBand();
  const pathname = usePathname();

  if (band === '1-3') {
    return (
      <div className="space-y-1.5 reveal-luxury">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-3 mt-6 px-4">Explorer Mode</p>
        <NavItem href="/dash/student/classes" icon={BookOpen} label="My Classes Today" active={pathname === '/dash/student/classes'} />
        <NavItem href="/dash/student/games" icon={Puzzle} label="Play & Learn" active={pathname === '/dash/student/games'} />
        <NavItem href="/dash/student/stories" icon={Sparkles} label="Story Room" active={pathname === '/dash/student/stories'} />
        <NavItem href="/dash/student/quiz" icon={PencilLine} label="Fun Quiz" active={pathname === '/dash/student/quiz'} />
        
        <div className="pt-4 mt-6 border-t border-white/5 space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-3 px-4">My Treasures</p>
          <NavItem href="/dash/student/stickers" icon={Sticker} label="Sticker Book" active={pathname === '/dash/student/stickers'} />
          <NavItem href="/dash/student/rewards" icon={Star} label="Star Rewards" active={pathname === '/dash/student/rewards'} />
          <NavItem href="/dash/student/garden" icon={Sprout} label="Magic Garden" active={pathname === '/dash/student/garden'} />
        </div>
      </div>
    );
  }

  if (band === '4-6') {
    return (
      <div className="space-y-1.5 reveal-luxury">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-3 mt-6 px-4">Learning Hub</p>
        <NavItem href="/dash/student/subjects" icon={Layout} label="Subject Rooms" active={pathname === '/dash/student/subjects'} />
        <NavItem href="/dash/student/assignments" icon={ClipboardList} label="Assignments" active={pathname === '/dash/student/assignments'} />
        <NavItem href="/dash/student/quiz" icon={Target} label="Quiz Centre" active={pathname === '/dash/student/quiz'} />
        
        <div className="pt-4 mt-6 border-t border-white/5 space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-3 px-4">Achievement</p>
          <NavItem href="/dash/student/badges" icon={Award} label="Badges & Rank" active={pathname === '/dash/student/badges'} />
          <NavItem href="/dash/student/leaderboard" icon={Trophy} label="Leaderboard" active={pathname === '/dash/student/leaderboard'} />
          <NavItem href="/dash/student/streak" icon={Flame} label="Daily Streak" active={pathname === '/dash/student/streak'} />
        </div>
      </div>
    );
  }

  // 7-12
  return (
    <div className="space-y-1.5 reveal-luxury">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-3 mt-6 px-4">Academic Portal</p>
      <NavItem href="/dash/student/live" icon={Video} label="Live Sessions" active={pathname === '/dash/student/live'} />
      <NavItem href="/dash/student/assignments" icon={ClipboardList} label="Task Manager" active={pathname === '/dash/student/assignments'} />
      <NavItem href="/dash/student/exam-prep" icon={GraduationCap} label="Exam Prep" active={pathname === '/dash/student/exam-prep'} />
      
      <div className="pt-4 mt-6 border-t border-white/5 space-y-1.5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-3 px-4">Performance</p>
        <NavItem href="/dash/student/analytics" icon={LineChart} label="Analytics" active={pathname === '/dash/student/analytics'} />
        <NavItem href="/dash/student/past-questions" icon={Library} label="Question Bank" active={pathname === '/dash/student/past-questions'} />
        <NavItem href="/dash/student/planner" icon={Calendar} label="Study Planner" active={pathname === '/dash/student/planner'} />
      </div>
      
      <div className="pt-4 mt-6 border-t border-white/5 space-y-1.5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-3 px-4">Resources</p>
        <NavItem href="/dash/student/notes" icon={BookMarked} label="Recordings" active={pathname === '/dash/student/notes'} />
        <NavItem href="/dash/student/tutor-chat" icon={MessageSquare} label="Tutor Chat" active={pathname === '/dash/student/tutor-chat'} />
      </div>
    </div>
  );
}
