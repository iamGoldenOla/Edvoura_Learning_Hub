'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';

type SubmissionRow = {
  id: string;
  assignment_id: string;
  student_user_id: string;
  status: string;
  submitted_at: string | null;
  text_response: string | null;
  metadata: Record<string, unknown> | null;
  assignments?:
    | {
        title: string;
        class_id: string;
      }
    | Array<{
        title: string;
        class_id: string;
      }>
    | null;
};

type GradeRow = {
  submission_id: string;
  score: number | null;
  feedback_text: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
};

type QueueItem = {
  id: string;
  studentName: string;
  assignmentTitle: string;
  submittedAt: string;
  status: string;
  textResponse: string | null;
  fileName: string | null;
  score: string;
  feedback: string;
};

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Not submitted yet';

const getRelatedAssignment = (entry: SubmissionRow) => {
  if (!entry.assignments) {
    return null;
  }

  return Array.isArray(entry.assignments) ? entry.assignments[0] ?? null : entry.assignments;
};

export default function TutorGradingPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadQueue = async () => {
    const supabase = createClient();
    setIsLoading(true);

    const membership = await supabase.rpc('sync_current_user_membership');
    if (membership.error && !/function .*sync_current_user_membership/i.test(membership.error.message)) {
      setMessage(membership.error.message);
      setIsLoading(false);
      return;
    }

    const { data: submissionRows, error: submissionsError } = await supabase
      .from('assignment_submissions')
      .select('id, assignment_id, student_user_id, status, submitted_at, text_response, metadata, assignments!inner(title, class_id)')
      .in('status', ['submitted', 'late', 'graded'])
      .order('updated_at', { ascending: false });

    if (submissionsError) {
      setMessage(submissionsError.message);
      setIsLoading(false);
      return;
    }

    const normalizedSubmissions = ((submissionRows ?? []) as unknown as SubmissionRow[]) ?? [];
    const studentIds = [...new Set(normalizedSubmissions.map((item) => item.student_user_id))];
    const submissionIds = normalizedSubmissions.map((item) => item.id);

    const [{ data: studentRows }, { data: gradeRows }] = await Promise.all([
      studentIds.length
        ? supabase.from('profiles').select('id, full_name, email').in('id', studentIds)
        : Promise.resolve({ data: [] as ProfileRow[] }),
      submissionIds.length
        ? supabase.from('submission_grades').select('submission_id, score, feedback_text').in('submission_id', submissionIds)
        : Promise.resolve({ data: [] as GradeRow[] }),
    ]);

    const studentById = new Map(((studentRows ?? []) as ProfileRow[]).map((item) => [item.id, item]));
    const gradeBySubmissionId = new Map(((gradeRows ?? []) as GradeRow[]).map((item) => [item.submission_id, item]));

    setQueue(
      normalizedSubmissions.map((item) => {
        const student = studentById.get(item.student_user_id);
        const grade = gradeBySubmissionId.get(item.id);
        const assignment = getRelatedAssignment(item);
        const fileName =
          item.metadata && typeof item.metadata.draftFileName === 'string' ? item.metadata.draftFileName : null;

        return {
          id: item.id,
          studentName: student?.full_name ?? student?.email ?? 'Unknown student',
          assignmentTitle: assignment?.title ?? 'Untitled assignment',
          submittedAt: formatDate(item.submitted_at),
          status: item.status,
          textResponse: item.text_response,
          fileName,
          score: grade?.score != null ? String(grade.score) : '',
          feedback: grade?.feedback_text ?? '',
        };
      }),
    );

    setIsLoading(false);
  };

  useEffect(() => {
    void loadQueue();
  }, []);

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1400px] space-y-6 sm:space-y-8 pb-20">
      <section className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        
        {/* Header */}
        <div className="p-5 sm:p-8 md:p-12 border-b-[3px] sm:border-b-[4px] border-dark bg-yellow/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8 min-w-0">
            <div className="space-y-3 min-w-0 w-full">
              <span className="inline-flex items-center justify-center text-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border-[2px] sm:border-[3px] border-dark bg-white text-[9px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] font-black shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] break-words max-w-full">
                ASSESSMENT CENTER
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark break-words">
                Grading Tasks
              </h1>
              <p className="text-sm md:text-base font-semibold normal-case text-dark/70 max-w-xl break-words">
                Live submission queue fed directly from student assignment activity. Review and grade work in real-time.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <Link href="/dash/tutor/builder?tool=assignment" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-yellow border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-4 sm:px-6 py-3 h-auto text-xs sm:text-sm">
                  Create Assignment
                </Button>
              </Link>
              <Link href="/dash/tutor/roster" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-4 sm:px-6 py-3 h-auto text-xs sm:text-sm">
                  Student Roster
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 md:p-12 space-y-6 sm:space-y-8 min-w-0">
          {message ? (
            <div className="rounded-[20px] sm:rounded-2xl border-[3px] border-dark bg-blue-100 p-4 sm:p-5 text-sm font-black text-dark shadow-[4px_4px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] break-words">
              {message}
            </div>
          ) : null}

          <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] overflow-hidden min-w-0">
            <div className="p-5 sm:p-6 border-b-[3px] border-dark bg-off-white min-w-0">
              <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight break-words">Needs Grading ({queue.filter((item) => item.status !== 'graded').length})</h2>
            </div>
            
            <div className="p-5 sm:p-6 space-y-6 min-w-0">
              {isLoading ? (
                <div className="rounded-[20px] sm:rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-6 sm:p-8 text-center text-xs sm:text-sm font-semibold text-dark/60">
                  Loading submissions...
                </div>
              ) : queue.length > 0 ? (
                <div className="grid gap-4 sm:gap-6 min-w-0">
                  {queue.map((item) => (
                    <div key={item.id} className="rounded-[20px] sm:rounded-2xl border-[3px] border-dark bg-off-white p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] transition-all hover:shadow-[5px_5px_0px_#060E1C] sm:hover:shadow-[7px_7px_0px_#060E1C] min-w-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 min-w-0">
                        <div className="min-w-0 w-full sm:w-auto">
                          <p className="text-lg sm:text-xl font-black text-dark tracking-tight leading-tight break-words">{item.assignmentTitle}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-2 min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-dark/70 break-words">{item.studentName}</span>
                            <span className="hidden sm:inline text-dark/30 font-bold">•</span>
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-dark/50 break-words">{item.submittedAt}</span>
                          </div>
                        </div>
                        <span className={`self-start sm:self-auto rounded-xl border-[2px] border-dark px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] shadow-[2px_2px_0px_#060E1C] shrink-0 ${item.status === 'graded' ? 'bg-emerald-300 text-dark' : 'bg-amber-300 text-dark'}`}>
                          {item.status}
                        </span>
                      </div>

                      {item.textResponse ? (
                        <div className="rounded-xl border-[2px] border-dark/20 bg-white p-4 text-xs sm:text-sm font-medium text-dark/80 my-4 shadow-sm break-words">
                          {item.textResponse}
                        </div>
                      ) : null}

                      {item.fileName ? (
                        <div className="rounded-xl border-[2px] border-dark/20 bg-blue-50 p-3 my-4 min-w-0">
                          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-blue-900/60 mb-1">Attached File</p>
                          <p className="text-[10px] sm:text-xs font-bold text-blue-900 break-words">{item.fileName}</p>
                        </div>
                      ) : null}

                      <div className="flex flex-col md:grid md:grid-cols-[100px_1fr_auto] lg:grid-cols-[150px_1fr_auto] gap-4 items-stretch md:items-end mt-5 sm:mt-6 pt-5 sm:pt-6 border-t-[3px] border-dark/10 min-w-0">
                        <div className="space-y-1 sm:space-y-2 min-w-0">
                          <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-dark/60 ml-1">Score</label>
                          <input
                            value={item.score}
                            onChange={(event) =>
                              setQueue((current) =>
                                current.map((entry) => (entry.id === item.id ? { ...entry, score: event.target.value } : entry)),
                              )
                            }
                            placeholder="e.g. 95"
                            className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-black text-dark outline-none focus:border-yellow"
                          />
                        </div>
                        <div className="space-y-1 sm:space-y-2 min-w-0">
                          <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-dark/60 ml-1">Feedback Notes</label>
                          <input
                            value={item.feedback}
                            onChange={(event) =>
                              setQueue((current) =>
                                current.map((entry) => (entry.id === item.id ? { ...entry, feedback: event.target.value } : entry)),
                              )
                            }
                            placeholder="Great job on..."
                            className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none focus:border-yellow"
                          />
                        </div>
                        <Button
                          className={`w-full md:w-auto border-[3px] border-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 sm:px-8 py-3 h-auto text-xs sm:text-sm ${item.status === 'graded' ? 'bg-emerald-400 text-dark' : 'bg-dark text-white shadow-[3px_3px_0px_#F5C518]'}`}
                          disabled={savingId === item.id}
                          onClick={async () => {
                            const numericScore = Number(item.score);

                            if (!Number.isFinite(numericScore)) {
                              setMessage('Enter a valid numeric score before grading.');
                              return;
                            }

                            setSavingId(item.id);
                            const supabase = createClient();
                            const { error } = await supabase.rpc('grade_student_submission', {
                              target_submission_id: item.id,
                              score: numericScore,
                              feedback_text: item.feedback.trim() || null,
                              rubric_json: {},
                            });
                            setSavingId(null);

                            if (error) {
                              setMessage(error.message);
                              return;
                            }

                            setMessage('Submission graded successfully.');
                            await loadQueue();
                          }}
                        >
                          {savingId === item.id ? 'Saving...' : item.status === 'graded' ? 'Update Grade' : 'Save Grade'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 sm:py-16 px-4 sm:px-6 rounded-[20px] sm:rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 min-w-0">
                  <div className="inline-flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl border-[3px] border-dark bg-yellow mb-4 sm:mb-6 shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C]">
                    <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-dark" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-dark mb-2 tracking-tight break-words">You're all caught up!</h3>
                  <p className="text-xs sm:text-sm font-bold text-dark/60 max-w-sm mx-auto break-words">No student submissions have arrived yet. When students submit work, it will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
