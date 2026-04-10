'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';

export default function StudentSidebarNav({ initialBand }: { initialBand: string }) {
  const searchParams = useSearchParams();
  const band = searchParams.get('band') || initialBand;

  if (band === '1-3') {
    return (
      <>
        <a href="/dash/student/classes" className="block text-slate-300 hover:text-white py-1">📚 My Classes Today</a>
        <a href="/dash/student/games" className="block text-slate-300 hover:text-white py-1">🧩 Daily Learning Game</a>
        <a href="/dash/student/stories" className="block text-slate-300 hover:text-white py-1">🐉 Story-based Lessons</a>
        <a href="/dash/student/quiz" className="block text-slate-300 hover:text-white py-1">📝 Simple Quiz</a>
        <div className="pt-4 mt-4 border-t border-slate-700/50">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">My Fun Stuff</p>
          <a href="/dash/student/stickers" className="block text-slate-300 hover:text-white py-1">📖 My Sticker Book</a>
          <a href="/dash/student/rewards" className="block text-slate-300 hover:text-white py-1">⭐ Star Rewards System</a>
          <a href="/dash/student/read" className="block text-slate-300 hover:text-white py-1">🎧 Read-Along Section</a>
          <a href="/dash/student/garden" className="block text-slate-300 hover:text-white py-1">🌱 Progress Garden</a>
        </div>
        <div className="pt-4 mt-4 border-t border-slate-700/50">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Connect</p>
          <a href="/dash/student/tutor" className="block text-slate-300 hover:text-white py-1">👩‍🏫 My Tutor</a>
          <a href="/dash/student/message" className="block text-slate-300 hover:text-white py-1">🔔 Parent Message Bell</a>
        </div>
      </>
    );
  }

  if (band === '4-6') {
    return (
      <>
        <a href="/dash/student/classes" className="block text-slate-300 hover:text-white py-1">⏱️ Live Session Card</a>
        <a href="/dash/student/subjects" className="block text-slate-300 hover:text-white py-1">🔬 Subject Rooms</a>
        <a href="/dash/student/assignments" className="block text-slate-300 hover:text-white py-1">📝 Assignments</a>
        <a href="/dash/student/quiz" className="block text-slate-300 hover:text-white py-1">🎯 Quiz Centre</a>
        <div className="pt-4 mt-4 border-t border-slate-700/50">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">My Progress</p>
          <a href="/dash/student/videos" className="block text-slate-300 hover:text-white py-1">📺 Learning Videos</a>
          <a href="/dash/student/flashcards" className="block text-slate-300 hover:text-white py-1">🗂️ Flashcards</a>
          <a href="/dash/student/tracker" className="block text-slate-300 hover:text-white py-1">📊 Progress Tracker</a>
          <a href="/dash/student/notes" className="block text-slate-300 hover:text-white py-1">📋 Class Notes</a>
        </div>
        <div className="pt-4 mt-4 border-t border-slate-700/50">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Gamification</p>
          <a href="/dash/student/badges" className="block text-slate-300 hover:text-white py-1">🏅 Badge & Level System</a>
          <a href="/dash/student/leaderboard" className="block text-slate-300 hover:text-white py-1">🏆 Leaderboard</a>
          <a href="/dash/student/streak" className="block text-slate-300 hover:text-white py-1">🔥 Streak Tracker</a>
        </div>
      </>
    );
  }

  // 7-12
  return (
    <>
      <a href="/dash/student" className="block text-slate-300 hover:text-white py-1">📊 Dashboard Overview</a>
      <a href="/dash/student/live" className="block text-slate-300 hover:text-white py-1">📹 Live Session Hub</a>
      <a href="/dash/student/assignments" className="block text-slate-300 hover:text-white py-1">📝 Assignment Manager</a>
      <div className="pt-4 mt-4 border-t border-slate-700/50">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Academic Core</p>
        <a href="/dash/student/exam-prep" className="block text-slate-300 hover:text-white py-1">🎓 Exam Prep Centre</a>
        <a href="/dash/student/past-questions" className="block text-slate-300 hover:text-white py-1">📚 Past Questions Bank</a>
        <a href="/dash/student/mock-exams" className="block text-slate-300 hover:text-white py-1">⏱️ Timed Mock Exams</a>
        <a href="/dash/student/analytics" className="block text-slate-300 hover:text-white py-1">📈 Performance Analytics</a>
        <a href="/dash/student/planner" className="block text-slate-300 hover:text-white py-1">📅 Study Planner</a>
      </div>
      <div className="pt-4 mt-4 border-t border-slate-700/50">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Resources</p>
        <a href="/dash/student/notes" className="block text-slate-300 hover:text-white py-1">📋 Class Notes & Recordings</a>
        <a href="/dash/student/library" className="block text-slate-300 hover:text-white py-1">📚 Resource Library</a>
        <a href="/dash/student/tutor-chat" className="block text-slate-300 hover:text-white py-1">💬 Tutor Messaging</a>
      </div>
    </>
  );
}
