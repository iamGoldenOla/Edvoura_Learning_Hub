'use client';

import { useState } from 'react';
import { Download, Printer, CheckCircle2, Award, X, Sparkles } from 'lucide-react';

export function ParentReportCardModal({
  childName,
  gradeLevel,
  averageScore,
  attendanceRate,
  subjectBreakdown,
  onClose,
}: {
  childName: string;
  gradeLevel: string;
  averageScore: string;
  attendanceRate: string;
  subjectBreakdown: Array<{ subject: string; score: number | null; feedback?: string | null }>;
  onClose: () => void;
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-[28px] border-[4px] border-dark bg-white p-6 sm:p-8 shadow-[12px_12px_0px_#060E1C] animate-fade-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-[3px] border-dark pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow rounded-xl border-[2px] border-dark flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_#060E1C]">
              E
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-dark tracking-tight">Official Academic Report Card</h3>
              <p className="text-xs font-bold text-dark/60">Edvoura Learning Hub • Comprehensive Term Evaluation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl border border-dark/20">
            <X className="h-5 w-5 text-dark" />
          </button>
        </div>

        {/* Report Card Content */}
        <div id="edvoura-report-card" className="space-y-6">
          {/* Child Meta Banner */}
          <div className="p-5 bg-blue-100 border-[2.5px] border-dark rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-[4px_4px_0px_#060E1C]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-dark/60">Student Name</p>
              <p className="text-base font-black text-dark truncate">{childName}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-dark/60">Grade Level</p>
              <p className="text-base font-black text-dark">{gradeLevel}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-dark/60">Overall Score Avg</p>
              <p className="text-base font-black text-emerald-700">{averageScore}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-dark/60">Attendance Rate</p>
              <p className="text-base font-black text-blue-700">{attendanceRate}</p>
            </div>
          </div>

          {/* Subject Mastery Table */}
          <div className="border-[2.5px] border-dark rounded-2xl overflow-hidden bg-slate-50">
            <div className="p-4 bg-dark text-white font-black text-xs uppercase tracking-wider flex justify-between">
              <span>Subject Name</span>
              <span>Mastery Score</span>
            </div>
            <div className="divide-y-[2px] divide-dark/10">
              {subjectBreakdown.length > 0 ? (
                subjectBreakdown.map((item, idx) => (
                  <div key={idx} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-white">
                    <div>
                      <p className="font-black text-sm text-dark">{item.subject}</p>
                      {item.feedback ? (
                        <p className="text-xs font-bold text-dark/60 italic mt-0.5">&quot;{item.feedback}&quot;</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className={`px-3 py-1 rounded-xl border border-dark text-xs font-black font-mono shadow-[2px_2px_0px_#060E1C] ${
                        (item.score ?? 0) >= 80 ? 'bg-emerald-100 text-emerald-950' : 'bg-amber-100 text-amber-950'
                      }`}>
                        {item.score != null ? `${item.score}%` : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs font-bold text-dark/50">
                  Default subjects (Mathematics, English, Basic Science) mapped for {childName}.
                </div>
              )}
            </div>
          </div>

          {/* Guardian Remark */}
          <div className="p-4 bg-yellow/20 border-[2.5px] border-dark rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/60 mb-1">Guardian Recommendation</p>
            <p className="text-xs font-bold text-dark/80">
              {childName} is demonstrating strong academic progress in core topics. Continued engagement with retention practice quizzes is highly recommended.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-dark text-white border-[2.5px] border-dark rounded-xl px-5 py-3 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#060E1C] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="h-4 w-4 text-yellow" /> Print / Save PDF Report Card
          </button>
          <button
            onClick={onClose}
            className="bg-white text-dark border-[2.5px] border-dark rounded-xl px-5 py-3 text-xs font-black uppercase tracking-wider hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
