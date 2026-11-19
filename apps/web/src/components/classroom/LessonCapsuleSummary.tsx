'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Star,
  CheckCircle2,
  Share2,
  Download,
  Home,
  RotateCcw,
  BookOpen,
  Sparkles,
  Award,
  Check,
  MessageSquare,
  Clock,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface LessonCapsuleSummaryProps {
  lessonTitle: string;
  pupilName: string;
  gradeLevel: string;
  role: 'tutor' | 'student';
  durationMinutes?: number;
  onRejoin: () => void;
  onReturnDashboard: () => void;
}

export function LessonCapsuleSummary({
  lessonTitle,
  pupilName,
  gradeLevel,
  role,
  durationMinutes = 45,
  onRejoin,
  onReturnDashboard,
}: LessonCapsuleSummaryProps) {
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [tutorNote, setTutorNote] = useState(
    `${pupilName || 'The student'} demonstrated outstanding engagement and mastery during today's live session! Worked through chalkboard formulas accurately, asked insightful questions, and completed the check-for-understanding blitz with top marks.`
  );
  const [isEditingNote, setIsEditingNote] = useState(false);

  const competencies = [
    'Concept Definition & Terminology',
    'Chalkboard Step-by-Step Calculation',
    'Interactive 3D / VR Model Exploration',
    'Rapid Pop-Quiz Problem Solving',
  ];

  const handleShareToParent = () => {
    const text = `*Edvoura Learning Hub - Lesson Mastery Capsule*\n\n` +
      `🎓 *Student:* ${pupilName || 'Pupil'} (${gradeLevel || 'Primary'})\n` +
      `📚 *Lesson:* ${lessonTitle || 'Live Coaching Session'}\n` +
      `⏱️ *Duration:* ${durationMinutes} mins\n` +
      `⭐ *Mastery Score:* 5/5 Stars (+150 XP)\n\n` +
      `📝 *Tutor Commendation:*\n"${tutorNote}"\n\n` +
      `View visual whiteboard notes & assignments at: https://www.edvouralearninghub.com/dash/parent`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070D18] text-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto select-none font-sans animate-in zoom-in-95 duration-200">
      <div className="bg-[#0f172a] border-[3px] border-yellow/70 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-center shadow-[10px_10px_0px_#060E1C] space-y-6 my-auto">
        {/* Top Trophy Banner */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-yellow border-2 border-dark text-dark flex items-center justify-center shadow-[3px_3px_0px_#060E1C]">
            <Trophy className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-yellow/20 text-yellow border border-yellow/40">
              Official Edvoura Learning Capsule
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Lesson Session Completed!
            </h2>
            <p className="text-xs sm:text-sm font-bold text-white/70">
              {lessonTitle || '1-on-1 Interactive Tutoring Session'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
            <User className="w-4 h-4 text-sky-400 mx-auto" />
            <p className="text-[10px] font-bold text-white/50 uppercase">Student</p>
            <p className="text-xs font-black text-white truncate">{pupilName || 'Pupil'}</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
            <BookOpen className="w-4 h-4 text-yellow mx-auto" />
            <p className="text-[10px] font-bold text-white/50 uppercase">Grade</p>
            <p className="text-xs font-black text-white truncate">{gradeLevel || 'Primary'}</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
            <Clock className="w-4 h-4 text-emerald-400 mx-auto" />
            <p className="text-[10px] font-bold text-white/50 uppercase">Duration</p>
            <p className="text-xs font-black text-white truncate">{durationMinutes} Mins</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
            <Award className="w-4 h-4 text-amber-400 mx-auto" />
            <p className="text-[10px] font-bold text-white/50 uppercase">Mastery</p>
            <p className="text-xs font-black text-amber-300">5/5 Stars</p>
          </div>
        </div>

        {/* Competencies Mastered */}
        <div className="text-left space-y-2 bg-black/30 p-4 rounded-2xl border border-white/10">
          <p className="text-[10px] font-black uppercase tracking-wider text-yellow flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Key Competencies Covered</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {competencies.map((comp) => (
              <div
                key={comp}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/90"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{comp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tutor Commendation Note */}
        <div className="text-left space-y-2 bg-black/30 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-wider text-yellow flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{role === 'tutor' ? 'Tutor Commendation Note for Parent & Student' : 'Tutor Commendation for You'}</span>
            </p>
            {role === 'tutor' && (
              <button
                onClick={() => setIsEditingNote(!isEditingNote)}
                className="text-[10px] font-bold uppercase text-white/50 hover:text-white underline cursor-pointer"
              >
                {isEditingNote ? 'Done Editing' : 'Edit Note'}
              </button>
            )}
          </div>

          {isEditingNote && role === 'tutor' ? (
            <textarea
              value={tutorNote}
              onChange={(e) => setTutorNote(e.target.value)}
              rows={3}
              className="w-full p-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-medium focus:outline-none focus:border-yellow"
            />
          ) : (
            <p className="text-xs font-medium text-white/80 leading-relaxed italic bg-white/5 p-3 rounded-xl border border-white/5">
              &quot;{tutorNote}&quot;
            </p>
          )}
        </div>

        {/* Actions (Role-Differentiated: Tutors share reports; Students return with rewards) */}
        <div className="space-y-2.5 pt-2">
          {role === 'tutor' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Button
                onClick={handleShareToParent}
                className="h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase border border-dark shadow-[2px_2px_0px_#060E1C] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedShareLink ? <Check className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedShareLink ? 'Report Copied to Clipboard!' : 'Share Capsule to Parent'}</span>
              </Button>

              <Button
                onClick={onReturnDashboard}
                className="h-11 bg-yellow hover:bg-yellow/90 text-dark font-black text-xs uppercase border border-dark shadow-[2px_2px_0px_#060E1C] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={onReturnDashboard}
                className="w-full h-12 bg-yellow hover:bg-yellow/90 text-dark font-black text-sm uppercase border-[2.5px] border-dark shadow-[4px_4px_0px_#060E1C] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-5 h-5" />
                <span>Return to Student Dashboard (+150 XP Saved)</span>
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            onClick={onRejoin}
            className="w-full h-10 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rejoin Classroom Workspace</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
