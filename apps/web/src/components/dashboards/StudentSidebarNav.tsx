'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBand } from './BandContext';
import { ArrowLeft } from 'lucide-react';
import {
  BookOpen, Puzzle, Sparkles, PencilLine, Sticker, Star, Headphones, Sprout, GraduationCap, Bell,
  Video, Microscope, ClipboardList, Target, MonitorPlay, Library, BarChart, NotepadText, Award, Trophy, Flame,
  LayoutDashboard, LineChart, Calendar, FolderOpen, LibraryBig, MessageSquare 
} from 'lucide-react';

export default function StudentSidebarNav({ initialBand }: { initialBand: string }) {
  const { band } = useBand();
  const router = useRouter();

  const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => (
    <Link href={href} className="flex items-center gap-3 text-slate-300 hover:text-white py-2 transition-colors">
      <Icon className="w-4 h-4 text-slate-400" />
      <span className="text-sm">{label}</span>
    </Link>
  );

  const BackButton = () => (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-slate-400 hover:text-white py-2 mb-3 transition-colors text-xs uppercase tracking-widest font-bold"
    >
      <ArrowLeft className="w-4 h-4" /> Go Back
    </button>
  );

  if (band === '1-3') {
    return (
      <div className="space-y-1">
        <BackButton />
        <NavItem href="/dash/student" icon={LayoutDashboard} label="Dashboard Home" />
        <NavItem href="/dash/student/classes" icon={BookOpen} label="My Classes Today" />
        <NavItem href="/dash/student/games" icon={Puzzle} label="Daily Learning Game" />
        <NavItem href="/dash/student/stories" icon={Sparkles} label="Story-based Lessons" />
        <NavItem href="/dash/student/quiz" icon={PencilLine} label="Simple Quiz" />
        
        <div className="pt-4 mt-4 border-t border-slate-700/50 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">My Fun Stuff</p>
          <NavItem href="/dash/student/stickers" icon={Sticker} label="My Sticker Book" />
          <NavItem href="/dash/student/rewards" icon={Star} label="Star Rewards System" />
          <NavItem href="/dash/student/read" icon={Headphones} label="Read-Along Section" />
          <NavItem href="/dash/student/garden" icon={Sprout} label="Progress Garden" />
        </div>
        
        <div className="pt-4 mt-4 border-t border-slate-700/50 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Connect</p>
          <NavItem href="/dash/student/tutor" icon={GraduationCap} label="My Tutor" />
          <NavItem href="/dash/student/message" icon={Bell} label="Parent Message Bell" />
        </div>
      </div>
    );
  }

  if (band === '4-6') {
    return (
      <div className="space-y-1">
        <BackButton />
        <NavItem href="/dash/student" icon={LayoutDashboard} label="Dashboard Home" />
        <NavItem href="/dash/student/classes" icon={Video} label="Live Session Card" />
        <NavItem href="/dash/student/subjects" icon={Microscope} label="Subject Rooms" />
        <NavItem href="/dash/student/assignments" icon={ClipboardList} label="Assignments" />
        <NavItem href="/dash/student/quiz" icon={Target} label="Quiz Centre" />
        
        <div className="pt-4 mt-4 border-t border-slate-700/50 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">My Progress</p>
          <NavItem href="/dash/student/videos" icon={MonitorPlay} label="Learning Videos" />
          <NavItem href="/dash/student/flashcards" icon={Library} label="Flashcards" />
          <NavItem href="/dash/student/tracker" icon={BarChart} label="Progress Tracker" />
          <NavItem href="/dash/student/notes" icon={NotepadText} label="Class Notes" />
        </div>
        
        <div className="pt-4 mt-4 border-t border-slate-700/50 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Gamification</p>
          <NavItem href="/dash/student/badges" icon={Award} label="Badge & Level System" />
          <NavItem href="/dash/student/leaderboard" icon={Trophy} label="Leaderboard" />
          <NavItem href="/dash/student/streak" icon={Flame} label="Streak Tracker" />
        </div>
      </div>
    );
  }

  // 7-12
  return (
    <div className="space-y-1">
      <BackButton />
      <NavItem href="/dash/student" icon={LayoutDashboard} label="Dashboard Overview" />
      <NavItem href="/dash/student/live" icon={Video} label="Live Session Hub" />
      <NavItem href="/dash/student/assignments" icon={ClipboardList} label="Assignment Manager" />
      
      <div className="pt-4 mt-4 border-t border-slate-700/50 space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Academic Core</p>
        <NavItem href="/dash/student/exam-prep" icon={GraduationCap} label="Exam Prep Centre" />
        <NavItem href="/dash/student/past-questions" icon={Library} label="Past Questions Bank" />
        <NavItem href="/dash/student/mock-exams" icon={Bell} label="Timed Mock Exams" />
        <NavItem href="/dash/student/analytics" icon={LineChart} label="Performance Analytics" />
        <NavItem href="/dash/student/planner" icon={Calendar} label="Study Planner" />
      </div>
      
      <div className="pt-4 mt-4 border-t border-slate-700/50 space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Resources</p>
        <NavItem href="/dash/student/notes" icon={FolderOpen} label="Class Notes & Recordings" />
        <NavItem href="/dash/student/library" icon={LibraryBig} label="Resource Library" />
        <NavItem href="/dash/student/tutor-chat" icon={MessageSquare} label="Tutor Messaging" />
      </div>
    </div>
  );
}
