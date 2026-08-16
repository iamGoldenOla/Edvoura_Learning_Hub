'use client';

import React, { useState } from 'react';
import { X, Send, Users, BookOpen, CheckCircle2, ShieldCheck, Bell, Sparkles } from 'lucide-react';

interface PublishTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteTitle: string;
  gradeLevel: string;
  unlockedWeek: number;
  isAlreadyPublished: boolean;
  onConfirmPublish: (selectedClass: string, selectedStudents: string[], notifyParents: boolean) => void;
}

const MOCK_STUDENTS = [
  { id: 'EDV-STU-TITOMI-2026', name: 'Titomi Lawson', grade: 'Primary 3 / Grade 3', avatar: '👧🏽' },
  { id: 'EDV-STU-JEDIDIAHZ-2026', name: 'James Jedidiahz', grade: 'Primary 3 / Grade 3', avatar: '👦🏽' },
  { id: 'EDV-STU-SARAH-2026', name: 'Sarah Jenkins', grade: 'Primary 1 / Grade 1', avatar: '👧🏼' },
  { id: 'EDV-STU-DAVID-2026', name: 'David Adebayo', grade: 'Primary 1 / Grade 1', avatar: '👦🏿' },
];

export function PublishTargetModal({
  isOpen,
  onClose,
  noteTitle,
  gradeLevel,
  unlockedWeek,
  isAlreadyPublished,
  onConfirmPublish,
}: PublishTargetModalProps) {
  const [targetScope, setTargetScope] = useState<'all_class' | 'specific_students'>('all_class');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    MOCK_STUDENTS.map((s) => s.id)
  );
  const [notifyParents, setNotifyParents] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  function toggleStudent(id: string) {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((sId) => sId !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  }

  function handlePublish() {
    setIsSuccess(true);
    setTimeout(() => {
      onConfirmPublish(
        targetScope === 'all_class' ? `All ${gradeLevel} Students` : `${selectedStudentIds.length} Selected Students`,
        selectedStudentIds,
        notifyParents
      );
      setIsSuccess(false);
      onClose();
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-dark/70 p-3 sm:p-5 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-[28px] border-[4px] border-dark bg-white p-6 sm:p-8 shadow-[12px_12px_0px_#060E1C] overflow-hidden space-y-6 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b-[3px] border-dark/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md border border-dark bg-yellow text-[10px] font-black uppercase text-dark">
                🚀 Publish Lesson Note
              </span>
              <span className="px-2 py-0.5 rounded-md border border-dark bg-slate-100 text-[10px] font-black uppercase text-dark/70">
                Pacing: Week 1-{unlockedWeek}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight leading-tight">
              {noteTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border-[2px] border-dark bg-slate-100 hover:bg-rose-500 hover:text-white text-dark transition-all cursor-pointer shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-10 text-center space-y-4 animate-scale-up">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-400 border-[3px] border-dark flex items-center justify-center text-dark text-3xl shadow-[4px_4px_0px_#000]">
              🎉
            </div>
            <h3 className="text-2xl font-black text-dark uppercase tracking-tight">
              Lesson Note Published Live!
            </h3>
            <p className="text-xs font-bold text-dark/70 max-w-md mx-auto">
              This curriculum note has been pushed to student dashboards with Week 1-{unlockedWeek} pacing unlocked.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Target Audience Scope Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-dark/80 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-indigo-600" /> Select Target Audience / Class:
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetScope('all_class')}
                  className={`p-3.5 rounded-2xl border-[2.5px] border-dark text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    targetScope === 'all_class'
                      ? 'bg-amber-300 shadow-[3px_3px_0px_#000]'
                      : 'bg-slate-50 hover:bg-slate-100 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-dark">
                      🏫 All {gradeLevel} Class
                    </span>
                    <span className="h-4 w-4 rounded-full border border-dark bg-white flex items-center justify-center text-[10px] font-bold">
                      {targetScope === 'all_class' ? '✓' : ''}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-dark/70">
                    Pushes note live to every enrolled student in this grade.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetScope('specific_students')}
                  className={`p-3.5 rounded-2xl border-[2.5px] border-dark text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    targetScope === 'specific_students'
                      ? 'bg-amber-300 shadow-[3px_3px_0px_#000]'
                      : 'bg-slate-50 hover:bg-slate-100 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-dark">
                      👦🏽 Select Specific Learners
                    </span>
                    <span className="h-4 w-4 rounded-full border border-dark bg-white flex items-center justify-center text-[10px] font-bold">
                      {targetScope === 'specific_students' ? '✓' : ''}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-dark/70">
                    Select individual students to assign this note to.
                  </p>
                </button>
              </div>
            </div>

            {/* Individual Student Picker if specific selected */}
            {targetScope === 'specific_students' && (
              <div className="p-3.5 rounded-2xl border-[2px] border-dark bg-slate-50 space-y-2 animate-fade-in">
                <span className="text-[10px] font-black uppercase tracking-wider text-dark/60 block">
                  Select Students ({selectedStudentIds.length} Selected):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {MOCK_STUDENTS.map((student) => {
                    const isSelected = selectedStudentIds.includes(student.id);
                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => toggleStudent(student.id)}
                        className={`p-2 rounded-xl border border-dark text-left text-xs font-black flex items-center justify-between transition-all cursor-pointer ${
                          isSelected ? 'bg-white shadow-[2px_2px_0px_#000]' : 'bg-slate-200/50 opacity-60'
                        }`}
                      >
                        <span className="truncate">
                          {student.avatar} {student.name}
                        </span>
                        <span className="text-[10px]">{isSelected ? '✅' : '➕'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Parent Email & App Notification Switch */}
            <div className="p-3.5 rounded-2xl border-[2px] border-dark bg-sky-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-indigo-600 shrink-0" />
                <div>
                  <p className="text-xs font-black text-dark uppercase">Instant Parent Email Dispatch</p>
                  <p className="text-[10px] font-bold text-dark/60">
                    Sends branded email to parents notifying them of new lesson notes.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyParents}
                onChange={(e) => setNotifyParents(e.target.checked)}
                className="h-5 w-5 accent-indigo-600 rounded cursor-pointer shrink-0"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t-[2px] border-dark/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border-[2px] border-dark bg-slate-100 hover:bg-slate-200 text-dark text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePublish}
                className="px-6 py-2.5 rounded-xl border-[2.5px] border-dark bg-emerald-400 hover:bg-emerald-500 text-dark text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className="h-4 w-4 text-dark" />
                <span>{isAlreadyPublished ? 'Update Live Access' : '🚀 Confirm & Publish Live'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
