'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, CheckSquare, ClipboardList, FilePenLine, Lock, Pencil, PlusCircle, ShieldCheck, Sparkles, Target, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';

type LessonPlan = {
  id: string;
  className: string;
  topic: string;
  duration: string;
  lessonDate: string;
  objective: string;
  priorKnowledge: string;
  keyVocabulary: string;
  resources: string;
  differentiation: string;
  formativeAssessment: string;
  homework: string;
  safeguarding: string;
  reflection: string;
  status: 'Ready' | 'Draft';
  targetScope?: 'all_class' | 'specific_student';
  targetStudentName?: string;
};

import { PDFViewerModal } from '@/components/ui/PDFViewerModal';
import { PublishTargetModal } from '@/components/tutor/PublishTargetModal';

import {
  OfficialCurriculumNote,
  PRIMARY_1_OFFICIAL_NOTES,
  PRIMARY_2_OFFICIAL_NOTES,
  PRIMARY_3_OFFICIAL_NOTES,
  PRIMARY_4_OFFICIAL_NOTES,
  PRIMARY_5_OFFICIAL_NOTES,
  PRIMARY_6_OFFICIAL_NOTES,
  JSS_1_OFFICIAL_NOTES,
  JSS_2_OFFICIAL_NOTES,
  JSS_3_OFFICIAL_NOTES,
  SS_1_OFFICIAL_NOTES,
  SS_2_OFFICIAL_NOTES,
  SS_3_OFFICIAL_NOTES,
  OFFICIAL_CURRICULUM_DATABASE,
} from '@/lib/curriculumNotes';

const basePlans: LessonPlan[] = [
  {
    id: 'ln-1',
    className: 'JSS3 Mathematics',
    topic: 'Linear Equations in One Variable',
    duration: '60 mins',
    lessonDate: '2026-04-15',
    objective: 'Students solve 10 mixed equation questions independently.',
    priorKnowledge: 'Basic operations and simple algebraic expressions.',
    keyVocabulary: 'variable, coefficient, equation, isolate',
    resources: 'Whiteboard, worksheet set A, mini quiz cards',
    differentiation: 'Tiered problems for support/core/challenge groups.',
    formativeAssessment: 'Cold-call checks + 5-item exit ticket.',
    homework: 'Worksheet page 12 questions 1-8.',
    safeguarding: 'Positive participation protocol and inclusive grouping.',
    reflection: 'Increase modelling time for substitution method.',
    status: 'Ready',
  },
  {
    id: 'ln-2',
    className: 'Grade 4 Basic Science',
    topic: 'States of Matter',
    duration: '45 mins',
    lessonDate: '2026-04-16',
    objective: 'Students identify and classify matter by properties.',
    priorKnowledge: 'Solid, liquid, gas examples from daily life.',
    keyVocabulary: 'evaporation, condensation, particles',
    resources: 'Water cup demo, ice, visual cards',
    differentiation: 'Sentence starters and challenge extension prompt.',
    formativeAssessment: 'Think-pair-share and observation checklist.',
    homework: 'Home observation chart for 3 state changes.',
    safeguarding: 'Safe handling of warm water and clear movement rules.',
    reflection: 'Add more examples from home context next lesson.',
    status: 'Draft',
  },
];

