'use client';

import { useState } from 'react';
import { Share2, Copy, CheckCircle2, ShieldCheck, Gamepad2, X, Lock, Users, Sparkles } from 'lucide-react';

export type KeyStage = 'KS1' | 'KS2' | 'KS3' | 'KS4';

export const getKeyStage = (gradeCode: string): { keyStage: KeyStage; label: string; allowedGrades: string; minGrade: number; maxGrade: number } => {
  const match = gradeCode.match(/\d+/);
  const level = match ? parseInt(match[0], 10) : 1;

  if (level <= 3) {
    return { keyStage: 'KS1', label: 'Key Stage 1 (Lower Primary)', allowedGrades: 'Grades 1, 2, and 3', minGrade: 1, maxGrade: 3 };
  } else if (level <= 6) {
    return { keyStage: 'KS2', label: 'Key Stage 2 (Upper Primary)', allowedGrades: 'Grades 4, 5, and 6', minGrade: 4, maxGrade: 6 };
  } else if (level <= 9) {
    return { keyStage: 'KS3', label: 'Key Stage 3 (Junior Secondary)', allowedGrades: 'Grades 7, 8, and 9', minGrade: 7, maxGrade: 9 };
  } else {
    return { keyStage: 'KS4', label: 'Key Stage 4 (Senior Secondary)', allowedGrades: 'Grades 10, 11, and 12', minGrade: 10, maxGrade: 12 };
  }
};

export function KeyStagePeerChallengeModal({
  gameTitle,
  gameId,
  studentGradeCode,
  studentName,
  onClose,
}: {
  gameTitle: string;
  gameId: string;
  studentGradeCode: string;
  studentName: string;
  onClose: () => void;
}) {
  const ksInfo = getKeyStage(studentGradeCode);
  const [copied, setCopied] = useState(false);

  // Generate unique challenge link
  const challengeCode = `CHAL-${ksInfo.keyStage}-${Date.now().toString(36).toUpperCase()}`;
  const challengeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/dash/student/games/${gameId}?challenge=${challengeCode}&ks=${ksInfo.keyStage}`
    : `https://www.edvouralearninghub.com/dash/student/games/${gameId}?challenge=${challengeCode}&ks=${ksInfo.keyStage}`;

  const handleCopyLink = () => {
    void navigator.clipboard.writeText(challengeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-[28px] border-[4px] border-dark bg-white p-6 sm:p-8 shadow-[12px_12px_0px_#060E1C] animate-fade-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-[3px] border-dark pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 border-[2px] border-dark flex items-center justify-center text-purple-900 shadow-[2px_2px_0px_#060E1C]">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-dark tracking-tight">Challenge a Friend</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-dark/60">Age-Appropriate Matchmaking</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="h-5 w-5 text-dark" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-4">
          <div className="p-4 bg-yellow/20 border-[2.5px] border-dark rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/60">Selected Game</p>
            <p className="text-lg font-black text-dark mt-0.5">{gameTitle}</p>
          </div>

          {/* Age-Appropriate Key Stage Shield Notice */}
          <div className="p-4 bg-sky-100 border-[2.5px] border-dark rounded-2xl space-y-2 shadow-[3px_3px_0px_#060E1C]">
            <div className="flex items-center gap-2 text-sky-950">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <p className="text-xs font-black uppercase tracking-wider">Safety &amp; Key Stage Enforcement Active</p>
            </div>
            <p className="text-xs font-bold text-dark/80 leading-relaxed">
              You are in <strong>{ksInfo.label}</strong>. To keep gaming safe and fair, your link can only be joined by friends in <strong>{ksInfo.allowedGrades}</strong>.
            </p>
          </div>

          {/* Challenge Link Output Box */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-dark/60">Your Peer Game Challenge Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={challengeUrl}
                className="w-full bg-off-white border-[2.5px] border-dark rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-dark truncate outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-yellow text-dark border-[2.5px] border-dark rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#060E1C] hover:bg-yellow-light transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-800" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="w-full bg-dark text-white border-[2.5px] border-dark rounded-xl py-3 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#060E1C] cursor-pointer"
          >
            Done &amp; Return to Play Zone
          </button>
        </div>
      </div>
    </div>
  );
}
