'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, BookOpen, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFViewerModal } from '@/components/ui/PDFViewerModal';
import { PRIMARY_1_OFFICIAL_NOTES, PRIMARY_2_OFFICIAL_NOTES, PRIMARY_3_OFFICIAL_NOTES, PRIMARY_4_OFFICIAL_NOTES, PRIMARY_5_OFFICIAL_NOTES, PRIMARY_6_OFFICIAL_NOTES, JSS_1_OFFICIAL_NOTES, JSS_2_OFFICIAL_NOTES, JSS_3_OFFICIAL_NOTES, SS_1_OFFICIAL_NOTES, SS_2_OFFICIAL_NOTES, SS_3_OFFICIAL_NOTES, OFFICIAL_CURRICULUM_DATABASE } from '@/app/dash/tutor/lesson-notes/page';

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

function StudentLessonNoteView({ note }: { note: AILessonNote }) {
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
        <ChevronDown className={`h-5 w-5 mt-1 text-dark/40 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

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

export default function StudentNotesWorkspace({
  resources,
  revisionList,
  aiLessonNotes = [],
}: {
  resources: ResourceCard[];
  revisionList: RevisionCard[];
  aiLessonNotes?: AILessonNote[];
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

  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activePdfTitle, setActivePdfTitle] = useState<string>('');
  const [publishedOfficialIds, setPublishedOfficialIds] = useState<string[]>([
    'p1_basic_science', 'p1_mathematics', 'p1_english', 'p1_history', 'p1_arts', 'p1_social', 'p1_phe', 'p1_crs', 'p1_irs',
    'p2_basic_science', 'p2_mathematics', 'p2_english', 'p2_history', 'p2_arts', 'p2_social', 'p2_phe', 'p2_crs', 'p2_irs',
    'p3_basic_science', 'p3_mathematics', 'p3_english', 'p3_history', 'p3_arts', 'p3_social', 'p3_phe', 'p3_crs', 'p3_irs',
    'p4_basic_science', 'p4_digital_literacy', 'p4_mathematics', 'p4_english', 'p4_french', 'p4_history', 'p4_arts', 'p4_prevocational', 'p4_social', 'p4_phe', 'p4_crs', 'p4_irs',
    'p5_basic_science', 'p5_digital_literacy', 'p5_mathematics', 'p5_english', 'p5_french', 'p5_history', 'p5_arts', 'p5_prevocational', 'p5_social', 'p5_phe', 'p5_crs', 'p5_irs',
    'p6_basic_science', 'p6_digital_literacy', 'p6_mathematics', 'p6_english', 'p6_french', 'p6_history', 'p6_arts', 'p6_prevocational', 'p6_social', 'p6_phe', 'p6_crs', 'p6_irs',
    'jss1_math', 'jss1_english', 'jss1_science', 'jss1_business', 'jss1_digital_tech', 'jss1_computer_repair', 'jss1_solar', 'jss1_french', 'jss1_history', 'jss1_arts', 'jss1_social', 'jss1_phe', 'jss1_crs', 'jss1_irs', 'jss1_beauty', 'jss1_fashion', 'jss1_horticulture', 'jss1_livestock',
    'jss2_math', 'jss2_english', 'jss2_science', 'jss2_business', 'jss2_digital_tech', 'jss2_hardware_repair', 'jss2_solar', 'jss2_french', 'jss2_history', 'jss2_arts', 'jss2_social', 'jss2_phe', 'jss2_crs', 'jss2_irs', 'jss2_beauty', 'jss2_fashion', 'jss2_horticulture', 'jss2_livestock',
    'jss3_math', 'jss3_english', 'jss3_science', 'jss3_business', 'jss3_digital_tech', 'jss3_hardware_repair', 'jss3_solar', 'jss3_french', 'jss3_history', 'jss3_arts', 'jss3_social', 'jss3_phe', 'jss3_crs', 'jss3_irs', 'jss3_beauty', 'jss3_fashion', 'jss3_horticulture', 'jss3_livestock',
    'ss1_math', 'ss1_english', 'ss1_physics', 'ss1_chemistry', 'ss1_biology', 'ss1_further_math', 'ss1_agric', 'ss1_geography', 'ss1_economics', 'ss1_government', 'ss1_accounting', 'ss1_commerce', 'ss1_marketing', 'ss1_literature', 'ss1_history', 'ss1_crs', 'ss1_citizenship', 'ss1_digital_tech', 'ss1_hardware_repair', 'ss1_solar', 'ss1_technical_drawing', 'ss1_visual_arts', 'ss1_food_nutrition', 'ss1_catering', 'ss1_beauty', 'ss1_fashion', 'ss1_horticulture', 'ss1_livestock',
    'ss2_math', 'ss2_english', 'ss2_physics', 'ss2_chemistry', 'ss2_biology', 'ss2_further_math', 'ss2_agric', 'ss2_geography', 'ss2_economics', 'ss2_government', 'ss2_accounting', 'ss2_commerce', 'ss2_marketing', 'ss2_literature', 'ss2_history', 'ss2_crs', 'ss2_citizenship', 'ss2_digital_tech', 'ss2_hardware_repair', 'ss2_solar', 'ss2_technical_drawing', 'ss2_visual_arts', 'ss2_food_nutrition', 'ss2_catering', 'ss2_beauty', 'ss2_fashion', 'ss2_horticulture', 'ss2_livestock',
    'ss3_math', 'ss3_english', 'ss3_physics', 'ss3_chemistry', 'ss3_biology', 'ss3_further_math', 'ss3_agric', 'ss3_geography', 'ss3_economics', 'ss3_accounting', 'ss3_commerce', 'ss3_marketing', 'ss3_literature', 'ss3_history', 'ss3_crs', 'ss3_citizenship', 'ss3_digital_tech', 'ss3_hardware_repair', 'ss3_solar', 'ss3_technical_drawing', 'ss3_visual_arts', 'ss3_food_nutrition', 'ss3_catering', 'ss3_beauty', 'ss3_fashion', 'ss3_horticulture', 'ss3_livestock',
  ]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('edvoura_published_curriculum_notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setPublishedOfficialIds(parsed);
      }
    } catch (e) {}
  }, []);

  const allOfficialNotes = [...PRIMARY_1_OFFICIAL_NOTES, ...PRIMARY_2_OFFICIAL_NOTES, ...PRIMARY_3_OFFICIAL_NOTES, ...PRIMARY_4_OFFICIAL_NOTES, ...PRIMARY_5_OFFICIAL_NOTES, ...PRIMARY_6_OFFICIAL_NOTES, ...JSS_1_OFFICIAL_NOTES, ...JSS_2_OFFICIAL_NOTES, ...JSS_3_OFFICIAL_NOTES, ...SS_1_OFFICIAL_NOTES, ...SS_2_OFFICIAL_NOTES, ...SS_3_OFFICIAL_NOTES];
  const visibleOfficialNotes = allOfficialNotes.filter(n => publishedOfficialIds.includes(n.id));

  return (
    <div className="w-full max-w-[1320px] space-y-6 sm:space-y-8">
      <section className="rounded-[24px] border-[4px] border-dark bg-white p-5 shadow-[8px_8px_0px_#060E1C] sm:rounded-[28px] sm:p-8">
        <h1 className="text-3xl font-heading tracking-tight text-dark sm:text-4xl">Notes and Resources</h1>
        <p className="mt-3 text-sm normal-case text-dark/70 font-semibold">
          Keep study materials, tutor notes, lesson notes, and revision references in one academic base.
        </p>
      </section>

      {/* Official Published Curriculum Lesson Notes */}
      {visibleOfficialNotes.length > 0 ? (
        <section className="rounded-[24px] border-[4px] border-dark bg-yellow/10 p-5 sm:p-6 shadow-[8px_8px_0px_#060E1C] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-dark/10 pb-3">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-dark" />
              <h2 className="text-xl font-black text-dark sm:text-2xl">Official Grade 1 Curriculum Lesson Notes</h2>
            </div>
            <span className="rounded-lg border-[1.5px] border-dark bg-yellow px-3 py-1 text-[10px] font-black uppercase tracking-widest text-dark shadow-[2px_2px_0px_#060E1C]">
              {visibleOfficialNotes.length} Subjects Published
            </span>
          </div>
          <p className="text-sm font-semibold text-dark/70">
            Official term-by-term lesson notes published by your tutors. Tap to open and read the complete PDF guide.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
            {visibleOfficialNotes.map((note) => (
              <div
                key={note.id}
                className="border-[3px] border-dark rounded-[20px] bg-white p-5 shadow-[4px_4px_0px_#060E1C] flex flex-col justify-between hover:translate-y-[-2px] transition-all"
              >
                <div>
                  <span className="inline-block px-2.5 py-1 bg-indigo-100 border-[2px] border-dark rounded-md text-[10px] font-black uppercase text-indigo-900 shadow-[2px_2px_0px_#060E1C] mb-3">
                    {note.subjectName}
                  </span>
                  <h3 className="text-base font-black text-dark mb-2 leading-tight">{note.title}</h3>
                  <p className="text-xs font-bold text-dark/60 mb-4 line-clamp-3">{note.description}</p>
                </div>

                <button
                  onClick={() => {
                    setActivePdfUrl(note.fileUrl);
                    setActivePdfTitle(note.title);
                  }}
                  className="w-full py-2.5 bg-yellow text-dark border-[2px] border-dark rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  📖 Read Full Lesson Note PDF
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Published lesson notes */}
      {aiLessonNotes.length > 0 ? (
        <section className="rounded-[24px] border-[4px] border-dark bg-white p-4 shadow-[8px_8px_0px_#060E1C] sm:rounded-[28px] sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <BookOpen className="h-6 w-6 text-dark" />
            <h2 className="text-xl font-black text-dark sm:text-2xl">Lesson Notes</h2>
            <span className="rounded-lg border-[1.5px] border-dark bg-green-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-green-900">
              {aiLessonNotes.length} Available
            </span>
          </div>
          <p className="text-sm font-semibold text-dark/60 mb-4">
            Published lesson notes reviewed and approved by your tutor. Tap to expand and study.
          </p>
          <div className="space-y-4">
            {aiLessonNotes.map((note) => (
              <StudentLessonNoteView key={note.id} note={note} />
            ))}
          </div>
        </section>
      ) : null}

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
    </div>
  );
}
