'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, CheckSquare, ClipboardList, FilePenLine, Pencil, PlusCircle, ShieldCheck, Target, Trash2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-edvoura-navy">Lesson Notes and Plans</h1>
        <p className="mt-2 text-sm text-slate-600">
          Prepare lesson plans, objectives, delivery notes, and class activities.
        </p>
      </section>

      {feedback ? (
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">{feedback}</section>
      ) : null}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <Stat title="Plans This Week" value={stats.total} icon={ClipboardList} />
        <Stat title="Ready to Deliver" value={stats.ready} icon={CheckSquare} />
        <Stat title="Draft Notes" value={stats.draft} icon={FilePenLine} />
        <Stat title="Resource Packs" value={stats.packs} icon={BookOpen} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Current Lesson Plans</CardTitle>
              <Button variant="primary" className="text-xs" onClick={() => setShowForm((v) => !v)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {showForm ? 'Close Form' : 'New Lesson Note'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {showForm ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {editingPlanId ? 'Edit Lesson Note' : 'Create Lesson Note'}
                  </h3>
                  <div className="mt-3 space-y-3">
                    <input
                      value={className}
                      onChange={(event) => setClassName(event.target.value)}
                      placeholder="Class name (e.g., JSS3 Mathematics)"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />
                    <input
                      value={topic}
                      onChange={(event) => setTopic(event.target.value)}
                      placeholder="Topic"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <input
                        value={lessonDate}
                        onChange={(event) => setLessonDate(event.target.value)}
                        type="date"
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                      />
                      <input
                        value={duration}
                        onChange={(event) => setDuration(event.target.value)}
                        placeholder="Duration (e.g., 60 mins)"
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                      />
                    </div>
                    <textarea
                      value={objective}
                      onChange={(event) => setObjective(event.target.value)}
                      placeholder="Learning objective(s)"
                      rows={3}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />
                    <textarea
                      value={priorKnowledge}
                      onChange={(event) => setPriorKnowledge(event.target.value)}
                      placeholder="Prior knowledge/bridge from last lesson"
                      rows={2}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />
                    <input
                      value={keyVocabulary}
                      onChange={(event) => setKeyVocabulary(event.target.value)}
                      placeholder="Key vocabulary"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />
                    <textarea
                      value={resources}
                      onChange={(event) => setResources(event.target.value)}
                      placeholder="Teaching resources/materials"
                      rows={2}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />
                    <textarea
                      value={differentiation}
                      onChange={(event) => setDifferentiation(event.target.value)}
                      placeholder="Differentiation and SEND/ELL support"
                      rows={2}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />
                    <textarea
                      value={formativeAssessment}
                      onChange={(event) => setFormativeAssessment(event.target.value)}
                      placeholder="Formative assessment and checks for understanding"
                      rows={2}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />
                    <textarea
                      value={homework}
                      onChange={(event) => setHomework(event.target.value)}
                      placeholder="Homework / independent practice"
                      rows={2}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />
                    <textarea
                      value={safeguarding}
                      onChange={(event) => setSafeguarding(event.target.value)}
                      placeholder="Safeguarding and classroom management notes"
                      rows={2}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />
                    <textarea
                      value={reflection}
                      onChange={(event) => setReflection(event.target.value)}
                      placeholder="Teacher reflection / next-step adjustment"
                      rows={2}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button variant="primary" className="text-xs" onClick={() => createLessonPlan('Ready')}>
                        {editingPlanId ? 'Update as Ready' : 'Save as Ready'}
                      </Button>
                      <Button variant="outline" className="border-slate-300 bg-white text-xs" onClick={() => createLessonPlan('Draft')}>
                        {editingPlanId ? 'Update as Draft' : 'Save as Draft'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}

              {plans.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-end gap-1">
                    <Button variant="outline" className="h-7 border-slate-300 bg-white px-2 text-xs" onClick={() => startEditPlan(item)}>
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button variant="outline" className="h-7 border-rose-300 bg-white px-2 text-xs text-rose-700" onClick={() => deletePlan(item.id)}>
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {item.className} | {item.lessonDate} | {item.duration}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{item.topic}</p>
                  <p className="mt-1 text-xs text-slate-600">{item.objective}</p>
                  <p className="mt-1 text-xs text-slate-600"><strong>Assessment:</strong> {item.formativeAssessment}</p>
                  <p className="mt-1 text-xs text-slate-600"><strong>Differentiation:</strong> {item.differentiation}</p>
                  <p className="mt-1 text-xs text-slate-600"><strong>Safeguarding:</strong> {item.safeguarding}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-700">Status: {item.status}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <div className="rounded-lg border border-slate-200 bg-white p-3">Learning objective defined</div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">Starter activity prepared</div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">Practice questions prepared</div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">Exit ticket drafted</div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">Differentiation strategy included</div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">Safeguarding and behavior protocol set</div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">Homework and reflection completed</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4 text-slate-600" />
                Veteran Teaching Standard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                Objective must be measurable and observable.
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                At least two formative checks during delivery.
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                Plan remediation for struggling learners.
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                End lesson with reflection and next-step plan.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-600" />
                Lesson Safety Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <div className="rounded-lg border border-slate-200 bg-white p-3">Safe activity flow and supervision points</div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">Respectful classroom language standards</div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">Sensitive learner support notes</div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function Stat({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
        </div>
        <Icon className="h-5 w-5 text-slate-500" />
      </CardContent>
    </Card>
  );
}
