'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Send, CheckCircle2, Eye, FileText, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pushResourceToStudents, getPreloadedResources, type PreloadedResource } from './comprehension-actions';
import { PDFViewerModal } from '@/components/ui/PDFViewerModal';

type GradeOption = {
  id: string;
  code: string;
  display_name: string;
};

type Props = {
  tutorId: string;
  initialGradeCode: string;
  gradeLevels: GradeOption[];
};

export function ComprehensionLibrary({ tutorId, initialGradeCode, gradeLevels }: Props) {
  const [selectedGrade, setSelectedGrade] = useState(initialGradeCode || (gradeLevels[0]?.code ?? ''));
  const [resources, setResources] = useState<PreloadedResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [pushing, setPushing] = useState<Record<string, boolean>>({});
  const [pushed, setPushed] = useState<Record<string, boolean>>({});
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activePdfTitle, setActivePdfTitle] = useState('');

  // Fetch preloaded resources whenever the selected grade changes
  useEffect(() => {
    if (!selectedGrade) return;

    let active = true;
    async function fetchResources() {
      setLoading(true);
      try {
        const data = await getPreloadedResources(selectedGrade);
        if (active) {
          setResources(data);
        }
      } catch (err) {
        console.error('Failed to load resources:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchResources();
    return () => {
      active = false;
    };
  }, [selectedGrade]);

  async function handlePush(resourceId: string) {
    setPushing(p => ({ ...p, [resourceId]: true }));
    setFeedback(f => ({ ...f, [resourceId]: '' }));

    try {
      const result = await pushResourceToStudents(resourceId, tutorId, selectedGrade);
      setFeedback(f => ({ ...f, [resourceId]: result.message }));
      if (result.success) {
        setPushed(p => ({ ...p, [resourceId]: true }));
      }
    } catch {
      setFeedback(f => ({ ...f, [resourceId]: 'Something went wrong. Try again.' }));
    } finally {
      setPushing(p => ({ ...p, [resourceId]: false }));
    }
  }

  const selectedGradeName = gradeLevels.find(g => g.code === selectedGrade)?.display_name ?? selectedGrade;

  return (
    <>
      <div className="space-y-6">
        {/* Header and Grade Selector */}
        <div className="flex flex-col gap-4 rounded-3xl border-[3px] border-dark bg-indigo-50 p-5 shadow-[4px_4px_0px_#060E1C] sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-dark bg-white shadow-[2px_2px_0px_#060E1C]">
              <BookOpen className="h-6 w-6 text-dark" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-dark sm:text-xl">
                Comprehension Library
              </h3>
              <p className="text-xs font-bold text-dark/60">
                Pre-loaded reading texts mapped to standard grade curriculums
              </p>
            </div>
          </div>

          {/* Grade Dropdown Selector */}
          <div className="flex flex-col gap-1 w-full sm:w-64">
            <label className="text-[10px] font-black uppercase tracking-widest text-dark/60">
              Filter by Grade Level:
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                // Clear state when switching grades
                setFeedback({});
                setPushed({});
              }}
              className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
            >
              {gradeLevels.map((grade) => (
                <option key={grade.id} value={grade.code}>
                  {grade.display_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="mt-3 text-sm font-bold text-dark/60">Loading comprehension texts...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="rounded-[28px] border-[4px] border-dashed border-dark/20 bg-slate-50 p-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-dark/30" />
            <p className="text-base font-bold text-dark/80">No preloaded texts found</p>
            <p className="mt-1 text-sm font-semibold text-dark/50">
              Run the seed script `node scripts/seed_comprehension.js` to populate {selectedGradeName} resources.
            </p>
          </div>
        ) : (
          /* Resource Cards Grid */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map(r => (
              <div
                key={r.id}
                className="flex flex-col rounded-[24px] border-[3px] border-dark bg-white p-5 shadow-[5px_5px_0px_#060E1C] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#060E1C]"
              >
                {/* Header Badge */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 rounded-lg border-[2px] border-dark bg-yellow px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-dark shadow-[1.5px_1.5px_0px_#060E1C]">
                    <Sparkles className="h-3 w-3" /> curriculum
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                    {selectedGradeName}
                  </span>
                </div>

                {/* Title */}
                <h4 className="mb-2 text-base font-black leading-snug tracking-tight text-dark break-words">
                  {r.title}
                </h4>
                <p className="mb-6 flex-1 text-xs font-bold leading-relaxed text-dark/50 break-words">
                  {r.description || r.file_name}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2.5 mt-auto">
                  <Button
                    variant="outline"
                    className="w-full h-10 border-[2px] border-dark bg-slate-50 text-dark font-black text-xs rounded-xl shadow-[3px_3px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                    onClick={() => {
                      setActivePdfUrl(r.public_url);
                      setActivePdfTitle(r.title);
                    }}
                  >
                    <Eye className="mr-1.5 h-4 w-4" /> Preview PDF
                  </Button>

                  <Button
                    className={`w-full h-10 border-[2px] border-dark font-black text-xs rounded-xl shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:scale-95 ${
                      pushed[r.id]
                        ? 'bg-emerald-400 text-dark'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                    disabled={pushing[r.id] || pushed[r.id]}
                    onClick={() => handlePush(r.id)}
                  >
                    {pushing[r.id] ? (
                      <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Pushing...</>
                    ) : pushed[r.id] ? (
                      <><CheckCircle2 className="mr-1.5 h-4 w-4" /> Pushed Successfully</>
                    ) : (
                      <><Send className="mr-1.5 h-4 w-4" /> Push to Students</>
                    )}
                  </Button>
                </div>

                {/* Success/Error Feedback */}
                {feedback[r.id] && (
                  <p className={`mt-3 text-[10px] font-black break-words ${pushed[r.id] ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {feedback[r.id]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {activePdfUrl && (
        <PDFViewerModal
          isOpen={activePdfUrl !== null}
          onClose={() => {
            setActivePdfUrl(null);
            setActivePdfTitle('');
          }}
          pdfUrl={activePdfUrl}
          title={activePdfTitle}
        />
      )}
    </>
  );
}
