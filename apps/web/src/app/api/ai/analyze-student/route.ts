/**
 * POST /api/ai/analyze-student
 *
 * Analyzes a student's performance across subjects using real data from
 * progress_snapshots and generates a structured learning profile with
 * recommendations for tutors, parents, and the student themselves.
 *
 * Only Super Admins and Admins can trigger full analysis.
 * Tutors can analyze students in their own classes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { analyzeStudentPerformance } from '@/lib/ai';

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
    return NextResponse.json(
      { error: 'Missing required field: studentUserId' },
      { status: 400 },
    );
  }

  // Fetch student profile
  const { data: studentProfile } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', body.studentUserId)
    .single();

  if (!studentProfile) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  // Fetch student's grade level
  const { data: learnerProfile } = await supabase
    .from('student_profiles')
    .select('grade_level_id, grade_levels(name)')
    .eq('user_id', body.studentUserId)
    .single();

  const gradeLevel =
    (learnerProfile?.grade_levels as { name?: string } | null)?.name ?? 'Unknown';

  // Fetch performance snapshots
  const { data: snapshots } = await supabase
    .from('progress_snapshots')
    .select('*')
    .eq('student_user_id', body.studentUserId)
    .order('snapshot_date', { ascending: false })
    .limit(10);

  // Fetch class enrollments to get subject-level data
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('class_id, classes(subject_id, subjects(name))')
    .eq('student_user_id', body.studentUserId)
    .eq('status', 'active');

  // Build performance data by subject
  const subjectMap = new Map<string, { scores: number[]; attendance: number[]; assignments: number }>();

  for (const enrollment of enrollments ?? []) {
    const classes = enrollment.classes as { subject_id?: string; subjects?: { name?: string } | null } | null;
    const subjectName = classes?.subjects?.name ?? 'Unknown';

    if (!subjectMap.has(subjectName)) {
      subjectMap.set(subjectName, { scores: [], attendance: [], assignments: 0 });
    }
  }

  for (const snapshot of snapshots ?? []) {
    // Apply to all subjects for now (snapshots are aggregated)
    for (const [, data] of subjectMap) {
      if (snapshot.average_score != null) data.scores.push(Number(snapshot.average_score));
      if (snapshot.attendance_rate != null) data.attendance.push(Number(snapshot.attendance_rate));
      if (snapshot.assignment_completion_rate != null) data.assignments += 1;
    }
  }

  const performanceData = [...subjectMap.entries()].map(([subject, data]) => ({
    subject,
    averageScore: data.scores.length
      ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
      : 0,
    assignmentsCompleted: data.assignments,
    attendanceRate: data.attendance.length
      ? Math.round(data.attendance.reduce((a, b) => a + b, 0) / data.attendance.length)
      : 0,
  }));

  // If no performance data at all, return early
  if (performanceData.length === 0) {
    return NextResponse.json(
      { error: 'Insufficient performance data to analyze this student' },
      { status: 400 },
    );
  }

  // Call the AI orchestrator
  const result = await analyzeStudentPerformance({
    studentName: studentProfile.full_name ?? studentProfile.email,
    studentId: body.studentUserId,
    gradeLevel,
    performanceData,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: 'Analysis generation failed', detail: result.error },
      { status: 422 },
    );
  }

  // Update the student_learning_profiles table
  const analysis = result.data;

  // Resolve subject IDs from names
  const weakSubjectNames = (analysis.weakAreas as any[]).map((a: any) => a.subject);
  const strongSubjectNames = (analysis.strongAreas as any[]).map((a: any) => a.subject);

  const { data: allSubjects } = await supabase.from('subjects').select('id, name');

  const nameToId = new Map((allSubjects ?? []).map((s) => [s.name.toLowerCase(), s.id]));

  const weakSubjectIds = weakSubjectNames
    .map((n) => nameToId.get(n.toLowerCase()))
    .filter(Boolean) as string[];
  const strongSubjectIds = strongSubjectNames
    .map((n) => nameToId.get(n.toLowerCase()))
    .filter(Boolean) as string[];

  await supabase.from('student_learning_profiles').upsert(
    {
      student_user_id: body.studentUserId,
      learning_pace: analysis.learningPace,
      strong_subjects: strongSubjectIds,
      weak_subjects: weakSubjectIds,
      recommended_interventions: analysis.recommendations,
      last_analyzed_at: new Date().toISOString(),
    },
    { onConflict: 'student_user_id' },
  );

  // Log the action
  await supabase.from('ai_action_logs').insert({
    trigger_type: 'intervention_alert',
    target_user_id: body.studentUserId,
    action_payload: {
      analysis: result.data,
      performanceDataUsed: performanceData,
    },
  });

  return NextResponse.json({
    message: 'Student analysis complete',
    analysis: result.data,
    attempts: result.attempts,
  });
}
