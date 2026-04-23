'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileUp, NotebookPen, Star, Target } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { createQuizOrResource, deleteAssignment } from './actions';
import { Trash2, Edit3 } from 'lucide-react';

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
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formGradeCode, setFormGradeCode] = useState('');
  const [formDueAt, setFormDueAt] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [formResourceName, setFormResourceName] = useState('');
  const [formResourceFile, setFormResourceFile] = useState<File | null>(null);
  
  const [userId, setUserId] = useState('');

  const loadBuilderData = async () => {
    const supabase = createClient();
    setIsLoading(true);

    const membership = await supabase.rpc('sync_current_user_membership');
    if (membership.error && !/function .*sync_current_user_membership/i.test(membership.error.message)) {
      setFeedback(membership.error.message);
      setIsLoading(false);
      return;
    }
    
    if (membership.data?.user_id) {
      setUserId(membership.data.user_id);
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

    if (!formSubject && subjectRows?.[0]?.name) {
      setFormSubject(subjectRows[0].name);
    }

    if (!formGradeCode && gradeRows?.[0]?.code) {
      setFormGradeCode(gradeRows[0].code);
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
          subtitle="Share general files with class"
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

      {/* Forms for the different tools */}

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
              <CardTitle>
                {activeTool === 'assignment' && 'Live Assignment Builder'}
                {activeTool === 'quiz' && 'Quiz & Test Builder'}
                {activeTool === 'resources' && 'Lesson Resource Library'}
                {activeTool === 'spelling-bee' && 'Spelling Bee Challenge Setup'}
              </CardTitle>
              <Button variant="primary" className="text-xs" onClick={() => setShowAssignmentForm((value) => !value)}>
                {showAssignmentForm ? 'Close Form' : `New ${activeTool === 'assignment' ? 'Assignment' : activeTool === 'quiz' ? 'Quiz' : activeTool === 'resources' ? 'Resource' : 'Challenge'}`}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAssignmentForm ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Create {activeTool === 'assignment' ? 'Assignment' : activeTool === 'quiz' ? 'Quiz' : activeTool === 'resources' ? 'Resource' : 'Spelling Bee Challenge'}
                  </h3>
                  <div className="mt-3 space-y-3">
                    <input
                      value={formTitle}
                      onChange={(event) => setFormTitle(event.target.value)}
                      placeholder={activeTool === 'quiz' ? "Quiz title" : activeTool === 'resources' ? "Resource bundle name" : "Assignment title"}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />

                    <div className="grid gap-3 md:grid-cols-2">
                      <select
                        value={formSubject}
                        onChange={(event) => setFormSubject(event.target.value)}
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
                        value={formGradeCode}
                        onChange={(event) => setFormGradeCode(event.target.value)}
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

                    {activeTool === 'assignment' && (
                      <input
                        type="datetime-local"
                        value={formDueAt}
                        onChange={(event) => setFormDueAt(event.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                      />
                    )}

                    {activeTool === 'quiz' && (
                      <input
                        type="number"
                        placeholder="Time limit (minutes, optional)"
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                        onChange={(e) => setFormDueAt(e.target.value)} // Reusing formDueAt for time limit
                      />
                    )}

                    <textarea
                      value={formInstructions}
                      onChange={(event) => setFormInstructions(event.target.value)}
                      placeholder={activeTool === 'resources' ? "Resource description" : "Instructions for students"}
                      className="min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />

                    <div className="rounded-md border border-slate-300 bg-white p-3 text-xs text-slate-600">
                      <p className="font-medium text-slate-700">Attach {activeTool === 'assignment' ? 'assignment' : 'lesson'} resource (optional)</p>
                      <input
                        type="file"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setFormResourceFile(file);
                          setFormResourceName(file?.name ?? '');
                        }}
                        className="mt-2 block w-full text-xs text-slate-700 file:mr-2 file:rounded file:border file:border-slate-300 file:bg-slate-50 file:px-2 file:py-1"
                      />
                      {formResourceName ? <p className="mt-2">Selected: {formResourceName}</p> : null}
                    </div>

                    <Button
                      variant="primary"
                      className="text-xs"
                      disabled={isSavingAssignment || isLoading}
                      onClick={async () => {
                        const safeTitle = formTitle.trim();

                        if (!safeTitle || !formSubject || !formGradeCode) {
                          setFeedback('Title, subject, and grade are required.');
                          return;
                        }

                        setIsSavingAssignment(true);
                        
                        try {
                          if (activeTool !== 'assignment') {
                            const formData = new FormData();
                            formData.append('type', activeTool);
                            formData.append('title', safeTitle);
                            formData.append('subjectName', formSubject);
                            formData.append('gradeCode', formGradeCode);
                            formData.append('tutorId', userId);
                            if (activeTool === 'quiz') {
                              formData.append('timeLimit', formDueAt); // Reused field
                              formData.append('instructions', formInstructions.trim());
                            } else {
                              formData.append('description', formInstructions.trim());
                            }
                            
                            const result = await createQuizOrResource(formData);
                            
                            if (result.success && result.id && formResourceFile) {
                              setFeedback("Publishing record... now uploading file...");
                              const supabase = createClient();
                              const safeName = `${Date.now()}-${formResourceFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
                              const objectPath = `assignments/${result.id}/${safeName}`;
                              
                              const upload = await supabase.storage
                                .from('assignment-assets')
                                .upload(objectPath, formResourceFile);

                              if (upload.error) {
                                console.error("Upload error:", upload.error);
                                setFeedback(`Record created, but file upload failed: ${upload.error.message}`);
                              } else {
                                const attach = await supabase.rpc('attach_assignment_asset', {
                                  target_assignment_id: result.id,
                                  object_path: objectPath,
                                  bucket_id: 'assignment-assets',
                                });

                                if (attach.error) {
                                  console.error("Attach error:", attach.error);
                                  setFeedback(`File uploaded, but failed to link to assignment: ${attach.error.message}`);
                                } else {
                                  setFeedback("Everything published and attached successfully!");
                                }
                              }
                            }

                            setFormTitle('');
                            setFormInstructions('');
                            setFormDueAt('');
                            setFormResourceName('');
                            setFormResourceFile(null);
                            setShowAssignmentForm(false);
                            if (!feedback.includes('failed')) {
                              setFeedback(`${activeTool} published successfully.`);
                            }
                            await loadBuilderData();
                          } else {
                            // Legacy assignment logic
                            const supabase = createClient();
                            const { data, error } = await supabase.rpc('create_tutor_assignment', {
                              assignment_title: safeTitle,
                              subject_name: formSubject,
                              grade_level_code: formGradeCode,
                              assignment_instructions: formInstructions.trim() || null,
                              due_at: formDueAt ? new Date(formDueAt).toISOString() : null,
                              points_possible: 100,
                            });

                            if (error) {
                              setFeedback(error.message);
                              setIsSavingAssignment(false);
                              return;
                            }

                            const created = Array.isArray(data) ? data[0] : null;

                            if (created?.assignment_id && formResourceFile) {
                              const safeName = `${Date.now()}-${formResourceFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
                              const objectPath = `assignments/${created.assignment_id}/${safeName}`;
                              const upload = await supabase.storage
                                .from('assignment-assets')
                                .upload(objectPath, formResourceFile, {
                                  cacheControl: '3600',
                                  upsert: false,
                                });

                              if (upload.error) {
                                setFeedback(upload.error.message);
                                setIsSavingAssignment(false);
                                return;
                              }

                              const attach = await supabase.rpc('attach_assignment_asset', {
                                target_assignment_id: created.assignment_id,
                                object_path: objectPath,
                                bucket_id: 'assignment-assets',
                              });

                              if (attach.error) {
                                setFeedback(attach.error.message);
                                setIsSavingAssignment(false);
                                return;
                              }
                            }

                            setFormTitle('');
                            setFormInstructions('');
                            setFormDueAt('');
                            setFormResourceName('');
                            setFormResourceFile(null);
                            setShowAssignmentForm(false);
                            setFeedback(
                              created
                                ? `Assignment published and shared with ${created.enrolled_students ?? 0} enrolled students.`
                                : 'Assignment published successfully.',
                            );
                            await loadBuilderData();
                          }
                        } catch (err: any) {
                          setFeedback(err.message || 'An error occurred during publishing.');
                        } finally {
                          setIsSavingAssignment(false);
                        }
                      }}
                    >
                      {isSavingAssignment ? 'Publishing...' : `Publish ${activeTool === 'assignment' ? 'Assignment' : activeTool === 'quiz' ? 'Quiz' : activeTool === 'resources' ? 'Resource' : 'Challenge'}`}
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
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setFormTitle(item.title);
                            // We don't have all details here, but we can fill what we have
                            setShowAssignmentForm(true);
                            setFeedback(`Editing "${item.title}". Update the fields and publish again.`);
                          }}
                        >
                          <Edit3 className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0 hover:bg-red-50"
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this assignment?')) {
                              try {
                                await deleteAssignment(item.id);
                                setFeedback('Assignment deleted.');
                                await loadBuilderData();
                              } catch (err: any) {
                                setFeedback(err.message);
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
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
