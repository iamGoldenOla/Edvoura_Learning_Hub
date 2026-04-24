'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, CheckSquare, ClipboardList, FilePenLine, Pencil, PlusCircle, ShieldCheck, Target, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

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
};

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
    setFeedback('Lesson note deleted.');
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-6 sm:p-8 pb-20">
      <section className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        
        {/* Header */}
        <div className="p-8 md:p-12 border-b-[4px] border-dark bg-yellow/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3 min-w-0">
              <span className="inline-flex items-center gap-2 px-4 py-2 border-[3px] border-dark bg-white text-[10px] tracking-[0.2em] font-black shadow-[4px_4px_0px_#060E1C]">
                TEACHING MANAGEMENT
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
                Lesson Notes & Plans
              </h1>
              <p className="text-sm md:text-base font-semibold normal-case text-dark/70 max-w-xl">
                Prepare lesson plans, objectives, delivery notes, and class activities in one unified place.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-8">

          {feedback ? (
            <section className="rounded-xl border-[3px] border-dark bg-blue-100 p-4 text-sm text-dark font-black shadow-[5px_5px_0px_#060E1C]">{feedback}</section>
          ) : null}

          <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
            <Stat title="Plans This Week" value={stats.total} icon={ClipboardList} bgColor="bg-emerald-200" />
            <Stat title="Ready to Deliver" value={stats.ready} icon={CheckSquare} bgColor="bg-blue-200" />
            <Stat title="Draft Notes" value={stats.draft} icon={FilePenLine} bgColor="bg-amber-200" />
            <Stat title="Resource Packs" value={stats.packs} icon={BookOpen} bgColor="bg-rose-200" />
          </section>

          <section className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            
            <div className="space-y-6 xl:col-span-8">
              <div className="border-[3px] border-dark rounded-3xl bg-white shadow-[8px_8px_0px_#060E1C] overflow-hidden">
                <div className="p-6 border-b-[3px] border-dark bg-off-white flex flex-row items-center justify-between">
                  <h2 className="text-2xl font-black text-dark tracking-tight">Current Lesson Plans</h2>
                  <Button className="bg-dark text-white border-[3px] border-dark font-black rounded-xl shadow-[3px_3px_0px_#F5C518] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 text-xs px-4 py-2" onClick={() => setShowForm((v) => !v)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {showForm ? 'Close Form' : 'New Lesson Note'}
                  </Button>
                </div>
                
                <div className="p-6 space-y-6">
                  {showForm ? (
                    <div className="rounded-2xl border-[3px] border-dark bg-blue-50 p-6 shadow-[5px_5px_0px_#060E1C]">
                      <h3 className="text-xl font-black text-dark tracking-tight">
                        {editingPlanId ? 'Edit Lesson Note' : 'Create Lesson Note'}
                      </h3>
                      <div className="mt-6 space-y-4">
                        <input
                          value={className}
                          onChange={(event) => setClassName(event.target.value)}
                          placeholder="Class name (e.g., JSS3 Mathematics)"
                          className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <input
                          value={topic}
                          onChange={(event) => setTopic(event.target.value)}
                          placeholder="Topic"
                          className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <input
                            value={lessonDate}
                            onChange={(event) => setLessonDate(event.target.value)}
                            type="date"
                            className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                          />
                          <input
                            value={duration}
                            onChange={(event) => setDuration(event.target.value)}
                            placeholder="Duration (e.g., 60 mins)"
                            className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                          />
                        </div>
                        <textarea
                          value={objective}
                          onChange={(event) => setObjective(event.target.value)}
                          placeholder="Learning objective(s)"
                          rows={3}
                          className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={priorKnowledge}
                          onChange={(event) => setPriorKnowledge(event.target.value)}
                          placeholder="Prior knowledge/bridge from last lesson"
                          rows={2}
                          className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <input
                          value={keyVocabulary}
                          onChange={(event) => setKeyVocabulary(event.target.value)}
                          placeholder="Key vocabulary"
                          className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={resources}
                          onChange={(event) => setResources(event.target.value)}
                          placeholder="Teaching resources/materials"
                          rows={2}
                          className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={differentiation}
                          onChange={(event) => setDifferentiation(event.target.value)}
                          placeholder="Differentiation and SEND/ELL support"
                          rows={2}
                          className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={formativeAssessment}
                          onChange={(event) => setFormativeAssessment(event.target.value)}
                          placeholder="Formative assessment and checks for understanding"
                          rows={2}
                          className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={homework}
                          onChange={(event) => setHomework(event.target.value)}
                          placeholder="Homework / independent practice"
                          rows={2}
                          className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={safeguarding}
                          onChange={(event) => setSafeguarding(event.target.value)}
                          placeholder="Safeguarding and classroom management notes"
                          rows={2}
                          className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={reflection}
                          onChange={(event) => setReflection(event.target.value)}
                          placeholder="Teacher reflection / next-step adjustment"
                          rows={2}
                          className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <div className="flex flex-wrap gap-4 pt-4 border-t-[3px] border-dark/10">
                          <Button className="bg-emerald-400 border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-3 h-auto" onClick={() => createLessonPlan('Ready')}>
                            {editingPlanId ? 'Update as Ready' : 'Save as Ready'}
                          </Button>
                          <Button className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-3 h-auto" onClick={() => createLessonPlan('Draft')}>
                            {editingPlanId ? 'Update as Draft' : 'Save as Draft'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {plans.map((item) => (
                    <div key={item.id} className="rounded-2xl border-[3px] border-dark bg-off-white p-6 shadow-[5px_5px_0px_#060E1C]">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-dark bg-white px-3 py-1 rounded-md border-[2px] border-dark">
                          {item.className} | {item.lessonDate} | {item.duration}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button className="h-8 border-[2px] border-dark bg-white text-dark font-black text-xs hover:bg-slate-50 shadow-[2px_2px_0px_#060E1C] transition-all active:translate-y-[1px] active:translate-x-[1px] active:shadow-none" onClick={() => startEditPlan(item)}>
                            <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button className="h-8 border-[2px] border-dark bg-rose-100 text-rose-700 font-black text-xs hover:bg-rose-200 shadow-[2px_2px_0px_#060E1C] transition-all active:translate-y-[1px] active:translate-x-[1px] active:shadow-none" onClick={() => deletePlan(item.id)}>
                            <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                      </div>
                      <p className="mt-2 text-2xl font-black text-dark tracking-tight">{item.topic}</p>
                      <p className="mt-2 text-sm font-bold text-dark/70">{item.objective}</p>
                      <div className="mt-4 space-y-2 border-t-[2px] border-dark/10 pt-4">
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

            <div className="space-y-6 xl:col-span-4">
              <div className="border-[3px] border-dark rounded-3xl bg-white p-6 shadow-[5px_5px_0px_#060E1C]">
                <h3 className="text-xl font-black text-dark mb-4">Plan Checklist</h3>
                <div className="space-y-3 text-sm font-semibold text-dark/80">
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Learning objective defined</div>
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Starter activity prepared</div>
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Practice questions prepared</div>
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Exit ticket drafted</div>
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Differentiation strategy included</div>
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Safeguarding protocol set</div>
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Homework and reflection</div>
                </div>
              </div>

              <div className="border-[3px] border-dark rounded-3xl bg-blue-100 p-6 shadow-[5px_5px_0px_#060E1C]">
                <h3 className="text-xl font-black text-dark mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-dark" />
                  Veteran Standard
                </h3>
                <div className="space-y-3 text-sm font-semibold text-dark/80">
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">Objective must be measurable and observable.</div>
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">At least two formative checks during delivery.</div>
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">Plan remediation for struggling learners.</div>
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">End lesson with reflection and next-step plan.</div>
                </div>
              </div>

              <div className="border-[3px] border-dark rounded-3xl bg-rose-100 p-6 shadow-[5px_5px_0px_#060E1C]">
                <h3 className="text-xl font-black text-dark mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-dark" />
                  Lesson Safety
                </h3>
                <div className="space-y-3 text-sm font-semibold text-dark/80">
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">Safe activity flow and supervision points</div>
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">Respectful classroom language standards</div>
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">Sensitive learner support notes</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
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
    <div className={`border-[3px] border-dark rounded-2xl ${bgColor} p-6 shadow-[5px_5px_0px_#060E1C]`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-dark/70">{title}</p>
          <p className="mt-2 text-3xl font-black text-dark">{value}</p>
        </div>
        <div className="h-12 w-12 rounded-xl border-[3px] border-dark bg-white flex items-center justify-center shadow-[2px_2px_0px_#060E1C]">
          <Icon className="h-6 w-6 text-dark" />
        </div>
      </div>
    </div>
  );
}
