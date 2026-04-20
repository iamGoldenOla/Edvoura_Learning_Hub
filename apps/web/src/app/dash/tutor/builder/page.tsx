'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileUp, NotebookPen, Pencil, Star, Target, Trash2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Assignment = {
  id: string;
  title: string;
  className: string;
  due: string;
};

type Quiz = {
  id: string;
  title: string;
  className: string;
  items: number;
};

const baseAssignments: Assignment[] = [
  { id: 'as-1', title: 'Fractions Worksheet', className: 'JSS3 Mathematics', due: 'Due in 1 day' },
  { id: 'as-2', title: 'Forces Practical Notes', className: 'Grade 4 Science', due: 'Due in 2 days' },
];

const baseQuizzes: Quiz[] = [
  { id: 'q-1', title: 'Algebra Timed Quiz', className: 'JSS3 Mathematics', items: 15 },
  { id: 'q-2', title: 'Science Concept Check', className: 'Grade 4 Science', items: 10 },
];

export default function TutorBuilderPage() {
  const searchParams = useSearchParams();
  const preselectTool = searchParams.get('tool');
  const preselectAction = searchParams.get('action');

  const [assignments, setAssignments] = useState<Assignment[]>(baseAssignments);
  const [quizzes, setQuizzes] = useState<Quiz[]>(baseQuizzes);
  const [activeTool, setActiveTool] = useState<string>(preselectTool ?? 'assignment');
  const [feedback, setFeedback] = useState('');

  const [showAssignmentForm, setShowAssignmentForm] = useState<boolean>(
    preselectTool === 'assignment' && preselectAction === 'new',
  );
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentClass, setAssignmentClass] = useState('');
  const [assignmentDue, setAssignmentDue] = useState('');
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [assignmentResourceName, setAssignmentResourceName] = useState('');
  const [selectedByAssignment, setSelectedByAssignment] = useState<Record<string, string>>({});
  const [uploadedByAssignment, setUploadedByAssignment] = useState<Record<string, string>>({});

  const [showQuizForm, setShowQuizForm] = useState<boolean>(
    preselectTool === 'quiz' && preselectAction === 'new',
  );
  const [quizTitle, setQuizTitle] = useState('');
  const [quizClass, setQuizClass] = useState('');
  const [quizItems, setQuizItems] = useState('');
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  const createAssignment = () => {
    const safeTitle = assignmentTitle.trim();
    const safeClass = assignmentClass.trim();
    const safeDue = assignmentDue.trim();

    if (!safeTitle || !safeClass || !safeDue) {
      setFeedback('Please fill assignment title, class, and due date.');
      return;
    }

    if (editingAssignmentId) {
      setAssignments((current) =>
        current.map((item) =>
          item.id === editingAssignmentId
            ? { ...item, title: safeTitle, className: safeClass, due: safeDue }
            : item,
        ),
      );
    } else {
      setAssignments((current) => [
        { id: `as-${Date.now()}`, title: safeTitle, className: safeClass, due: safeDue },
        ...current,
      ]);
    }
    setAssignmentTitle('');
    setAssignmentClass('');
    setAssignmentDue('');
    setEditingAssignmentId(null);
    setAssignmentResourceName('');
    setShowAssignmentForm(false);
    setFeedback(
      editingAssignmentId
        ? 'Assignment updated successfully.'
        : assignmentResourceName
        ? `Assignment created successfully with resource: ${assignmentResourceName}.`
        : 'Assignment created successfully.',
    );
  };

  const createQuiz = () => {
    const safeTitle = quizTitle.trim();
    const safeClass = quizClass.trim();
    const safeItems = Number(quizItems);

    if (!safeTitle || !safeClass || !Number.isFinite(safeItems) || safeItems <= 0) {
      setFeedback('Please fill quiz title, class, and a valid number of questions.');
      return;
    }

    if (editingQuizId) {
      setQuizzes((current) =>
        current.map((item) =>
          item.id === editingQuizId ? { ...item, title: safeTitle, className: safeClass, items: safeItems } : item,
        ),
      );
    } else {
      setQuizzes((current) => [
        { id: `q-${Date.now()}`, title: safeTitle, className: safeClass, items: safeItems },
        ...current,
      ]);
    }
    setQuizTitle('');
    setQuizClass('');
    setQuizItems('');
    setEditingQuizId(null);
    setShowQuizForm(false);
    setFeedback(editingQuizId ? 'Quiz/Test updated successfully.' : 'Quiz/Test created successfully.');
  };

  const selectTool = (tool: string) => {
    setActiveTool(tool);
    setFeedback(`${tool} workspace selected.`);
  };

  const startEditAssignment = (item: Assignment) => {
    setAssignmentTitle(item.title);
    setAssignmentClass(item.className);
    setAssignmentDue(item.due);
    setEditingAssignmentId(item.id);
    setShowAssignmentForm(true);
    setActiveTool('assignment');
    setFeedback(`Editing assignment: ${item.title}`);
  };

  const deleteAssignment = (assignmentId: string) => {
    setAssignments((current) => current.filter((item) => item.id !== assignmentId));
    setSelectedByAssignment((current) => {
      const copy = { ...current };
      delete copy[assignmentId];
      return copy;
    });
    setUploadedByAssignment((current) => {
      const copy = { ...current };
      delete copy[assignmentId];
      return copy;
    });
    if (editingAssignmentId === assignmentId) {
      setEditingAssignmentId(null);
      setShowAssignmentForm(false);
      setAssignmentTitle('');
      setAssignmentClass('');
      setAssignmentDue('');
    }
    setFeedback('Assignment deleted.');
  };

  const startEditQuiz = (item: Quiz) => {
    setQuizTitle(item.title);
    setQuizClass(item.className);
    setQuizItems(String(item.items));
    setEditingQuizId(item.id);
    setShowQuizForm(true);
    setActiveTool('quiz');
    setFeedback(`Editing quiz: ${item.title}`);
  };

  const deleteQuiz = (quizId: string) => {
    setQuizzes((current) => current.filter((item) => item.id !== quizId));
    if (editingQuizId === quizId) {
      setEditingQuizId(null);
      setShowQuizForm(false);
      setQuizTitle('');
      setQuizClass('');
      setQuizItems('');
    }
    setFeedback('Quiz/Test deleted.');
  };

  const builderStats = useMemo(
    () => ({
      assignments: String(assignments.length),
      quizzes: String(quizzes.length),
      resources: String(Math.max(6, assignments.length + 2)),
      gamification: 'Active',
    }),
    [assignments.length, quizzes.length],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-edvoura-navy">Assignments, Quizzes and Resources</h1>
        <p className="mt-2 text-sm text-slate-600">
          Create assignment tasks, build quizzes/tests, upload lesson resources, and run class challenges.
        </p>
      </section>

      {feedback ? (
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">{feedback}</section>
      ) : null}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <ToolCard title="Assignment Creation" subtitle="Create and publish assignment" icon={NotebookPen} active={activeTool === 'assignment'} onClick={() => selectTool('assignment')} />
        <ToolCard title="Quiz/Test Creation" subtitle="Build quiz and set timing" icon={Target} active={activeTool === 'quiz'} onClick={() => selectTool('quiz')} />
        <ToolCard title="Upload Lesson Resources" subtitle="Notes, slides, links, worksheets" icon={FileUp} active={activeTool === 'resources'} onClick={() => selectTool('resources')} />
        <ToolCard title="Spelling Bee Setup" subtitle="Set rounds and monitor participants" icon={Star} active={activeTool === 'spelling-bee'} onClick={() => selectTool('spelling-bee')} />
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <Stat title="Active Assignments" value={builderStats.assignments} />
        <Stat title="Active Quizzes" value={builderStats.quizzes} />
        <Stat title="Resource Packs" value={builderStats.resources} />
        <Stat title="Gamification" value={builderStats.gamification} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Assignments</CardTitle>
              <Button variant="primary" className="text-xs" onClick={() => setShowAssignmentForm((v) => !v)}>
                {showAssignmentForm ? 'Close Form' : 'New Assignment'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {showAssignmentForm ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {editingAssignmentId ? 'Edit Assignment' : 'Create Assignment'}
                  </h3>
                  <div className="mt-3 space-y-3">
                    <input
                      value={assignmentTitle}
                      onChange={(event) => setAssignmentTitle(event.target.value)}
                      placeholder="Assignment title"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />
                    <input
                      value={assignmentClass}
                      onChange={(event) => setAssignmentClass(event.target.value)}
                      placeholder="Class name"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />
                    <input
                      value={assignmentDue}
                      onChange={(event) => setAssignmentDue(event.target.value)}
                      placeholder="Due label (e.g., Due in 3 days)"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />
                    <div className="rounded-md border border-slate-300 bg-white p-3">
                      <p className="text-xs font-medium text-slate-600">Attach assignment resource (optional)</p>
                      <input
                        type="file"
                        onChange={(event) => setAssignmentResourceName(event.target.files?.[0]?.name ?? '')}
                        className="mt-2 block w-full text-xs text-slate-700 file:mr-2 file:rounded file:border file:border-slate-300 file:bg-slate-50 file:px-2 file:py-1"
                      />
                      {assignmentResourceName ? (
                        <p className="mt-2 text-xs text-slate-600">Selected: {assignmentResourceName}</p>
                      ) : null}
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          className="border-slate-300 bg-white text-xs"
                          onClick={() => {
                            if (!assignmentResourceName) {
                              setFeedback('Select a file before uploading.');
                              return;
                            }
                            setFeedback(`Resource "${assignmentResourceName}" uploaded.`);
                          }}
                        >
                          Upload Selected Resource
                        </Button>
                        {assignmentResourceName ? (
                          <Button
                            variant="outline"
                            className="ml-2 border-slate-300 bg-white text-xs"
                            onClick={() => {
                              setAssignmentResourceName('');
                              setFeedback('Selected resource removed.');
                            }}
                          >
                            Remove Selected
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    <Button variant="primary" className="text-xs" onClick={createAssignment}>
                      {editingAssignmentId ? 'Update Assignment' : 'Save Assignment'}
                    </Button>
                  </div>
                </div>
              ) : null}

              {assignments.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <div className="flex gap-1">
                      <Button variant="outline" className="h-7 border-slate-300 bg-white px-2 text-xs" onClick={() => startEditAssignment(item)}>
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button variant="outline" className="h-7 border-rose-300 bg-white px-2 text-xs text-rose-700" onClick={() => deleteAssignment(item.id)}>
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">{item.className}</p>
                  <p className="mt-1 text-xs text-slate-600">{item.due}</p>
                  <div className="mt-3 rounded-md border border-slate-300 bg-white p-3">
                    <p className="text-xs font-medium text-slate-700">Upload assignment file/resource</p>
                    <input
                      type="file"
                      onChange={(event) => {
                        const fileName = event.target.files?.[0]?.name ?? '';
                        if (!fileName) return;
                        setSelectedByAssignment((current) => ({ ...current, [item.id]: fileName }));
                      }}
                      className="mt-2 block w-full text-xs text-slate-700 file:mr-2 file:rounded file:border file:border-slate-300 file:bg-slate-50 file:px-2 file:py-1"
                    />
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        className="border-slate-300 bg-white text-xs"
                        onClick={() => {
                          const selected = selectedByAssignment[item.id];
                          if (!selected) {
                            setFeedback(`Select a file for ${item.title} before uploading.`);
                            return;
                          }
                          setUploadedByAssignment((current) => ({ ...current, [item.id]: selected }));
                          setFeedback(`Uploaded "${selected}" for ${item.title}.`);
                        }}
                      >
                        Upload Resource
                      </Button>
                    </div>
                    {uploadedByAssignment[item.id] ? (
                      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-600">
                        <p>Current upload: {uploadedByAssignment[item.id]}</p>
                        <Button
                          variant="outline"
                          className="h-7 border-rose-300 bg-white px-2 text-xs text-rose-700"
                          onClick={() => {
                            setUploadedByAssignment((current) => {
                              const copy = { ...current };
                              delete copy[item.id];
                              return copy;
                            });
                            setFeedback(`Upload removed for ${item.title}.`);
                          }}
                        >
                          Delete Upload
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Quiz/Test Builder</CardTitle>
              <Button variant="outline" className="border-slate-300 bg-white text-xs" onClick={() => setShowQuizForm((v) => !v)}>
                {showQuizForm ? 'Close Form' : 'Create Quiz/Test'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {showQuizForm ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {editingQuizId ? 'Edit Quiz/Test' : 'Create Quiz/Test'}
                  </h3>
                  <div className="mt-3 space-y-3">
                    <input
                      value={quizTitle}
                      onChange={(event) => setQuizTitle(event.target.value)}
                      placeholder="Quiz/Test title"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />
                    <input
                      value={quizClass}
                      onChange={(event) => setQuizClass(event.target.value)}
                      placeholder="Class name"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />
                    <input
                      value={quizItems}
                      onChange={(event) => setQuizItems(event.target.value)}
                      placeholder="Number of questions"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />
                    <Button variant="primary" className="text-xs" onClick={createQuiz}>
                      {editingQuizId ? 'Update Quiz/Test' : 'Save Quiz/Test'}
                    </Button>
                  </div>
                </div>
              ) : null}

              {quizzes.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <div className="flex gap-1">
                      <Button variant="outline" className="h-7 border-slate-300 bg-white px-2 text-xs" onClick={() => startEditQuiz(item)}>
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button variant="outline" className="h-7 border-rose-300 bg-white px-2 text-xs text-rose-700" onClick={() => deleteQuiz(item.id)}>
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">{item.className}</p>
                  <p className="mt-1 text-xs text-slate-600">{item.items} questions</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Gamification Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                type="button"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setFeedback('Challenge task assignment panel opened.')}
              >
                Assign Challenge Tasks
              </button>
              <button
                type="button"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setFeedback('Badges and rewards trigger panel opened.')}
              >
                Trigger Badges/Rewards
              </button>
              <Link href="/dash/tutor/roster" className="block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                View Streak Performance
              </Link>
              <Link href="/dash/tutor/roster" className="block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                View Class Leaderboard
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spelling Bee Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                Active cohort: Grade 4 Bee Squad
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                Next round: Friday 16:00
              </div>
              <Button
                variant="outline"
                className="w-full border-slate-300 bg-white text-xs"
                onClick={() => setFeedback('Spelling bee participation monitor opened.')}
              >
                Monitor Participation
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function ToolCard({
  title,
  subtitle,
  icon: Icon,
  active,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left shadow-sm transition-colors ${
        active ? 'border-edvoura-navy bg-blue-50' : 'border-slate-200 bg-white hover:border-edvoura-navy hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <Icon className="h-5 w-5 text-slate-600" />
      </div>
      <p className="mt-1 text-xs text-slate-600">{subtitle}</p>
    </button>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}
