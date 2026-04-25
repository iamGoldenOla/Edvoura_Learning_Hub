/**
 * POST /api/ai/analyze-student
 *
 * Generates a richer academic learning profile using real progress snapshots,
 * graded assignment history, and AI practice scores.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { analyzeStudentPerformance } from '@/lib/ai';

type EnrollmentRow = {
  class_id: string;
  classes:
    | {
        subject_id?: string | null;
        subjects?: { name?: string | null } | null;
      }
    | Array<{
        subject_id?: string | null;
        subjects?: { name?: string | null } | null;
      }>
    | null;
};

type SubmissionRow = {
  id: string;
  assignment_id: string;
  status: string;
  assignments:
    | {
        title?: string | null;
        class_id?: string | null;
      }
    | Array<{
        title?: string | null;
        class_id?: string | null;
      }>
    | null;
};

type GradeRow = {
  submission_id: string;
  score: number | null;
  feedback_text: string | null;
};

type PracticeScoreRow = {
  subject_name: string;
  topic: string;
  score: number;
  total_questions: number;
};

type TopicSignal = {
  subject: string;
  topic: string;
  score: number;
  source: 'assignment' | 'ai_practice';
  feedback?: string | null;
};

const getSingleRelation = <T,>(value: T | T[] | null | undefined) =>
  Array.isArray(value) ? (value[0] ?? null) : value ?? null;

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.studentUserId) {
    return NextResponse.json({ error: 'Missing required field: studentUserId' }, { status: 400 });
  }

  const studentUserId = body.studentUserId as string;

  const { data: studentProfile } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', studentUserId)
    .single();

  if (!studentProfile) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  const { data: learnerProfile } = await supabase
    .from('student_profiles')
    .select('grade_level_id, grade_levels(name)')
    .eq('user_id', studentUserId)
    .single();

  const gradeLevel = (learnerProfile?.grade_levels as { name?: string } | null)?.name ?? 'Unknown';

  const [snapshotsResult, enrollmentsResult, submissionsResult, practiceScoresResult] = await Promise.all([
    supabase
      .from('progress_snapshots')
      .select('average_score, attendance_rate, assignment_completion_rate, snapshot_date')
      .eq('student_user_id', studentUserId)
      .order('snapshot_date', { ascending: false })
      .limit(10),
    supabase
      .from('class_enrollments')
      .select('class_id, classes(subject_id, subjects(name))')
      .eq('student_user_id', studentUserId)
      .eq('status', 'active'),
    supabase
      .from('assignment_submissions')
      .select('id, assignment_id, status, assignments!inner(title, class_id)')
      .eq('student_user_id', studentUserId)
      .in('status', ['submitted', 'late', 'graded'])
      .order('updated_at', { ascending: false })
      .limit(30),
    supabase
      .from('student_ai_practice_scores')
      .select('subject_name, topic, score, total_questions')
      .eq('student_id', studentUserId)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const snapshots = snapshotsResult.data ?? [];
  const enrollments = ((enrollmentsResult.data ?? []) as unknown as EnrollmentRow[]) ?? [];
  const submissions = ((submissionsResult.data ?? []) as unknown as SubmissionRow[]) ?? [];
  const practiceScores = ((practiceScoresResult.data ?? []) as PracticeScoreRow[]) ?? [];

  const subjectMap = new Map<string, { scores: number[]; attendance: number[]; assignmentsCompleted: number }>();
  const classSubjectMap = new Map<string, string>();

  for (const enrollment of enrollments) {
    const classInfo = getSingleRelation(enrollment.classes);
    const subjectName = classInfo?.subjects?.name ?? 'Unknown';

    classSubjectMap.set(enrollment.class_id, subjectName);

    if (!subjectMap.has(subjectName)) {
      subjectMap.set(subjectName, { scores: [], attendance: [], assignmentsCompleted: 0 });
    }
  }

  const { data: gradeRows } = submissions.length
    ? await supabase
        .from('submission_grades')
        .select('submission_id, score, feedback_text')
        .in('submission_id', submissions.map((entry) => entry.id))
    : { data: [] as GradeRow[] };

  const gradeBySubmissionId = new Map((gradeRows ?? []).map((entry) => [entry.submission_id, entry]));
  const topicSignals: TopicSignal[] = [];

  for (const submission of submissions) {
    const assignment = getSingleRelation(submission.assignments);
    const subjectName = assignment?.class_id ? classSubjectMap.get(assignment.class_id) ?? 'Unknown' : 'Unknown';
    const aggregate = subjectMap.get(subjectName) ?? { scores: [], attendance: [], assignmentsCompleted: 0 };
    const grade = gradeBySubmissionId.get(submission.id);

    if (submission.status !== 'draft') {
      aggregate.assignmentsCompleted += 1;
    }

    if (grade?.score != null) {
      aggregate.scores.push(Number(grade.score));
      topicSignals.push({
        subject: subjectName,
        topic: assignment?.title?.trim() || 'Untitled assignment',
        score: Number(grade.score),
        source: 'assignment',
        feedback: grade.feedback_text,
      });
    }

    subjectMap.set(subjectName, aggregate);
  }

  const averageAttendance =
    snapshots.length > 0
      ? Math.round(
          snapshots.reduce((sum, snapshot) => sum + Number(snapshot.attendance_rate ?? 0), 0) / snapshots.length,
        )
      : 0;

  for (const [, aggregate] of subjectMap) {
    if (averageAttendance > 0) {
      aggregate.attendance.push(averageAttendance);
    }
  }

  for (const practiceScore of practiceScores) {
    const percent =
      practiceScore.total_questions > 0
        ? Math.round((Number(practiceScore.score) / Number(practiceScore.total_questions)) * 100)
        : 0;

    const aggregate =
      subjectMap.get(practiceScore.subject_name) ?? { scores: [], attendance: [], assignmentsCompleted: 0 };
    aggregate.scores.push(percent);
    subjectMap.set(practiceScore.subject_name, aggregate);

    topicSignals.push({
      subject: practiceScore.subject_name,
      topic: practiceScore.topic,
      score: percent,
      source: 'ai_practice',
    });
  }

  const performanceData = [...subjectMap.entries()].map(([subject, data]) => ({
    subject,
    averageScore: data.scores.length
      ? Math.round(data.scores.reduce((sum, value) => sum + value, 0) / data.scores.length)
      : 0,
    assignmentsCompleted: data.assignmentsCompleted,
    attendanceRate: data.attendance.length
      ? Math.round(data.attendance.reduce((sum, value) => sum + value, 0) / data.attendance.length)
      : averageAttendance,
  }));

  if (performanceData.length === 0) {
    return NextResponse.json(
      { error: 'Insufficient performance data to analyze this student' },
      { status: 400 },
    );
  }

  const topicPerformance = topicSignals
    .sort((left, right) => left.score - right.score)
    .slice(0, 8);

  const result = await analyzeStudentPerformance({
    studentName: studentProfile.full_name ?? studentProfile.email,
    studentId: studentUserId,
    gradeLevel,
    performanceData,
    topicPerformance,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: 'Analysis generation failed', detail: result.error },
      { status: 422 },
    );
  }

  const analysis = result.data;
  const weakSubjectNames = analysis.weakAreas.map((entry: { subject: string }) => entry.subject);
  const strongSubjectNames = analysis.strongAreas.map((entry: { subject: string }) => entry.subject);

  const { data: allSubjects } = await supabase.from('subjects').select('id, name');
  const nameToId = new Map((allSubjects ?? []).map((subject) => [subject.name.toLowerCase(), subject.id]));

  const weakSubjectIds = weakSubjectNames
    .map((name: string) => nameToId.get(name.toLowerCase()))
    .filter((value: string | undefined): value is string => Boolean(value));
  const strongSubjectIds = strongSubjectNames
    .map((name: string) => nameToId.get(name.toLowerCase()))
    .filter((value: string | undefined): value is string => Boolean(value));

  await supabase.from('student_learning_profiles').upsert(
    {
      student_user_id: studentUserId,
      learning_pace: analysis.learningPace,
      strong_subjects: strongSubjectIds,
      weak_subjects: weakSubjectIds,
      recommended_interventions: {
        recommendations: analysis.recommendations,
        tutorActions: analysis.tutorActions,
        weakTopics: analysis.weakTopics,
        studentPlan: analysis.studentPlan,
      },
      latest_analysis: analysis,
      focus_topics: analysis.revisionPlan.focusTopics,
      parent_summary: analysis.parentSummary,
      last_analyzed_at: new Date().toISOString(),
    },
    { onConflict: 'student_user_id' },
  );

  await supabase.from('ai_action_logs').insert({
    trigger_type: 'intervention_alert',
    target_user_id: studentUserId,
    action_payload: {
      analysis,
      performanceDataUsed: performanceData,
      topicPerformanceUsed: topicPerformance,
    },
  });

  return NextResponse.json({
    message: 'Student analysis complete',
    analysis,
    attempts: result.attempts,
    provider: result.provider,
  });
}
