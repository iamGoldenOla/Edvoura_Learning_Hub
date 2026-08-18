'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, BookOpen, ChevronDown, Volume2, Square, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFViewerModal } from '@/components/ui/PDFViewerModal';
import { PRIMARY_1_OFFICIAL_NOTES, PRIMARY_2_OFFICIAL_NOTES, PRIMARY_3_OFFICIAL_NOTES, PRIMARY_4_OFFICIAL_NOTES, PRIMARY_5_OFFICIAL_NOTES, PRIMARY_6_OFFICIAL_NOTES, JSS_1_OFFICIAL_NOTES, JSS_2_OFFICIAL_NOTES, JSS_3_OFFICIAL_NOTES, SS_1_OFFICIAL_NOTES, SS_2_OFFICIAL_NOTES, SS_3_OFFICIAL_NOTES, OFFICIAL_CURRICULUM_DATABASE } from '@/lib/curriculumNotes';
import StudentAITutorWidget from '@/components/dashboards/ai/StudentAITutorWidget';

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

type AILessonNote = {
  id: string;
  title: string;
  subject: string;
  topic: string;
  grade: string;
  content: Record<string, unknown>;
  createdAt: string;
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

function AudioNotePlayer({ textToRead, title }: { textToRead: string; title: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function handlePlay() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = textToRead
      .replace(/[*#_~`]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(`${title}. ${cleanText}`);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  }

  function handlePause() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }

  function handleStop() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border-[2px] border-dark bg-yellow/20 p-2.5 shadow-[2px_2px_0px_#060E1C]">
      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-dark">
        <Volume2 className="h-4 w-4" />
        <span>Audio Reader</span>
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        {!isPlaying ? (
          <button
            type="button"
            onClick={handlePlay}
            className="flex items-center gap-1 rounded-lg border-[1.5px] border-dark bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-dark shadow-[1.5px_1.5px_0px_#060E1C] hover:translate-x-[0.5px] hover:translate-y-[0.5px]"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>{isPaused ? 'Resume' : 'Listen'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePause}
            className="flex items-center gap-1 rounded-lg border-[1.5px] border-dark bg-amber-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-dark shadow-[1.5px_1.5px_0px_#060E1C]"
          >
            <Pause className="h-3 w-3 fill-current" />
            <span>Pause</span>
          </button>
        )}

        {(isPlaying || isPaused) && (
          <button
            type="button"
            onClick={handleStop}
            className="flex items-center gap-1 rounded-lg border-[1.5px] border-dark bg-rose-200 px-2 py-1 text-[10px] font-black uppercase text-dark shadow-[1.5px_1.5px_0px_#060E1C]"
          >
            <Square className="h-3 w-3 fill-current" />
            <span>Stop</span>
          </button>
        )}

        <select
          value={rate}
          onChange={(e) => {
            const newRate = parseFloat(e.target.value);
            setRate(newRate);
            if (isPlaying) {
              handleStop();
            }
          }}
          className="rounded-lg border-[1.5px] border-dark bg-white px-1.5 py-1 text-[10px] font-black outline-none"
        >
          <option value={0.8}>0.8x</option>
          <option value={1.0}>1.0x</option>
          <option value={1.2}>1.2x</option>
        </select>
      </div>
    </div>
  );
}

function StudentLessonNoteView({ note, onOpenPdf, studentGradeCode }: { note: AILessonNote; onOpenPdf?: (pdfUrl: string, title: string) => void; studentGradeCode?: string }) {
  const [expanded, setExpanded] = useState(false);
  const content = note.content;
  const explanation = typeof content.explanation === 'string' ? content.explanation : '';
  const lessonSummary = typeof content.lesson_summary === 'string' ? content.lesson_summary : '';
  const typesOrCategories = Array.isArray(content.types_or_categories) ? content.types_or_categories : [];
  const importancePoints = Array.isArray(content.importance_points) ? content.importance_points : [];
  const keyPoints = Array.isArray(content.key_points) ? content.key_points : [];
  const workedExamples = Array.isArray(content.worked_examples) ? content.worked_examples : [];
  const realWorldExamples = Array.isArray(content.real_world_examples) ? content.real_world_examples : [];
  const practiceQuestions = Array.isArray(content.practice_questions) ? content.practice_questions : [];
  const learningChecks = Array.isArray(content.learning_checks) ? content.learning_checks : [];


  const officialFileUrl =
    (typeof content.official_file_url === 'string' && content.official_file_url) ||
    (typeof content.pdf_url === 'string' && content.pdf_url) ||
    (typeof content.fileUrl === 'string' && content.fileUrl) ||
    '/curriculum/primary_3/PRIMARY 3 BASIC SCIENCE LESSON NOTES.pdf';

  const fullTextToRead = useMemo(() => {
    return [
      lessonSummary,
      explanation,
      keyPoints.join('. '),
      importancePoints.join('. '),
    ].filter(Boolean).join('. ');
  }, [lessonSummary, explanation, keyPoints, importancePoints]);

  // Instructional materials for student — YouTube and image search links
  const materials = content.instructional_materials;
  const hasMaterials = materials && typeof materials === 'object' && !Array.isArray(materials);
  const youtubeVideos = hasMaterials && Array.isArray((materials as Record<string, unknown>).youtube_videos)
    ? (materials as Record<string, unknown>).youtube_videos as Array<Record<string, unknown>>
    : [];
  const imageResources = hasMaterials && Array.isArray((materials as Record<string, unknown>).image_resources)
    ? (materials as Record<string, unknown>).image_resources as Array<Record<string, unknown>>
    : [];

  return (
    <article className="border-[3px] border-dark rounded-2xl bg-white overflow-hidden shadow-[4px_4px_0px_#060E1C]">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between gap-3 p-4 text-left transition-colors hover:bg-off-white/50 sm:p-5"
      >
        <div className="flex-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/40">
            {note.subject} · {note.grade}
          </span>
          <h3 className="mt-1 text-base font-black text-dark break-words sm:text-lg">{note.title}</h3>
          {lessonSummary ? (
            <p className="mt-1 text-sm font-semibold text-dark/60 line-clamp-2">{lessonSummary}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPdf?.(officialFileUrl, note.title);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow border-[2px] border-dark rounded-xl text-xs font-black uppercase text-dark shadow-[2px_2px_0px_#060E1C] hover:bg-yellow-400 active:scale-95 transition-all cursor-pointer"
          >
            <BookOpen className="h-4 w-4 text-dark" />
            <span>📖 Read PDF</span>
          </button>
          <ChevronDown className={`h-5 w-5 mt-1 text-dark/40 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Audio Reader */}
      <div className="px-4 pb-3 sm:px-5">
        <AudioNotePlayer textToRead={fullTextToRead || note.title} title={note.title} />
      </div>

      {/* Expanded content */}
      {expanded ? (
        <div className="border-t-[2px] border-dark p-5 space-y-5">
          {/* Explanation */}
          {explanation ? (
            <div className="rounded-xl border-[2px] border-dark bg-off-white p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">📖 Explanation</p>
              <p className="text-sm font-semibold leading-7 text-dark/80 whitespace-pre-line">{explanation}</p>
            </div>
          ) : null}

          {typesOrCategories.length > 0 ? (
            <div className="rounded-xl border-[2px] border-dark bg-cyan-50 p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">Types / Categories</p>
              <ul className="list-disc space-y-1 pl-5 text-sm font-semibold text-dark/80">
                {typesOrCategories.map((item, index) => (
                  <li key={`type-${index}`}>{String(item)}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {importancePoints.length > 0 ? (
            <div className="rounded-xl border-[2px] border-dark bg-amber-50 p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">Importance</p>
              <ul className="list-disc space-y-1 pl-5 text-sm font-semibold text-dark/80">
                {importancePoints.map((item, index) => (
                  <li key={`importance-${index}`}>{String(item)}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Key Points */}
          {keyPoints.length > 0 ? (
            <div className="rounded-xl border-[2px] border-dark bg-green-50 p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">💡 Key Points</p>
              <ul className="list-disc space-y-1 pl-5 text-sm font-semibold text-dark/80">
                {keyPoints.map((item, index) => (
                  <li key={`kp-${index}`}>{String(item)}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Worked Examples */}
          {workedExamples.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">✏️ Worked Examples</p>
              <div className="space-y-3">
                {workedExamples.map((item, index) => {
                  const row = item && typeof item === 'object' && !Array.isArray(item) ? item as Record<string, unknown> : {};
                  return (
                    <div key={`we-${index}`} className="rounded-xl border-[2px] border-dark bg-blue-50 p-4">
                      <p className="text-sm font-black text-dark">{String(row.title ?? `Example ${index + 1}`)}</p>
                      <p className="mt-2 text-sm font-semibold leading-7 text-dark/80 whitespace-pre-line">{String(row.explanation ?? '')}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Real-World Examples */}
          {realWorldExamples.length > 0 ? (
            <div className="rounded-xl border-[2px] border-dark bg-purple-50 p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">🌍 Real-World Examples</p>
              <ul className="list-disc space-y-1 pl-5 text-sm font-semibold text-dark/80">
                {realWorldExamples.map((item, index) => (
                  <li key={`rwe-${index}`}>{String(item)}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Practice Questions — NO answer hints shown to students */}
          {practiceQuestions.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">📝 Practice Questions</p>
              <div className="space-y-2">
                {practiceQuestions.map((item, index) => {
                  const row = item && typeof item === 'object' && !Array.isArray(item) ? item as Record<string, unknown> : {};
                  const difficulty = String(row.difficulty ?? 'medium');
                  const diffColors: Record<string, string> = {
                    easy: 'bg-green-100 text-green-800 border-green-300',
                    medium: 'bg-amber-100 text-amber-800 border-amber-300',
                    hard: 'bg-red-100 text-red-800 border-red-300',
                  };
                  return (
                    <div key={`pq-${index}`} className="flex items-start gap-3 rounded-xl border-[2px] border-dark bg-off-white p-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[2px] border-dark bg-white text-xs font-black text-dark">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-dark">{String(row.question ?? '')}</p>
                        <span className={`mt-1 inline-block rounded-lg border-[1.5px] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${diffColors[difficulty] ?? diffColors.medium}`}>
                          {difficulty}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Learning Checks */}
          {learningChecks.length > 0 ? (
            <div className="rounded-xl border-[2px] border-dark bg-cyan-50 p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">🔍 Check Your Understanding</p>
              <ul className="list-disc space-y-1 pl-5 text-sm font-semibold text-dark/80">
                {learningChecks.map((item, index) => (
                  <li key={`lc-${index}`}>{String(item)}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Study Videos and Images */}
          {(youtubeVideos.length > 0 || imageResources.length > 0) ? (
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">📚 Study Resources</p>
              <div className="grid gap-3 md:grid-cols-2">
                {youtubeVideos.length > 0 ? (
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-dark/50">📺 Videos</p>
                    <div className="space-y-2">
                      {youtubeVideos.map((item, index) => (
                        <a
                          key={`yt-${index}`}
                          href={String(item.url ?? '#')}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-lg border border-dark/20 bg-white p-2 text-sm font-bold text-dark underline decoration-yellow underline-offset-2 hover:bg-yellow/10 transition-colors"
                        >
                          {String(item.title ?? 'Study video')}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
                {imageResources.length > 0 ? (
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-dark/50">🖼️ Images</p>
                    <div className="space-y-2">
                      {imageResources.map((item, index) => (
                        <a
                          key={`img-${index}`}
                          href={String(item.url ?? '#')}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-lg border border-dark/20 bg-white p-2 text-sm font-bold text-dark underline decoration-yellow underline-offset-2 hover:bg-yellow/10 transition-colors"
                        >
                          {String(item.title ?? 'Study image')}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

type StudentNotesWorkspaceProps = {
  resources: ResourceCard[];
  revisionList: RevisionCard[];
  aiLessonNotes: AILessonNote[];
  studentGradeCode?: string;
  studentGradeName?: string;
};

export default function StudentNotesWorkspace({
  resources,
  revisionList,
  aiLessonNotes,
  studentGradeCode = 'grade_1',
  studentGradeName = 'Grade 1',
}: StudentNotesWorkspaceProps) {
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

  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activePdfTitle, setActivePdfTitle] = useState<string>('');
  const [publishedOfficialIds, setPublishedOfficialIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('edvoura_published_curriculum_notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setPublishedOfficialIds(parsed);
      }
    } catch (e) {}
  }, []);

  const allOfficialNotes = OFFICIAL_CURRICULUM_DATABASE[studentGradeCode] ?? PRIMARY_1_OFFICIAL_NOTES;
  const visibleOfficialNotes = allOfficialNotes.filter(n => publishedOfficialIds.includes(n.id));

  return (
    <div className="w-full max-w-[1320px] space-y-6 sm:space-y-8">
      <section className="rounded-[24px] border-[4px] border-dark bg-white p-5 shadow-[8px_8px_0px_#060E1C] sm:rounded-[28px] sm:p-8">
        <h1 className="text-3xl font-heading tracking-tight text-dark sm:text-4xl">Notes and Resources</h1>
        <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
          Keep study materials, tutor notes, lesson notes, and revision references in one academic base.
        </p>
      </section>

      {/* Notes Pushed by Tutor */}
      {aiLessonNotes.length > 0 ? (
        <section className="rounded-[24px] border-[4px] border-dark bg-white p-5 shadow-[8px_8px_0px_#060E1C] sm:rounded-[28px] sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <BookOpen className="h-6 w-6 text-dark" />
            <h2 className="text-xl font-black text-dark sm:text-2xl">Lesson Notes Pushed by Your Tutor</h2>
            <span className="rounded-lg border-[1.5px] border-dark bg-green-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-green-900 shadow-[2px_2px_0px_#060E1C]">
              📢 {aiLessonNotes.length} Published
            </span>
          </div>
          <p className="text-sm font-semibold text-dark/60 mb-4">
            Lesson notes specifically assigned and pushed to your grade by your tutor. Tap to expand and study.
          </p>
          <div className="space-y-4">
            {aiLessonNotes.map((note) => (
              <StudentLessonNoteView key={note.id} note={note} studentGradeCode={studentGradeCode} onOpenPdf={(url, title) => { setActivePdfUrl(url); setActivePdfTitle(title); }} />
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-[24px] border-[4px] border-dashed border-dark/20 bg-white p-8 shadow-[6px_6px_0px_#060E1C] text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border-[2px] border-dark flex items-center justify-center text-2xl">
              📢
            </div>
          </div>
          <h3 className="text-lg font-black text-dark">No Tutor Lesson Notes Pushed Yet</h3>
          <p className="text-xs font-bold text-dark/60 max-w-md mx-auto">
            Your dashboard will only display lesson notes when your assigned tutor pushes them specifically to your grade level ({studentGradeName}).
          </p>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-[24px] border-[4px] border-dark bg-off-white p-4 shadow-[8px_8px_0px_#060E1C] sm:rounded-[28px] sm:p-6 xl:col-span-2">
          <h2 className="text-xl font-black text-dark sm:text-2xl">Tutor Notes and Study Guides</h2>
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
          <section className="rounded-[24px] border-[4px] border-dark bg-white p-4 shadow-[8px_8px_0px_#060E1C] sm:rounded-[28px] sm:p-6">
            <h2 className="text-xl font-black text-dark sm:text-2xl">Revision Focus</h2>
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

          <section className="rounded-[24px] border-[4px] border-dark bg-yellow/20 p-4 shadow-[8px_8px_0px_#060E1C] sm:rounded-[28px] sm:p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-dark" />
              <h2 className="text-xl font-black text-dark sm:text-2xl">Edvoura AI Explainer</h2>
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

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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

          <section className="rounded-[24px] border-[4px] border-dark bg-off-white p-4 shadow-[8px_8px_0px_#060E1C] sm:rounded-[28px] sm:p-6">
            <h2 className="text-xl font-black text-dark sm:text-2xl">Exam Prep Quick Links</h2>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <Link
                href="/dash/student/exam-prep"
                className="inline-flex items-center justify-center px-4 py-2.5 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest"
              >
                Test &amp; Drill Center
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
      <PDFViewerModal
        isOpen={activePdfUrl !== null}
        onClose={() => {
          setActivePdfUrl(null);
          setActivePdfTitle('');
        }}
        pdfUrl={activePdfUrl}
        title={activePdfTitle}
      />
      <StudentAITutorWidget gradeLevel={studentGradeName} />
    </div>
  );
}
