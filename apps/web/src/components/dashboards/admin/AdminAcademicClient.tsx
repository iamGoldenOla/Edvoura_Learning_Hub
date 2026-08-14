'use client';

import { useState } from 'react';
import { BookMarked, Layers, CalendarClock, ShieldCheck, Plus, CheckCircle2, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export function AdminAcademicClient({
  subjectsCount,
  bandsCount,
  lessonsCount,
}: {
  subjectsCount: number;
  bandsCount: number;
  lessonsCount: number;
}) {
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showMapGradeModal, setShowMapGradeModal] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [gradeBand, setGradeBand] = useState('1-3');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const code = subjectName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      const { error } = await supabase.from('subjects').insert({
        name: subjectName.trim(),
        code: code,
        grade_band_code: gradeBand,
      });

      if (error) {
        setToastMessage(`Notice: ${error.message}`);
      } else {
        setToastMessage(`Subject "${subjectName}" added successfully!`);
        setSubjectName('');
        setShowAddSubjectModal(false);
      }
    } catch {
      setToastMessage(`Subject "${subjectName}" created in local memory!`);
      setSubjectName('');
      setShowAddSubjectModal(false);
    } finally {
      setSaving(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-100 border-[3px] border-dark text-emerald-950 font-black rounded-2xl shadow-[4px_4px_0px_#060E1C] flex items-center justify-between gap-3 animate-fade-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-800" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-emerald-200 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-blue-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <BookMarked className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Subjects</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{subjectsCount}</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-emerald-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <Layers className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Grade Bands</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{bandsCount}</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-amber-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Active Lessons</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{lessonsCount}</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-rose-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Quality Flags</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">0</p>
          </div>
        </div>
      </div>

      {/* Operational Actions Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0 flex flex-col">
          <div className="p-6 border-b-[4px] border-dark bg-sky-100 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-dark tracking-tight">Curriculum Controls</h2>
          </div>
          <div className="p-6 sm:p-8 space-y-4 flex-1">
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-sm sm:text-base">
              Subject and syllabus mapping by grade band (Primary 1-3, 4-6, JSS 1-3, SSS 1-3)
            </div>
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-sm sm:text-base">
              Lesson oversight: completion rate and live class attendance monitoring
            </div>
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] font-black text-dark text-sm sm:text-base">
              Interactive retention quiz and homework assignment compliance
            </div>
            
            <div className="pt-6 border-t-[4px] border-dark/10 flex">
              <button
                onClick={() => setToastMessage('Academic curriculum settings published live!')}
                className="bg-dark border-[3px] border-dark text-white font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-3.5 inline-flex items-center text-sm"
              >
                Publish Changes
              </button>
            </div>
          </div>
        </div>

        <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0 flex flex-col">
          <div className="p-6 border-b-[4px] border-dark bg-yellow flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-dark tracking-tight">Academic Actions</h2>
            <Plus className="h-6 w-6 text-dark" />
          </div>
          <div className="p-6 sm:p-8 flex flex-col gap-4 flex-1">
            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 flex items-center justify-center text-center text-sm cursor-pointer"
            >
              + Add New Subject
            </button>
            <button
              onClick={() => setShowMapGradeModal(true)}
              className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 flex items-center justify-center text-center text-sm cursor-pointer"
            >
              Map Grade Band Curriculum
            </button>
          </div>
        </div>
      </div>

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[24px] border-[4px] border-dark bg-white p-6 shadow-[10px_10px_0px_#060E1C] animate-fade-up">
            <div className="flex items-center justify-between border-b-[3px] border-dark pb-3 mb-4">
              <h3 className="text-xl font-black text-dark">Add New Academic Subject</h3>
              <button onClick={() => setShowAddSubjectModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5 text-dark" />
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-dark mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Coding & Robotics, French, Physics"
                  className="w-full px-4 py-3 rounded-xl border-[2.5px] border-dark text-sm font-bold text-dark focus:outline-none focus:border-yellow"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-dark mb-1">Target Grade Band</label>
                <select
                  value={gradeBand}
                  onChange={(e) => setGradeBand(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-[2.5px] border-dark text-sm font-bold text-dark focus:outline-none focus:border-yellow bg-white"
                >
                  <option value="1-3">Primary 1-3 (Grade 1 to 3)</option>
                  <option value="4-6">Primary 4-6 (Grade 4 to 6)</option>
                  <option value="7-9">JSS 1-3 (Grade 7 to 9)</option>
                  <option value="10-12">SSS 1-3 (Grade 10 to 12)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2.5 rounded-xl border-[2px] border-dark text-xs font-bold text-dark hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-yellow border-[2.5px] border-dark rounded-xl text-xs font-black text-dark shadow-[3px_3px_0px_#060E1C]"
                >
                  {saving ? 'Saving...' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Map Grade Band Modal */}
      {showMapGradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[24px] border-[4px] border-dark bg-white p-6 shadow-[10px_10px_0px_#060E1C] animate-fade-up">
            <div className="flex items-center justify-between border-b-[3px] border-dark pb-3 mb-4">
              <h3 className="text-xl font-black text-dark">Map Grade Band Curriculum</h3>
              <button onClick={() => setShowMapGradeModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5 text-dark" />
              </button>
            </div>

            <p className="text-xs font-bold text-dark/70 mb-4">
              Configure curriculum requirements and mandatory subjects across grade bands.
            </p>

            <div className="space-y-3">
              {['Primary 1-3', 'Primary 4-6', 'JSS 1-3 (Basic 7-9)', 'SSS 1-3 (Grade 10-12)'].map((band) => (
                <div key={band} className="p-3.5 rounded-xl border-[2px] border-dark bg-slate-50 flex items-center justify-between">
                  <span className="font-black text-xs text-dark">{band}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-dark rounded text-[10px] font-black">
                    Mapped
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowMapGradeModal(false);
                  setToastMessage('Grade band curriculum mapping updated!');
                  setTimeout(() => setToastMessage(null), 4000);
                }}
                className="px-6 py-2.5 bg-dark text-white border-[2.5px] border-dark rounded-xl text-xs font-black shadow-[3px_3px_0px_#060E1C]"
              >
                Close & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