export default function TutorLessonNotesPage() {
  const searchParams = useSearchParams();
  const openFromQuery = searchParams.get('action') === 'new';

  const [plans, setPlans] = useState<LessonPlan[]>(basePlans);
  const [showForm, setShowForm] = useState<boolean>(openFromQuery);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [className, setClassName] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('');
  const [lessonDate, setLessonDate] = useState('');
  const [objective, setObjective] = useState('');
  const [priorKnowledge, setPriorKnowledge] = useState('');
  const [keyVocabulary, setKeyVocabulary] = useState('');
  const [resources, setResources] = useState('');
  const [differentiation, setDifferentiation] = useState('');
  const [formativeAssessment, setFormativeAssessment] = useState('');
  const [homework, setHomework] = useState('');
  const [safeguarding, setSafeguarding] = useState('');
  const [reflection, setReflection] = useState('');
  const [feedback, setFeedback] = useState('');
  const [targetScope, setTargetScope] = useState<'all_class' | 'specific_student'>('all_class');
  const [targetStudentName, setTargetStudentName] = useState<string>('');
  const [explainerMode, setExplainerMode] = useState<'simple' | 'harder_examples' | 'checks_for_understanding' | 'revision_notes'>('simple');
  const [explainerPlanId, setExplainerPlanId] = useState<string | null>(basePlans[0]?.id ?? null);
  const [explainerResult, setExplainerResult] = useState<{
    title: string;
    explanation: string;
    examples: string[];
    checks: Array<{ question: string; answerHint: string }>;
    revisionNotes: string[];
    nextStep: string;
  } | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activePdfTitle, setActivePdfTitle] = useState<string>('');
  const [activePdfNoteId, setActivePdfNoteId] = useState<string>('');
  const [targetPublishNote, setTargetPublishNote] = useState<{ id: string; title: string; gradeLevel: string } | null>(null);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('grade_12');
  const [publishedOfficialNoteIds, setPublishedOfficialNoteIds] = useState<string[]>([
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
  const [unlockedNoteWeeks, setUnlockedNoteWeeks] = useState<Record<string, number>>({});
  const [selectedNoteTerms, setSelectedNoteTerms] = useState<Record<string, '1st' | '2nd' | '3rd' | 'all'>>({});

  const [tutorType, setTutorType] = useState<'class_teacher' | 'subject_teacher' | 'both' | 'all'>('all');
  const [tutorGrade, setTutorGrade] = useState<string>('grade_12');
  const [tutorSubjects, setTutorSubjects] = useState<string[]>([]);
  const [tutorSubjectsRaw, setTutorSubjectsRaw] = useState<string>('');

  // Fetch tutor authorization metadata from Supabase Auth

  // Fetch tutor authorization metadata from Supabase Auth
  useEffect(() => {
    const fetchTutorRoleMeta = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata) {
          const type = (user.user_metadata.tutor_type as 'class_teacher' | 'subject_teacher' | 'both') || 'all';
          const grade = (user.user_metadata.tutor_grade as string) || 'grade_12';
          const rawSubj = (user.user_metadata.tutor_subjects as string) || '';

          setTutorType(type);
          setTutorGrade(grade);
          setTutorSubjectsRaw(rawSubj);

          const parsedSubjects = rawSubj
            .split(',')
            .map((s) => s.trim().toLowerCase())
            .filter((s) => s.length > 0);
          setTutorSubjects(parsedSubjects);

          if (type === 'class_teacher' || type === 'both') {
            setSelectedGradeFilter(grade);
          }
        }
      } catch (e) {
        console.error('Failed to load tutor metadata:', e);
      }
    };
    fetchTutorRoleMeta();
  }, []);

  // Load published official notes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('edvoura_published_curriculum_notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setPublishedOfficialNoteIds(parsed);
      }
    } catch (e) {}
  }, []);

  const toggleOfficialNotePublish = async (noteId: string) => {
    const isCurrentlyPub = publishedOfficialNoteIds.includes(noteId);
    const nextStatus = isCurrentlyPub ? 'DRAFT' : 'PUBLISHED';

    setPublishedOfficialNoteIds((prev) => {
      const next = prev.includes(noteId) ? prev.filter((id) => id !== noteId) : [...prev, noteId];
      try {
        localStorage.setItem('edvoura_published_curriculum_notes', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // Persist live to Supabase database so all students across devices see it!
    try {
      const supabase = createClient();
      const allNotes = OFFICIAL_CURRICULUM_DATABASE[selectedGradeFilter] ?? PRIMARY_1_OFFICIAL_NOTES;
      const targetNote = allNotes.find((n) => n.id === noteId);

      if (targetNote) {
        await supabase.from('ai_generated_content').upsert({
          id: `official_pub_${targetNote.id}`,
          task_type: 'GENERATE_LESSON_NOTE',
          title: targetNote.title,
          subject: targetNote.subjectName,
          topic: targetNote.title,
          grade: targetNote.gradeCode || selectedGradeFilter || 'grade_3',
          status: nextStatus,
          content_json: {
            lesson_summary: targetNote.description,
            explanation: targetNote.description,
            official_file_url: targetNote.fileUrl,
            file_name: targetNote.fileName,
          },
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to sync published note state to Supabase:', err);
    }
  };

  const startEditPlan = (item: LessonPlan) => {
    setClassName(item.className);
    setTopic(item.topic);
    setDuration(item.duration);
    setLessonDate(item.lessonDate);
    setObjective(item.objective);
    setPriorKnowledge(item.priorKnowledge);
    setKeyVocabulary(item.keyVocabulary);
    setResources(item.resources);
    setDifferentiation(item.differentiation);
    setFormativeAssessment(item.formativeAssessment);
    setHomework(item.homework);
    setSafeguarding(item.safeguarding);
    setReflection(item.reflection);
    setTargetScope(item.targetScope || 'all_class');
    setTargetStudentName(item.targetStudentName || '');
    setEditingPlanId(item.id);
    setShowForm(true);
    setFeedback(`Editing lesson note: ${item.topic}`);
  };

  const deletePlan = (planId: string) => {
    setPlans((current) => current.filter((item) => item.id !== planId));
    if (editingPlanId === planId) {
      setEditingPlanId(null);
      setShowForm(false);
    }
    if (explainerPlanId === planId) {
      setExplainerPlanId(plans.find((item) => item.id !== planId)?.id ?? null);
      setExplainerResult(null);
    }
    setFeedback('Lesson note deleted.');
  };

  const selectedExplainerPlan =
    plans.find((item) => item.id === explainerPlanId) ?? plans[0] ?? null;

  const buildLessonNarrative = (plan: LessonPlan) =>
    [
      `Class: ${plan.className}`,
      `Topic: ${plan.topic}`,
      `Objective: ${plan.objective}`,
      `Prior knowledge: ${plan.priorKnowledge}`,
      `Key vocabulary: ${plan.keyVocabulary}`,
      `Resources: ${plan.resources}`,
      `Differentiation: ${plan.differentiation}`,
      `Formative assessment: ${plan.formativeAssessment}`,
      `Homework: ${plan.homework}`,
      `Teacher reflection: ${plan.reflection}`,
    ].join('\n');

  const runLessonExplainer = async () => {
    if (!selectedExplainerPlan) {
      setFeedback('Create a lesson note first before using the explainer.');
      return;
    }

    setIsExplaining(true);
    setExplainerResult(null);
    setFeedback('Edvoura AI is transforming this lesson note...');

    try {
      const response = await fetch('/api/ai/explain-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: explainerMode,
          topic: selectedExplainerPlan.topic,
          subject: selectedExplainerPlan.className,
          gradeLevel: selectedExplainerPlan.className,
          lessonText: buildLessonNarrative(selectedExplainerPlan),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFeedback(data.detail || data.error || 'Unable to explain this lesson.');
        return;
      }

      setExplainerResult(data.explanation);
      setFeedback(`Lesson explainer ready for ${selectedExplainerPlan.topic}.`);
    } catch (error: unknown) {
      setFeedback(error instanceof Error ? error.message : 'Unable to explain this lesson.');
    } finally {
      setIsExplaining(false);
    }
  };

  const stats = useMemo(() => {
    const draftCount = plans.filter((plan) => plan.status === 'Draft').length;
    const readyCount = plans.filter((plan) => plan.status === 'Ready').length;
    return {
      total: String(plans.length),
      ready: String(readyCount),
      draft: String(draftCount),
      packs: String(Math.max(8, plans.length + 4)),
    };
  }, [plans]);

  const createLessonPlan = (status: 'Ready' | 'Draft') => {
    const safeClass = className.trim();
    const safeTopic = topic.trim();
    const safeDuration = duration.trim();
    const safeDate = lessonDate.trim();
    const safeObjective = objective.trim();
    const safePriorKnowledge = priorKnowledge.trim();
    const safeVocabulary = keyVocabulary.trim();
    const safeResources = resources.trim();
    const safeDifferentiation = differentiation.trim();
    const safeAssessment = formativeAssessment.trim();
    const safeHomework = homework.trim();
    const safeSafeguarding = safeguarding.trim();
    const safeReflection = reflection.trim();

    if (
      !safeClass ||
      !safeTopic ||
      !safeDuration ||
      !safeDate ||
      !safeObjective ||
      !safePriorKnowledge ||
      !safeVocabulary ||
      !safeResources ||
      !safeDifferentiation ||
      !safeAssessment ||
      !safeHomework ||
      !safeSafeguarding ||
      !safeReflection
    ) {
      setFeedback('Complete all core lesson-note fields before saving.');
      return;
    }

    const newPlan: LessonPlan = {
      id: editingPlanId ?? `ln-${Date.now()}`,
      className: safeClass,
      topic: safeTopic,
      duration: safeDuration,
      lessonDate: safeDate,
      objective: safeObjective,
      priorKnowledge: safePriorKnowledge,
      keyVocabulary: safeVocabulary,
      resources: safeResources,
      differentiation: safeDifferentiation,
      formativeAssessment: safeAssessment,
      homework: safeHomework,
      safeguarding: safeSafeguarding,
      reflection: safeReflection,
      status,
      targetScope,
      targetStudentName: targetScope === 'specific_student' ? targetStudentName.trim() : '',
    };

    if (editingPlanId) {
      setPlans((current) => current.map((item) => (item.id === editingPlanId ? newPlan : item)));
    } else {
      setPlans((current) => [newPlan, ...current]);
    }
    setFeedback(
      editingPlanId
        ? 'Lesson note updated successfully.'
        : status === 'Ready'
          ? 'Lesson note created successfully.'
          : 'Lesson note saved as draft.',
    );
    setClassName('');
    setTopic('');
    setDuration('');
    setLessonDate('');
    setObjective('');
    setPriorKnowledge('');
    setKeyVocabulary('');
    setResources('');
    setDifferentiation('');
    setFormativeAssessment('');
    setHomework('');
    setSafeguarding('');
    setReflection('');
    setEditingPlanId(null);
    setShowForm(false);
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1400px] space-y-6 sm:space-y-8 pb-20">
      <section className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        
        {/* Header */}
        <div className="p-5 sm:p-8 md:p-12 border-b-[3px] sm:border-b-[4px] border-dark bg-yellow/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8 min-w-0">
            <div className="space-y-3 min-w-0 w-full">
              <span className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border-[2px] sm:border-[3px] border-dark bg-white text-[9px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] font-black shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] break-words max-w-full text-center">
                TEACHING MANAGEMENT
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark break-words">
                Lesson Notes & Plans
              </h1>
              <p className="text-sm md:text-base font-semibold normal-case text-dark/70 max-w-xl break-words">
                Prepare lesson plans, objectives, delivery notes, and class activities in one unified place.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 md:p-12 space-y-6 sm:space-y-8 min-w-0">

          {feedback ? (
            <section className="rounded-xl border-[3px] border-dark bg-blue-100 p-4 text-sm text-dark font-black shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] break-words">{feedback}</section>
          ) : null}

          <section className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-4 min-w-0">
            <Stat title="Plans This Week" value={stats.total} icon={ClipboardList} bgColor="bg-emerald-200" />
            <Stat title="Ready to Deliver" value={stats.ready} icon={CheckSquare} bgColor="bg-blue-200" />
            <Stat title="Draft Notes" value={stats.draft} icon={FilePenLine} bgColor="bg-amber-200" />
            <Stat title="Resource Packs" value={stats.packs} icon={BookOpen} bgColor="bg-rose-200" />
          </section>

          {/* ═══════════════════════ OFFICIAL PURCHASED CURRICULUM LESSON NOTES HUB ═══════════════════════ */}
          <section className="border-[3px] sm:border-[4px] border-dark rounded-[24px] bg-yellow/10 p-6 sm:p-8 shadow-[6px_6px_0px_#060E1C] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[3px] border-dark/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow border-[2px] border-dark rounded-lg text-[10px] font-black uppercase text-dark shadow-[2px_2px_0px_#060E1C] mb-2">
                  📚 Official Purchased Curriculum
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
                  {selectedGradeFilter === 'grade_12' ? 'SS 3 (Grade 12)' : selectedGradeFilter === 'grade_11' ? 'SS 2 (Grade 11)' : selectedGradeFilter === 'grade_10' ? 'SS 1 (Grade 10)' : selectedGradeFilter === 'grade_9' ? 'JSS 3 (Grade 9)' : selectedGradeFilter === 'grade_8' ? 'JSS 2 (Grade 8)' : selectedGradeFilter === 'grade_7' ? 'JSS 1 (Grade 7)' : selectedGradeFilter === 'grade_6' ? 'Primary 6 (Grade 6)' : selectedGradeFilter === 'grade_5' ? 'Primary 5 (Grade 5)' : selectedGradeFilter === 'grade_4' ? 'Primary 4 (Grade 4)' : selectedGradeFilter === 'grade_3' ? 'Primary 3 (Grade 3)' : selectedGradeFilter === 'grade_2' ? 'Primary 2 (Grade 2)' : 'Primary 1 (Grade 1)'} Master Lesson Notes
                </h2>
                <p className="text-xs sm:text-sm font-bold text-dark/70">
                  Published notes are automatically available to students on their dashboard & class library.
                </p>
              </div>

              <select
                value={selectedGradeFilter}
                onChange={(e) => setSelectedGradeFilter(e.target.value)}
                disabled={tutorType === 'class_teacher'}
                className={`px-4 py-2.5 rounded-xl border-[3px] border-dark bg-white font-black text-xs uppercase shadow-[3px_3px_0px_#060E1C] outline-none ${
                  tutorType === 'class_teacher' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <option value="grade_1">Primary 1 (Grade 1) - 9 Subjects</option>
                <option value="grade_2">Primary 2 (Grade 2) - 9 Subjects</option>
                <option value="grade_3">Primary 3 (Grade 3) - 9 Subjects</option>
                <option value="grade_4">Primary 4 (Grade 4) - 12 Subjects</option>
                <option value="grade_5">Primary 5 (Grade 5) - 12 Subjects</option>
                <option value="grade_6">Primary 6 (Grade 6) - 12 Subjects</option>
                <option value="grade_7">JSS 1 (Grade 7) - 18 Subjects</option>
                <option value="grade_8">JSS 2 (Grade 8) - 18 Subjects</option>
                <option value="grade_9">JSS 3 (Grade 9) - 18 Subjects</option>
                <option value="grade_10">SS 1 (Grade 10) - 28 Subjects</option>
                <option value="grade_11">SS 2 (Grade 11) - 28 Subjects</option>
                <option value="grade_12">SS 3 (Grade 12) - 27 Subjects</option>
              </select>
            </div>

            {/* Intellectual Authorization Banner */}
            {tutorType !== 'all' && (
              <div className="p-4 rounded-xl border-[3px] border-dark bg-white shadow-[3px_3px_0px_#060E1C] flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-yellow border-[2px] border-dark shrink-0">
                  <Lock className="w-4 h-4 text-dark" />
                </div>
                <div className="text-xs font-bold text-dark">
                  <span className="font-black uppercase tracking-wider text-[10px] text-dark/70 block">🔒 Intellectual Access Filter Active</span>
                  {tutorType === 'class_teacher' && `Assigned Class Teacher (${selectedGradeFilter.replace('grade_', 'Grade ')}). You have full access to all subjects in your class.`}
                  {tutorType === 'subject_teacher' && `Assigned Subject Teacher (${tutorSubjectsRaw || 'Assigned Subjects'}). Showing only authorized subject notes.`}
                  {tutorType === 'both' && `Class & Subject Teacher. Authorized for Class (${tutorGrade.replace('grade_', 'Grade ')}) and Subjects (${tutorSubjectsRaw}).`}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {((OFFICIAL_CURRICULUM_DATABASE[selectedGradeFilter] ?? PRIMARY_1_OFFICIAL_NOTES).filter((note) => {
                if (tutorType === 'all') return true;
                const isAssignedGrade = selectedGradeFilter === tutorGrade;
                const noteSubj = note.subjectName.toLowerCase();
                const isAssignedSubject =
                  tutorSubjects.length === 0 ||
                  tutorSubjects.some((ts) => noteSubj.includes(ts) || ts.includes(noteSubj));

                if (tutorType === 'class_teacher') return isAssignedGrade;
                if (tutorType === 'subject_teacher') return isAssignedSubject;
                if (tutorType === 'both') return isAssignedGrade || isAssignedSubject;
                return true;
              })).map((note) => {
                const isPub = publishedOfficialNoteIds.includes(note.id);
                return (
                  <div
                    key={note.id}
                    className="border-[3px] border-dark rounded-[20px] bg-white p-5 shadow-[4px_4px_0px_#060E1C] flex flex-col justify-between hover:translate-y-[-2px] transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-indigo-100 border-[2px] border-dark rounded-md text-[10px] font-black uppercase text-indigo-900 shadow-[2px_2px_0px_#060E1C]">
                          {note.subjectName}
                        </span>
                        <span className={`px-2 py-0.5 border-[2px] border-dark rounded-md text-[9px] font-black uppercase tracking-wider ${isPub ? 'bg-emerald-300 text-dark' : 'bg-slate-200 text-dark/60'}`}>
                          {isPub ? 'Live for Students' : 'Draft / Locked'}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-extrabold text-dark mb-2 leading-[1.4] tracking-tight break-words" style={{ lineHeight: '1.4' }}>{note.title}</h3>
                      <p className="text-xs font-bold text-dark/60 mb-4 line-clamp-3">{note.description}</p>
                    </div>

                    <div className="space-y-2 pt-3 border-t-[2px] border-dark/10">
                      {/* Weekly Access Pacing Lock Selector */}
                      <div className="p-2.5 rounded-xl border-[2px] border-dark bg-slate-50 space-y-1">
                        <label className="block text-[9px] font-black uppercase text-dark/70 tracking-wider">
                          🔒 Weekly Curriculum Pacing Control:
                        </label>
                        <select
                          value={unlockedNoteWeeks[note.id] || 1}
                          onChange={(e) => {
                            const w = Number(e.target.value);
                            setUnlockedNoteWeeks((prev) => ({ ...prev, [note.id]: w }));
                            setFeedback(`Pacing lock updated for "${note.title}": Unlocked up to Week ${w}.`);
                          }}
                          className="w-full py-1.5 px-2 bg-white border-[1.5px] border-dark rounded-lg text-[10px] font-black text-dark outline-none cursor-pointer"
                        >
                          <option value={1}>Week 1 Only (Current Active Lesson)</option>
                          <option value={2}>Up to Week 2 (Lesson 1 & 2)</option>
                          <option value={3}>Up to Week 3 (Lessons 1-3)</option>
                          <option value={4}>Up to Week 4 (Lessons 1-4)</option>
                          <option value={6}>Up to Week 6 (Mid-Term Scope)</option>
                          <option value={12}>Up to Week 12 (1st Term Complete)</option>
                          <option value={24}>Up to Week 24 (2nd Term Complete)</option>
                          <option value={36}>🌟 Unlock All 36 Weeks (Full Year)</option>
                        </select>
                      </div>

                      {/* Redesigned Premium Action Buttons */}
                      <button
                        type="button"
                        onClick={() => {
                          setActivePdfUrl(note.fileUrl);
                          setActivePdfTitle(note.title);
                          setActivePdfNoteId(note.id);
                        }}
                        className="w-full py-2.5 bg-yellow hover:bg-yellow-400 text-dark border-[2.5px] border-dark rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>👁️ Preview Note</span>
                        <span className="px-2 py-0.5 bg-dark text-yellow rounded-md text-[9px] font-black uppercase">
                          Wk 1-{unlockedNoteWeeks[note.id] || 1}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTargetPublishNote({
                            id: note.id,
                            title: note.title,
                            gradeLevel: note.gradeName || 'Primary 1',
                          });
                        }}
                        className={`w-full py-2.5 border-[2.5px] border-dark rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          isPub
                            ? 'bg-emerald-400 hover:bg-emerald-500 text-dark'
                            : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                        }`}
                      >
                        <span>{isPub ? '✅ Published Live to Class' : '🚀 Publish Note to Class'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-12 min-w-0">
            
            <div className="space-y-6 xl:col-span-8 min-w-0">
              <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] overflow-hidden min-w-0">
                <div className="p-5 sm:p-6 border-b-[3px] border-dark bg-off-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight break-words">Current Lesson Plans</h2>
                  <Button className="w-full sm:w-auto bg-dark text-white border-[2px] sm:border-[3px] border-dark font-black rounded-xl shadow-[2px_2px_0px_#F5C518] sm:shadow-[3px_3px_0px_#F5C518] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 text-xs px-4 py-3 flex justify-center" onClick={() => setShowForm((v) => !v)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {showForm ? 'Close Form' : 'New Lesson Note'}
                  </Button>
                </div>
                
                <div className="p-5 sm:p-6 space-y-6 min-w-0">
                  {showForm ? (
                    <div className="rounded-[20px] sm:rounded-2xl border-[3px] border-dark bg-blue-50 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0">
                      <h3 className="text-lg sm:text-xl font-black text-dark tracking-tight break-words">
                        {editingPlanId ? 'Edit Lesson Note' : 'Create Lesson Note'}
                      </h3>
                      <div className="mt-4 sm:mt-6 space-y-4 min-w-0">
                        <input
                          value={className}
                          onChange={(event) => setClassName(event.target.value)}
                          placeholder="Class name (e.g., Grade 3 Mathematics)"
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />

                        {/* 🎯 Target Recipient Scope Selector */}
                        <div className="p-4 rounded-xl border-[2.5px] border-dark bg-amber-50 space-y-3">
                          <label className="block text-xs font-black uppercase text-dark tracking-wider">
                            🎯 Target Distribution Scope (Who receives this note?)
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setTargetScope('all_class')}
                              className={`px-3.5 py-2 rounded-lg border-[2px] border-dark text-xs font-black transition-all cursor-pointer ${
                                targetScope === 'all_class'
                                  ? 'bg-amber-400 text-dark shadow-[2px_2px_0px_#000]'
                                  : 'bg-white text-dark/70'
                              }`}
                            >
                              📢 Entire Grade/Class
                            </button>
                            <button
                              type="button"
                              onClick={() => setTargetScope('specific_student')}
                              className={`px-3.5 py-2 rounded-lg border-[2px] border-dark text-xs font-black transition-all cursor-pointer ${
                                targetScope === 'specific_student'
                                  ? 'bg-purple-400 text-dark shadow-[2px_2px_0px_#000]'
                                  : 'bg-white text-dark/70'
                              }`}
                            >
                              🎯 Specific Student(s) (e.g. Titomi)
                            </button>
                          </div>

                          {targetScope === 'specific_student' && (
                            <div className="space-y-2 pt-2 border-t border-dark/20">
                              <input
                                type="text"
                                value={targetStudentName}
                                onChange={(e) => setTargetStudentName(e.target.value)}
                                placeholder="Enter student name (e.g. Titomi)..."
                                className="w-full px-3.5 py-2.5 rounded-lg border-[2px] border-dark text-xs font-bold text-dark bg-white focus:outline-none"
                              />
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-extrabold text-dark/80">
                                <span>Quick Select Student:</span>
                                {['Titomi (Grade 3)', 'Alex (Grade 3)', 'David (Grade 2)', 'Sophia (Grade 4)'].map((name) => (
                                  <button
                                    key={name}
                                    type="button"
                                    onClick={() => setTargetStudentName(name)}
                                    className="px-2 py-0.5 bg-white border border-dark rounded hover:bg-yellow text-[10px] font-bold cursor-pointer"
                                  >
                                    + {name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <input
                          value={topic}
                          onChange={(event) => setTopic(event.target.value)}
                          placeholder="Topic"
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <input
                            value={lessonDate}
                            onChange={(event) => setLessonDate(event.target.value)}
                            type="date"
                            className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                          />
                          <input
                            value={duration}
                            onChange={(event) => setDuration(event.target.value)}
                            placeholder="Duration (e.g., 60 mins)"
                            className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                          />
                        </div>
                        <textarea
                          value={objective}
                          onChange={(event) => setObjective(event.target.value)}
                          placeholder="Learning objective(s)"
                          rows={3}
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={priorKnowledge}
                          onChange={(event) => setPriorKnowledge(event.target.value)}
                          placeholder="Prior knowledge/bridge from last lesson"
                          rows={2}
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <input
                          value={keyVocabulary}
                          onChange={(event) => setKeyVocabulary(event.target.value)}
                          placeholder="Key vocabulary"
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={resources}
                          onChange={(event) => setResources(event.target.value)}
                          placeholder="Teaching resources/materials"
                          rows={2}
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={differentiation}
                          onChange={(event) => setDifferentiation(event.target.value)}
                          placeholder="Differentiation and SEND/ELL support"
                          rows={2}
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={formativeAssessment}
                          onChange={(event) => setFormativeAssessment(event.target.value)}
                          placeholder="Formative assessment and checks for understanding"
                          rows={2}
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={homework}
                          onChange={(event) => setHomework(event.target.value)}
                          placeholder="Homework / independent practice"
                          rows={2}
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={safeguarding}
                          onChange={(event) => setSafeguarding(event.target.value)}
                          placeholder="Safeguarding and classroom management notes"
                          rows={2}
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={reflection}
                          onChange={(event) => setReflection(event.target.value)}
                          placeholder="Teacher reflection / next-step adjustment"
                          rows={2}
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-4 border-t-[3px] border-dark/10 min-w-0">
                          <Button className="w-full sm:w-auto bg-emerald-400 border-[2px] sm:border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-3 h-auto text-xs sm:text-sm" onClick={() => createLessonPlan('Ready')}>
                            {editingPlanId ? 'Update as Ready' : 'Save as Ready'}
                          </Button>
                          <Button className="w-full sm:w-auto bg-white border-[2px] sm:border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-3 h-auto text-xs sm:text-sm" onClick={() => createLessonPlan('Draft')}>
                            {editingPlanId ? 'Update as Draft' : 'Save as Draft'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {plans.map((item) => (
                    <div key={item.id} className="rounded-[20px] sm:rounded-2xl border-[3px] border-dark bg-off-white p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0">
                      <div className="mb-4 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.12em] text-dark bg-white px-3 py-1.5 sm:py-1 rounded-md border-[2px] border-dark break-words max-w-full">
                            {item.className} | {item.lessonDate} | {item.duration}
                          </p>
                          <span className={`px-2.5 py-1 text-[10px] font-black rounded-md border-[2px] border-dark ${
                            item.targetScope === 'specific_student'
                              ? 'bg-purple-200 text-purple-950'
                              : 'bg-amber-200 text-amber-950'
                          }`}>
                            {item.targetScope === 'specific_student'
                              ? `🎯 Target: ${item.targetStudentName || 'Specific Student'}`
                              : '📢 Scope: Entire Class'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                          <Button className="flex-1 sm:flex-none h-10 sm:h-8 border-[2px] border-dark bg-white text-dark font-black text-xs hover:bg-slate-50 shadow-[2px_2px_0px_#060E1C] transition-all active:translate-y-[1px] active:translate-x-[1px] active:shadow-none" onClick={() => startEditPlan(item)}>
                            <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button className="flex-1 sm:flex-none h-10 sm:h-8 border-[2px] border-dark bg-rose-100 text-rose-700 font-black text-xs hover:bg-rose-200 shadow-[2px_2px_0px_#060E1C] transition-all active:translate-y-[1px] active:translate-x-[1px] active:shadow-none" onClick={() => deletePlan(item.id)}>
                            <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                      </div>
                      <p className="mt-2 text-xl sm:text-2xl font-black text-dark tracking-tight break-words">{item.topic}</p>
                      <p className="mt-2 text-xs sm:text-sm font-bold text-dark/70 break-words">{item.objective}</p>
                      <div className="mt-4 space-y-2 border-t-[2px] border-dark/10 pt-4 min-w-0">
                        <p className="text-xs text-dark/70 font-semibold"><strong className="text-dark font-black uppercase tracking-widest">Assessment:</strong> {item.formativeAssessment}</p>
                        <p className="text-xs text-dark/70 font-semibold"><strong className="text-dark font-black uppercase tracking-widest">Differentiation:</strong> {item.differentiation}</p>
                        <p className="text-xs text-dark/70 font-semibold"><strong className="text-dark font-black uppercase tracking-widest">Safeguarding:</strong> {item.safeguarding}</p>
                      </div>
                      <p className={`mt-4 inline-flex px-3 py-1 text-xs font-black uppercase tracking-widest border-[2px] border-dark rounded-lg ${item.status === 'Ready' ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}`}>
                        Status: {item.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 xl:col-span-4 min-w-0">
              <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-white p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-dark mb-4 break-words">Plan Checklist</h3>
                <div className="space-y-3 text-xs sm:text-sm font-semibold text-dark/80 min-w-0">
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Learning objective defined</div>
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Starter activity prepared</div>
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Practice questions prepared</div>
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Exit ticket drafted</div>
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Differentiation strategy included</div>
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Safeguarding protocol set</div>
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Homework and reflection</div>
                </div>
              </div>

              <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-blue-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-dark mb-4 flex items-center gap-2 break-words">
                  <Target className="h-5 w-5 text-dark shrink-0" />
                  Veteran Standard
                </h3>
                <div className="space-y-3 text-xs sm:text-sm font-semibold text-dark/80 min-w-0">
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">Objective must be measurable and observable.</div>
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">At least two formative checks during delivery.</div>
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">Plan remediation for struggling learners.</div>
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">End lesson with reflection and next-step plan.</div>
                </div>
              </div>

              <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-yellow/20 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] space-y-4 min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-dark flex items-center gap-2 break-words">
                  <Sparkles className="h-5 w-5 text-dark shrink-0" />
                  Lesson Explainer
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-dark/70 break-words">
                  Rework any lesson note into a simpler explanation, harder examples, quick checks, or revision notes.
                </p>
                <select
                  value={explainerPlanId ?? ''}
                  onChange={(event) => {
                    setExplainerPlanId(event.target.value);
                    setExplainerResult(null);
                  }}
                  className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.className} - {plan.topic}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'simple', label: 'Explain Simply' },
                    { value: 'harder_examples', label: 'Harder Examples' },
                    { value: 'checks_for_understanding', label: '5 Checks' },
                    { value: 'revision_notes', label: 'Revision Notes' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setExplainerMode(item.value as typeof explainerMode)}
                      className={`rounded-xl border-[2px] sm:border-[3px] px-2 sm:px-3 py-2 sm:py-3 text-left text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all min-w-0 break-words ${
                        explainerMode === item.value
                          ? 'border-dark bg-dark text-white shadow-[2px_2px_0px_#F5C518] sm:shadow-[3px_3px_0px_#F5C518]'
                          : 'border-dark bg-white text-dark shadow-[2px_2px_0px_#060E1C] sm:shadow-[3px_3px_0px_#060E1C]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <Button
                  className="w-full bg-yellow border-[2px] sm:border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] h-auto py-3 sm:py-4 text-xs sm:text-sm break-words whitespace-normal"
                  disabled={!selectedExplainerPlan || isExplaining}
                  onClick={() => void runLessonExplainer()}
                >
                  {isExplaining ? 'Explaining...' : 'Run Edvoura AI Explainer'}
                </Button>

                <div className="rounded-[20px] sm:rounded-2xl border-[3px] border-dark bg-white p-4 shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-dark/50 break-words">
                    Explainer Output
                  </p>
                  {explainerResult ? (
                    <div className="mt-4 space-y-3 text-xs sm:text-sm font-semibold text-dark/80 min-w-0">
                      <p className="text-base sm:text-lg font-black text-dark break-words">{explainerResult.title}</p>
                      <p className="break-words">{explainerResult.explanation}</p>
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
                          <p className="text-[10px] font-black uppercase tracking-widest text-dark/50">Checks for Understanding</p>
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
                          <p className="text-[10px] font-black uppercase tracking-widest text-dark/50">Revision Notes</p>
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
                      Select a lesson note and let Edvoura AI reframe it for delivery or revision.
                    </p>
                  )}
                </div>
              </div>

              <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-rose-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-dark mb-4 flex items-center gap-2 break-words">
                  <ShieldCheck className="h-5 w-5 text-dark shrink-0" />
                  Lesson Safety
                </h3>
                <div className="space-y-3 text-xs sm:text-sm font-semibold text-dark/80 min-w-0">
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">Safe activity flow and supervision points</div>
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">Respectful classroom language standards</div>
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">Sensitive learner support notes</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
      <PDFViewerModal
        isOpen={activePdfUrl !== null}
        onClose={() => {
          setActivePdfUrl(null);
          setActivePdfTitle('');
          setActivePdfNoteId('');
        }}
        pdfUrl={activePdfUrl}
        title={activePdfTitle}
        unlockedWeek={unlockedNoteWeeks[activePdfNoteId] || 1}
        subjectId={activePdfNoteId}
      />

      {targetPublishNote && (
        <PublishTargetModal
          isOpen={targetPublishNote !== null}
          onClose={() => setTargetPublishNote(null)}
          noteTitle={targetPublishNote.title}
          gradeLevel={targetPublishNote.gradeLevel}
          unlockedWeek={unlockedNoteWeeks[targetPublishNote.id] || 1}
          isAlreadyPublished={publishedOfficialNoteIds.includes(targetPublishNote.id)}
          onConfirmPublish={(selectedClass, _students, notifyParents) => {
            const isCurrentlyPublished = publishedOfficialNoteIds.includes(targetPublishNote.id);
            toggleOfficialNotePublish(targetPublishNote.id);
            const isNowPublished = !isCurrentlyPublished;
            const w = unlockedNoteWeeks[targetPublishNote.id] || 1;
            setFeedback(
              isNowPublished
                ? `🎉 Note "${targetPublishNote.title}" successfully published live to ${selectedClass} with Week 1-${w} pacing unlocked! ${notifyParents ? 'Parent notifications dispatched to guardians.' : ''}`
                : `ℹ️ Note "${targetPublishNote.title}" successfully unpublished and removed from student access.`
            );
          }}
        />
      )}
    </div>
  );
}

function Stat({
  title,
  value,
  icon: Icon,
  bgColor = "bg-white"
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor?: string;
}) {
  return (
    <div className={`border-[3px] border-dark rounded-[20px] sm:rounded-2xl ${bgColor} p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0`}>
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-dark/70 break-words">{title}</p>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-black text-dark">{value}</p>
        </div>
        <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl border-[3px] border-dark bg-white flex items-center justify-center shadow-[2px_2px_0px_#060E1C]">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-dark" />
        </div>
      </div>
    </div>
  );
}
