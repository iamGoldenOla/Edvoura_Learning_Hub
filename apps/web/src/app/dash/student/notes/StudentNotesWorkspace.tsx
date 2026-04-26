'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ResourceCard = {
  id: string;
  subject: string;
  title: string;
  tutor: string;
};

type RevisionCard = {
  id: string;
  subject: string;
  note: string;
};

type LessonExplainerMode =
  | 'simple'
  | 'harder_examples'
  | 'checks_for_understanding'
  | 'revision_notes';

type LessonExplainerResult = {
  title: string;
  explanation: string;
  examples: string[];
  checks: Array<{ question: string; answerHint: string }>;
  revisionNotes: string[];
  nextStep: string;
};

const EXPLAINER_OPTIONS: Array<{ value: LessonExplainerMode; label: string }> = [
  { value: 'simple', label: 'Explain Simply' },
  { value: 'harder_examples', label: 'Harder Examples' },
  { value: 'checks_for_understanding', label: '5 Checks' },
  { value: 'revision_notes', label: 'Revision Notes' },
];

export default function StudentNotesWorkspace({
  resources,
  revisionList,
}: {
  resources: ResourceCard[];
  revisionList: RevisionCard[];
}) {
  const [selectedResourceId, setSelectedResourceId] = useState<string>(resources[0]?.id ?? '');
  const [explainerMode, setExplainerMode] = useState<LessonExplainerMode>('simple');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainerFeedback, setExplainerFeedback] = useState('');
  const [explainerResult, setExplainerResult] = useState<LessonExplainerResult | null>(null);

  const selectedResource = useMemo(
    () => resources.find((entry) => entry.id === selectedResourceId) ?? resources[0] ?? null,
    [resources, selectedResourceId],
  );

  const relatedRevisionNote = useMemo(() => {
    if (!selectedResource) {
      return null;
    }

    return (
      revisionList.find((entry) => entry.subject === selectedResource.subject) ??
      revisionList[0] ??
      null
    );
  }, [revisionList, selectedResource]);

  const runExplainer = async () => {
    if (!selectedResource) {
      setExplainerFeedback('No tutor note is available yet for Edvoura AI to explain.');
      return;
    }

    setIsExplaining(true);
    setExplainerResult(null);
    setExplainerFeedback('Edvoura AI is reworking this study note...');

    try {
      const response = await fetch('/api/ai/explain-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: explainerMode,
          topic: selectedResource.title,
          subject: selectedResource.subject,
          gradeLevel: 'Student Study Hub',
          lessonText: [
            `Subject: ${selectedResource.subject}`,
            `Study note title: ${selectedResource.title}`,
            `Tutor: ${selectedResource.tutor}`,
            `Revision focus: ${relatedRevisionNote?.note ?? 'Review the latest tutor guidance and practice carefully.'}`,
          ].join('\n'),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setExplainerFeedback(data.detail || data.error || 'Unable to explain this note right now.');
        return;
      }

      setExplainerResult(data.explanation);
      setExplainerFeedback(`Edvoura AI prepared a ${explainerMode.replaceAll('_', ' ')} version.`);
    } catch (error: unknown) {
      setExplainerFeedback(
        error instanceof Error ? error.message : 'Unable to explain this note right now.',
      );
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1320px]">
      <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-8">
        <h1 className="text-4xl font-heading tracking-tight text-dark">Notes and Resources</h1>
        <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
          Keep study materials, tutor notes, revision references, and AI lesson support in one academic base.
        </p>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6 xl:col-span-2">
          <h2 className="text-2xl font-black text-dark">Tutor Notes and Study Guides</h2>
          <div className="mt-4 space-y-3">
            {resources.length > 0 ? (
              resources.map((resource) => (
                <article key={resource.id} className="border-[3px] border-dark rounded-2xl bg-white p-4">
                  <p className="text-[11px] tracking-[0.25em] text-dark/40">{resource.subject}</p>
                  <h3 className="text-lg font-black text-dark">{resource.title}</h3>
                  <p className="text-sm normal-case text-dark/70 font-semibold">{resource.tutor}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href="/dash/student/classes"
                      className="inline-flex items-center justify-center px-3 py-2 border-[2px] border-dark bg-yellow text-dark font-black uppercase text-[10px] tracking-widest"
                    >
                      Open Class
                    </Link>
                    <Link
                      href="/dash/student/exam-prep"
                      className="inline-flex items-center justify-center px-3 py-2 border-[2px] border-dark bg-white text-dark font-black uppercase text-[10px] tracking-widest"
                    >
                      Open Drill
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="border-[3px] border-dashed border-dark/30 rounded-2xl p-6 text-sm normal-case text-dark/60">
                No uploaded resource is available yet.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <section className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">Revision Focus</h2>
            <div className="mt-4 space-y-2">
              {revisionList.length > 0 ? (
                revisionList.map((item) => (
                  <div key={item.id} className="rounded-xl border-[2px] border-dark bg-off-white p-3">
                    <p className="text-sm font-black text-dark">{item.subject}</p>
                    <p className="text-xs text-dark/70 font-semibold mt-1">{item.note}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm normal-case text-dark/70 font-semibold">
                  Revision recommendations will appear after progress updates.
                </p>
              )}
            </div>
          </section>

          <section className="border-[4px] border-dark bg-yellow/20 rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-dark" />
              <h2 className="text-2xl font-black text-dark">Edvoura AI Explainer</h2>
            </div>
            <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
              Turn tutor notes into simpler teaching, harder examples, quick checks, or revision-ready summaries.
            </p>

            <div className="mt-4 space-y-4">
              <select
                value={selectedResourceId}
                onChange={(event) => {
                  setSelectedResourceId(event.target.value);
                  setExplainerResult(null);
                }}
                className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
              >
                {resources.length > 0 ? (
                  resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.subject} - {resource.title}
                    </option>
                  ))
                ) : (
                  <option value="">No tutor notes yet</option>
                )}
              </select>

              <div className="grid grid-cols-2 gap-2">
                {EXPLAINER_OPTIONS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setExplainerMode(item.value)}
                    className={`rounded-xl border-[3px] px-3 py-3 text-left text-[11px] font-black uppercase tracking-widest transition-all ${
                      explainerMode === item.value
                        ? 'border-dark bg-dark text-white shadow-[3px_3px_0px_#F5C518]'
                        : 'border-dark bg-white text-dark shadow-[3px_3px_0px_#060E1C]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <Button
                className="w-full bg-yellow border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] h-auto py-4"
                disabled={!selectedResource || isExplaining}
                onClick={() => void runExplainer()}
              >
                {isExplaining ? 'Explaining...' : 'Run Edvoura AI Explainer'}
              </Button>

              {explainerFeedback ? (
                <p className="text-xs font-black uppercase tracking-widest text-dark/60">
                  {explainerFeedback}
                </p>
              ) : null}

              <div className="rounded-2xl border-[3px] border-dark bg-white p-4 shadow-[3px_3px_0px_#060E1C]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/50">
                  Explainer Output
                </p>
                {explainerResult ? (
                  <div className="mt-4 space-y-3 text-sm font-semibold text-dark/80">
                    <p className="text-lg font-black text-dark">{explainerResult.title}</p>
                    <p>{explainerResult.explanation}</p>
                    {explainerResult.examples.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-dark/50">Examples</p>
                        {explainerResult.examples.map((item) => (
                          <div key={item} className="rounded-xl border-[2px] border-dark bg-off-white p-3">
                            {item}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {explainerResult.checks.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-dark/50">
                          Checks for Understanding
                        </p>
                        {explainerResult.checks.map((item) => (
                          <div key={item.question} className="rounded-xl border-[2px] border-dark bg-off-white p-3">
                            <p className="font-black text-dark">{item.question}</p>
                            <p className="mt-1 text-xs font-semibold text-dark/70">Hint: {item.answerHint}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {explainerResult.revisionNotes.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-dark/50">
                          Revision Notes
                        </p>
                        {explainerResult.revisionNotes.map((item) => (
                          <div key={item} className="rounded-xl border-[2px] border-dark bg-off-white p-3">
                            {item}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <div className="rounded-xl border-[2px] border-dark bg-yellow/20 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-dark/50">Next Step</p>
                      <p className="mt-1 font-black text-dark">{explainerResult.nextStep}</p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm font-semibold text-dark/60">
                    Select a tutor note and let Edvoura AI reframe it for faster understanding and revision.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
            <h2 className="text-2xl font-black text-dark">Exam Prep Quick Links</h2>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <Link
                href="/dash/student/exam-prep"
                className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest"
              >
                Test & Drill Center
              </Link>
              <Link
                href="/dash/student/past-questions"
                className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-white text-dark font-black uppercase text-xs tracking-widest"
              >
                Revision Hub
              </Link>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
