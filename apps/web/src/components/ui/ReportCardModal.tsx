'use client';

import { useState } from 'react';
import { Award, CheckCircle2, Download, Printer, ShieldCheck, Star, X } from 'lucide-react';

export type ReportCardData = {
  studentName: string;
  gradeLevel: string;
  studentPasscode: string;
  termName: string;
  overallScore: number;
  gradeClassification: string;
  tutorRemark: string;
  aiStrength: string;
  subjects: {
    name: string;
    score: number;
    grade: string;
    remark: string;
  }[];
};

export function ReportCardModal({
  reportData,
  onClose,
}: {
  reportData: ReportCardData;
  onClose: () => void;
}) {
  const [toast, setToast] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    setToast('Preparing Official PDF Report Card download...');
    setTimeout(() => {
      window.print();
      setToast(null);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-[28px] border-[4px] border-dark bg-white p-6 sm:p-10 shadow-[12px_12px_0px_#060E1C] animate-fade-up space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {toast && (
          <div className="p-4 bg-emerald-100 border-[3px] border-dark text-emerald-950 font-black rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-800" />
            <span>{toast}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-[4px] border-dark pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-dark bg-yellow shadow-[3px_3px_0px_#060E1C]">
              <Award className="h-7 w-7 text-dark" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-dark tracking-tight">Official Academic Report Card</h2>
              <p className="text-xs font-bold text-dark/60">{reportData.termName} • Edvoura Learning Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border-[2px] border-dark rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-4 w-4" /> Print
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-yellow hover:bg-yellow/90 border-[2.5px] border-dark rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#060E1C] flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer">
              <X className="h-6 w-6 text-dark" />
            </button>
          </div>
        </div>

        {/* Report Card Document Body */}
        <div id="report-card-print-area" className="p-6 rounded-[24px] border-[3px] border-dark bg-amber-50/40 space-y-6">
          {/* Header Badge & Title */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-[2px] border-dark/20">
            <div>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-dark text-white rounded-md text-[10px] font-black uppercase tracking-widest mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-yellow" /> Official Transcript Verified
              </span>
              <h1 className="text-3xl font-black text-dark">{reportData.studentName}</h1>
              <p className="text-xs font-bold text-dark/70">
                Grade: <span className="font-black text-dark">{reportData.gradeLevel}</span> • Unique Code: <span className="font-black text-dark">{reportData.studentPasscode}</span>
              </p>
            </div>

            <div className="p-4 bg-white border-[3px] border-dark rounded-2xl shadow-[4px_4px_0px_#060E1C] text-center min-w-[150px]">
              <p className="text-[10px] font-black uppercase text-dark/60 tracking-wider">Overall Average</p>
              <p className="text-3xl font-black text-emerald-600">{reportData.overallScore.toFixed(1)}%</p>
              <p className="text-[10px] font-black text-dark bg-yellow px-2 py-0.5 rounded border border-dark mt-1 inline-block">
                {reportData.gradeClassification}
              </p>
            </div>
          </div>

          {/* Subject Scores Table */}
          <div className="overflow-hidden rounded-2xl border-[3px] border-dark bg-white shadow-[4px_4px_0px_#060E1C]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-200 border-b-[3px] border-dark text-xs font-black uppercase tracking-wider text-dark">
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5">Grade</th>
                  <th className="p-3.5">Tutor Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-dark/10 text-xs font-bold text-dark">
                {reportData.subjects.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3.5 font-black">{sub.name}</td>
                    <td className="p-3.5 font-black text-emerald-700">{sub.score}%</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-dark text-white rounded text-[10px] font-black">
                        {sub.grade}
                      </span>
                    </td>
                    <td className="p-3.5 text-dark/80">{sub.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Remarks & AI Strengths Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-2xl border-[2.5px] border-dark bg-blue-50 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-dark/70">👨‍🏫 Lead Tutor Evaluation</p>
              <p className="text-xs font-bold text-dark leading-relaxed">{reportData.tutorRemark}</p>
            </div>

            <div className="p-4 rounded-2xl border-[2.5px] border-dark bg-purple-50 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-dark/70">🤖 Edvoura AI Learning Profile</p>
              <p className="text-xs font-bold text-dark leading-relaxed">{reportData.aiStrength}</p>
            </div>
          </div>

          {/* Stamp & Verification Footer */}
          <div className="pt-4 border-t-[2px] border-dark/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2 text-xs font-black text-dark/70">
              <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
              <span>Verified &amp; Issued by Edvoura Learning Hub Academic Board</span>
            </div>
            <div className="px-4 py-2 bg-white border-[2px] border-dark rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_#060E1C]">
              SEAL: EDV-ACAD-2026-OK
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
