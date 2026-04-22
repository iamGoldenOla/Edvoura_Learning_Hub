'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-edvoura-navy mb-2">Grading Tasks</h1>
        <p className="text-slate-600">Live submission queue fed directly from student assignment activity.</p>
      </div>

      {message ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">{message}</div>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/dash/tutor/builder?tool=assignment">
          <Button variant="primary" className="text-xs">Create Assignment</Button>
        </Link>
        <Link href="/dash/tutor/roster">
          <Button variant="outline" className="border-slate-300 bg-white text-xs">Open Student Roster</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Needs Grading ({queue.filter((item) => item.status !== 'graded').length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Loading submissions...</div>
          ) : queue.length > 0 ? (
            queue.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.assignmentTitle}</p>
                    <p className="text-xs text-slate-600">{item.studentName}</p>
                    <p className="text-xs text-slate-500">{item.submittedAt}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-slate-600">
                    {item.status}
                  </span>
                </div>

                {item.textResponse ? (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                    {item.textResponse}
                  </div>
                ) : null}

                {item.fileName ? (
                  <p className="text-xs text-slate-600">Student attached: {item.fileName}</p>
                ) : null}

                <div className="grid gap-3 md:grid-cols-[120px_1fr_auto]">
                  <input
                    value={item.score}
                    onChange={(event) =>
                      setQueue((current) =>
                        current.map((entry) => (entry.id === item.id ? { ...entry, score: event.target.value } : entry)),
                      )
                    }
                    placeholder="Score"
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                  />
                  <input
                    value={item.feedback}
                    onChange={(event) =>
                      setQueue((current) =>
                        current.map((entry) => (entry.id === item.id ? { ...entry, feedback: event.target.value } : entry)),
                      )
                    }
                    placeholder="Feedback"
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                  />
                  <Button
                    variant="primary"
                    className="text-xs"
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
                    {savingId === item.id ? 'Saving...' : item.status === 'graded' ? 'Update Grade' : 'Grade'}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500">
              <span className="text-4xl block mb-4">✨</span>
              <p>No student submissions have arrived yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
