'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileUp, NotebookPen, Star, Target } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';

type SubjectOption = {
  id: string;
  name: string;
};

type GradeOption = {
  id: string;
  code: string;
  display_name: string;
};

type AssignmentRow = {
  id: string;
  title: string;
  due_at: string | null;
  status: string;
  classes:
    | {
        title: string;
        subject_id: string;
      }
    | Array<{
        title: string;
        subject_id: string;
      }>
    | null;
};

type AssignmentCard = {
  id: string;
  title: string;
  className: string;
  due: string;
  status: string;
  resources: Array<{
    id: string;
    fileName: string;
  }>;
};

const formatDueLabel = (value: string | null) => {
  if (!value) {
    return 'No due date';
  }

  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

const getRelatedClass = (entry: AssignmentRow) => {
  if (!entry.classes) {
    return null;
  }

  return Array.isArray(entry.classes) ? entry.classes[0] ?? null : entry.classes;
};

export default function TutorBuilderPage() {
  const searchParams = useSearchParams();
  const preselectTool = searchParams.get('tool');

  const [activeTool, setActiveTool] = useState(preselectTool ?? 'assignment');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);

  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [gradeLevels, setGradeLevels] = useState<GradeOption[]>([]);
  const [assignments, setAssignments] = useState<AssignmentCard[]>([]);

  const [showAssignmentForm, setShowAssignmentForm] = useState(true);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentSubject, setAssignmentSubject] = useState('');
  const [assignmentGradeCode, setAssignmentGradeCode] = useState('');
  const [assignmentDueAt, setAssignmentDueAt] = useState('');
  const [assignmentInstructions, setAssignmentInstructions] = useState('');
  const [assignmentResourceName, setAssignmentResourceName] = useState('');
  const [assignmentResourceFile, setAssignmentResourceFile] = useState<File | null>(null);

  const loadBuilderData = async () => {
    const supabase = createClient();
    setIsLoading(true);

    const membership = await supabase.rpc('sync_current_user_membership');
    if (membership.error && !/function .*sync_current_user_membership/i.test(membership.error.message)) {
      setFeedback(membership.error.message);
      setIsLoading(false);
      return;
    }

    const [{ data: subjectRows, error: subjectsError }, { data: gradeRows, error: gradesError }, { data: assignmentRows, error: assignmentsError }] =
      await Promise.all([
        supabase.from('subjects').select('id, name').eq('is_active', true).order('name'),
        supabase.from('grade_levels').select('id, code, display_name').order('numeric_level'),
        supabase
          .from('assignments')
          .select('id, title, due_at, status, classes!inner(title, subject_id)')
          .neq('status', 'archived')
          .order('created_at', { ascending: false }),
      ]);

    if (subjectsError || gradesError || assignmentsError) {
      setFeedback(subjectsError?.message ?? gradesError?.message ?? assignmentsError?.message ?? 'Unable to load builder data.');
      setIsLoading(false);
      return;
    }

    setSubjects(subjectRows ?? []);
    setGradeLevels(gradeRows ?? []);

    const subjectById = new Map((subjectRows ?? []).map((entry) => [entry.id, entry.name]));
    const assignmentIds = ((assignmentRows ?? []) as AssignmentRow[]).map((entry) => entry.id);
    const { data: assignmentFilesRows } = assignmentIds.length
      ? await supabase
          .from('assignment_files')
          .select('id, assignment_id, object_path')
          .in('assignment_id', assignmentIds)
      : { data: [] as Array<{ id: string; assignment_id: string; object_path: string }> };

    const filesByAssignmentId = new Map<string, Array<{ id: string; fileName: string }>>();
    (assignmentFilesRows ?? []).forEach((file) => {
      const current = filesByAssignmentId.get(file.assignment_id) ?? [];
      current.push({ id: file.id, fileName: file.object_path.split('/').pop() ?? file.object_path });
      filesByAssignmentId.set(file.assignment_id, current);
    });

    const normalizedAssignments = ((assignmentRows ?? []) as AssignmentRow[]).map((entry) => {
      const relatedClass = getRelatedClass(entry);

      return {
        id: entry.id,
        title: entry.title,
        className:
          relatedClass?.title ??
          (relatedClass?.subject_id ? subjectById.get(relatedClass.subject_id) ?? 'Untitled class' : 'Untitled class'),
        due: formatDueLabel(entry.due_at),
        status: entry.status,
        resources: filesByAssignmentId.get(entry.id) ?? [],
      };
    });

    setAssignments(normalizedAssignments);

    if (!assignmentSubject && subjectRows?.[0]?.name) {
      setAssignmentSubject(subjectRows[0].name);
    }

    if (!assignmentGradeCode && gradeRows?.[0]?.code) {
      setAssignmentGradeCode(gradeRows[0].code);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    void loadBuilderData();
  }, []);

  const builderStats = useMemo(
    () => ({
      assignments: String(assignments.length),
      quizzes: 'Pending phase',
      resources: 'Storage next',
      gamification: 'Planned',
    }),
    [assignments.length],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-edvoura-navy">Assignments, Quizzes and Resources</h1>
        <p className="mt-2 text-sm text-slate-600">
          This phase connects tutor assignment creation directly to student dashboards through Supabase.
        </p>
      </section>

      {feedback ? (
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">{feedback}</section>
      ) : null}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <ToolCard
          title="Assignment Creation"
          subtitle="Publishes directly to enrolled students"
          icon={NotebookPen}
          active={activeTool === 'assignment'}
          onClick={() => setActiveTool('assignment')}
        />
        <ToolCard
          title="Quiz/Test Creation"
          subtitle="Coming in next update"
          icon={Target}
          active={activeTool === 'quiz'}
          onClick={() => setActiveTool('quiz')}
        />
        <ToolCard
          title="Upload Lesson Resources"
          subtitle="Coming in next update"
          icon={FileUp}
          active={activeTool === 'resources'}
          onClick={() => setActiveTool('resources')}
        />
        <ToolCard
          title="Spelling Bee Setup"
          subtitle="Planned after the core classroom loop"
          icon={Star}
          active={activeTool === 'spelling-bee'}
          onClick={() => setActiveTool('spelling-bee')}
        />
      </section>

      {activeTool !== 'assignment' ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {activeTool === 'quiz' && 'Assignment uploads are now fully live! Quiz and test creation will be enabled in the next update.'}
          {activeTool === 'resources' && 'Assignment uploads are now fully live! General lesson resource libraries will be enabled in the next update.'}
          {activeTool === 'spelling-bee' && 'Spelling bee tooling remains planned after the core classroom and storage phases.'}
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <Stat title="Active Assignments" value={builderStats.assignments} />
        <Stat title="Quiz/Test" value={builderStats.quizzes} />
        <Stat title="Resource Uploads" value={builderStats.resources} />
        <Stat title="Gamification" value={builderStats.gamification} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Live Assignment Builder</CardTitle>
              <Button variant="primary" className="text-xs" onClick={() => setShowAssignmentForm((value) => !value)}>
                {showAssignmentForm ? 'Close Form' : 'New Assignment'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAssignmentForm ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Create Assignment</h3>
                  <div className="mt-3 space-y-3">
                    <input
                      value={assignmentTitle}
                      onChange={(event) => setAssignmentTitle(event.target.value)}
                      placeholder="Assignment title"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />

                    <div className="grid gap-3 md:grid-cols-2">
                      <select
                        value={assignmentSubject}
                        onChange={(event) => setAssignmentSubject(event.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                      >
                        <option value="">Select subject</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.name}>
                            {subject.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={assignmentGradeCode}
                        onChange={(event) => setAssignmentGradeCode(event.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                      >
                        <option value="">Select grade</option>
                        {gradeLevels.map((grade) => (
                          <option key={grade.id} value={grade.code}>
                            {grade.display_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <input
                      type="datetime-local"
                      value={assignmentDueAt}
                      onChange={(event) => setAssignmentDueAt(event.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />

                    <textarea
                      value={assignmentInstructions}
                      onChange={(event) => setAssignmentInstructions(event.target.value)}
                      placeholder="Instructions for students"
                      className="min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />

                    <div className="rounded-md border border-slate-300 bg-white p-3 text-xs text-slate-600">
                      <p className="font-medium text-slate-700">Attach assignment resource (optional)</p>
                      <input
                        type="file"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setAssignmentResourceFile(file);
                          setAssignmentResourceName(file?.name ?? '');
                        }}
                        className="mt-2 block w-full text-xs text-slate-700 file:mr-2 file:rounded file:border file:border-slate-300 file:bg-slate-50 file:px-2 file:py-1"
                      />
                      {assignmentResourceName ? <p className="mt-2">Selected: {assignmentResourceName}</p> : null}
                    </div>

                    <Button
                      variant="primary"
                      className="text-xs"
                      disabled={isSavingAssignment || isLoading}
                      onClick={async () => {
                        const safeTitle = assignmentTitle.trim();

                        if (!safeTitle || !assignmentSubject || !assignmentGradeCode) {
                          setFeedback('Assignment title, subject, and grade are required.');
                          return;
                        }

                        setIsSavingAssignment(true);
                        const supabase = createClient();
                        const { data, error } = await supabase.rpc('create_tutor_assignment', {
                          assignment_title: safeTitle,
                          subject_name: assignmentSubject,
                          grade_level_code: assignmentGradeCode,
                          assignment_instructions: assignmentInstructions.trim() || null,
                          due_at: assignmentDueAt ? new Date(assignmentDueAt).toISOString() : null,
                          points_possible: 100,
                        });

                        setIsSavingAssignment(false);

                        if (error) {
                          setFeedback(error.message);
                          return;
                        }

                        const created = Array.isArray(data) ? data[0] : null;

                        if (created?.assignment_id && assignmentResourceFile) {
                          const safeName = `${Date.now()}-${assignmentResourceFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
                          const objectPath = `assignments/${created.assignment_id}/${safeName}`;
                          const upload = await supabase.storage
                            .from('assignment-assets')
                            .upload(objectPath, assignmentResourceFile, {
                              cacheControl: '3600',
                              upsert: false,
                            });

                          if (upload.error) {
                            setFeedback(upload.error.message);
                            return;
                          }

                          const attach = await supabase.rpc('attach_assignment_asset', {
                            target_assignment_id: created.assignment_id,
                            object_path: objectPath,
                            bucket_id: 'assignment-assets',
                          });

                          if (attach.error) {
                            setFeedback(attach.error.message);
                            return;
                          }
                        }

                        setAssignmentTitle('');
                        setAssignmentInstructions('');
                        setAssignmentDueAt('');
                        setAssignmentResourceName('');
                        setAssignmentResourceFile(null);
                        setShowAssignmentForm(false);
                        setFeedback(
                          created
                            ? `Assignment published and shared with ${created.enrolled_students ?? 0} enrolled students.`
                            : 'Assignment published successfully.',
                        );
                        await loadBuilderData();
                      }}
                    >
                      {isSavingAssignment ? 'Publishing...' : 'Publish Assignment'}
                    </Button>
                  </div>
                </div>
              ) : null}

              {isLoading ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Loading live assignment data...
                </div>
              ) : assignments.length > 0 ? (
                assignments.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-600">{item.className}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                      <span>{item.due}</span>
                      <span className="rounded-full bg-white px-2 py-1 uppercase tracking-[0.12em]">{item.status}</span>
                    </div>
                    {item.resources.length > 0 ? (
                      <div className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                        <p className="text-xs font-semibold text-slate-700">Attached resources</p>
                        {item.resources.map((resource) => (
                          <div key={resource.id} className="text-xs text-slate-600">
                            {resource.fileName}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                  No live assignments yet. Publish one above and it will appear here, in the grading queue, and on matching student dashboards.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>What This Phase Connects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>
                Tutor assignment publish {'->'} class creation {'->'} student enrollment {'->'} student assignment
                feed {'->'} tutor grading queue.
              </p>
              <p>
                Quizzes, lesson resource uploads, bucket-backed student work, and Google Meet links remain in the next
                phase.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Pages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dash/tutor/roster" className="block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                View enrolled students
              </Link>
              <Link href="/dash/tutor/grading" className="block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Open grading queue
              </Link>
              <Link href="/dash/student/assignments" className="block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Check student assignments page
              </Link>
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
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {active ? 'Selected' : 'Open'}
      </p>
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
