import ParentDashboardClient from '@/components/dashboards/ParentDashboardClient';
import { getBillingSummary, getParentDashboardData, requireAppViewer, type BillingSummary } from '@/lib/app-context';
import { createClient } from '@/utils/supabase/server';

export default async function ParentDashboardPage() {
  const viewer = await requireAppViewer();

  const parentData = await getParentDashboardData();
  const billingSummary = await getBillingSummary(viewer.accessToken).catch(() => null as BillingSummary | null);
  const supabase = await createClient();
  const childIds = parentData.children.map((child) => child.userId);

  const childSummaries =
    childIds.length > 0
      ? await buildChildSummaries(supabase, childIds)
      : [];

  return (
    <ParentDashboardClient
      parentName={parentData.parentName}
      linkedChildren={parentData.children}
      billingSummary={billingSummary}
      childSummaries={childSummaries}
    />
  );
}

async function buildChildSummaries(supabase: Awaited<ReturnType<typeof createClient>>, childIds: string[]) {
  const [{ data: enrollmentsData = [] }, { data: notificationsData = [] }, { data: snapshotsData = [] }, { data: aiScoresData = [] }] =
    await Promise.all([
      supabase
        .from('class_enrollments')
        .select('class_id, student_user_id')
        .in('student_user_id', childIds)
        .eq('status', 'active'),
      supabase
        .from('notifications')
        .select('id, recipient_user_id, title, body, status, created_at')
        .in('recipient_user_id', childIds)
        .eq('status', 'unread')
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('progress_snapshots')
        .select('student_user_id, attendance_rate, assignment_completion_rate, average_score, snapshot_date')
        .in('student_user_id', childIds)
        .order('snapshot_date', { ascending: false }),
      supabase
        .from('student_ai_practice_scores')
        .select('*')
        .in('student_id', childIds)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

  const classIds = [...new Set((enrollmentsData ?? []).map((entry) => entry.class_id))];
  const [{ data: lessonsData = [] }, { data: assignmentsData = [] }] = await Promise.all([
    classIds.length
      ? supabase
          .from('lessons')
          .select('id, class_id, scheduled_end_at')
          .in('class_id', classIds)
          .gte('scheduled_end_at', new Date().toISOString())
      : Promise.resolve({ data: [] as Array<{ id: string; class_id: string; scheduled_end_at: string }> }),
    classIds.length
      ? supabase
          .from('assignments')
          .select('id, class_id, status')
          .in('class_id', classIds)
          .in('status', ['published', 'closed'])
      : Promise.resolve({ data: [] as Array<{ id: string; class_id: string; status: string }> }),
  ]);

  const assignmentIds = (assignmentsData ?? []).map((entry) => entry.id);
  const [{ data: submissionsData = [] }, { data: gradesData = [] }] = await Promise.all([
    assignmentIds.length
      ? supabase
          .from('assignment_submissions')
          .select('id, assignment_id, student_user_id, status')
          .in('assignment_id', assignmentIds)
          .in('student_user_id', childIds)
      : Promise.resolve({ data: [] as Array<{ id: string; assignment_id: string; student_user_id: string; status: string }> }),
    assignmentIds.length
      ? supabase
          .from('assignment_submissions')
          .select('id, student_user_id, submission_grades(score)')
          .in('assignment_id', assignmentIds)
          .in('student_user_id', childIds)
      : Promise.resolve({
          data: [] as Array<{ id: string; student_user_id: string; submission_grades: { score: number | null }[] | null }>,
        }),
  ]);

  const summaryByChildId = new Map<
    string,
    {
      childUserId: string;
      alerts: Array<{ id: string; title: string; detail: string }>;
      upcomingLessons: number;
      attendanceRate: number | null;
      pendingAssignments: number;
      completionRate: number | null;
      activeClasses: number;
      gradedSubmissions: number;
      averageScore: number | null;
      snapshotCount: number;
      aiPracticeScores: any[];
    }
  >();

  for (const childId of childIds) {
    summaryByChildId.set(childId, {
      childUserId: childId,
      alerts: [],
      upcomingLessons: 0,
      attendanceRate: null,
      pendingAssignments: 0,
      completionRate: null,
      activeClasses: 0,
      gradedSubmissions: 0,
      averageScore: null,
      snapshotCount: 0,
      aiPracticeScores: [],
    });
  }

  for (const snapshot of snapshotsData ?? []) {
    const summary = summaryByChildId.get(snapshot.student_user_id);
    if (!summary) continue;
    summary.snapshotCount += 1;

    if (!summary.attendanceRate) {
      summary.attendanceRate = snapshot.attendance_rate != null ? Number(snapshot.attendance_rate) : null;
      summary.completionRate = snapshot.assignment_completion_rate != null ? Number(snapshot.assignment_completion_rate) : null;
      summary.averageScore = snapshot.average_score != null ? Number(snapshot.average_score) : null;
    }
  }

  for (const score of aiScoresData ?? []) {
    const summary = summaryByChildId.get(score.student_id);
    if (summary) {
      summary.aiPracticeScores.push(score);
    }
  }

  const activeClassIdsByChild = new Map<string, Set<string>>();
  for (const enrollment of enrollmentsData ?? []) {
    if (!activeClassIdsByChild.has(enrollment.student_user_id)) {
      activeClassIdsByChild.set(enrollment.student_user_id, new Set());
    }
    activeClassIdsByChild.get(enrollment.student_user_id)!.add(enrollment.class_id);
  }

  const upcomingLessonsByClassId = new Map<string, number>();
  for (const lesson of lessonsData ?? []) {
    upcomingLessonsByClassId.set(lesson.class_id, (upcomingLessonsByClassId.get(lesson.class_id) ?? 0) + 1);
  }

  const assignmentsByClassId = new Map<string, string[]>();
  for (const assignment of assignmentsData ?? []) {
    const current = assignmentsByClassId.get(assignment.class_id) ?? [];
    current.push(assignment.id);
    assignmentsByClassId.set(assignment.class_id, current);
  }

  const submittedAssignmentIdsByChild = new Map<string, Set<string>>();
  for (const submission of submissionsData ?? []) {
    if (submission.status && submission.status !== 'draft') {
      if (!submittedAssignmentIdsByChild.has(submission.student_user_id)) {
        submittedAssignmentIdsByChild.set(submission.student_user_id, new Set());
      }
      submittedAssignmentIdsByChild.get(submission.student_user_id)!.add(submission.assignment_id);
    }
  }

  for (const gradedSubmission of gradesData ?? []) {
    const scoreRows = Array.isArray(gradedSubmission.submission_grades)
      ? gradedSubmission.submission_grades
      : gradedSubmission.submission_grades
        ? [gradedSubmission.submission_grades]
        : [];

    if (scoreRows.some((entry) => entry.score != null)) {
      const summary = summaryByChildId.get(gradedSubmission.student_user_id);
      if (summary) {
        summary.gradedSubmissions += 1;
      }
    }
  }

  for (const notification of notificationsData ?? []) {
    const summary = summaryByChildId.get(notification.recipient_user_id);
    if (!summary || summary.alerts.length >= 3) continue;
    summary.alerts.push({
      id: notification.id,
      title: notification.title,
      detail: notification.body,
    });
  }

  for (const childId of childIds) {
    const summary = summaryByChildId.get(childId)!;
    const activeClasses = activeClassIdsByChild.get(childId) ?? new Set();
    summary.activeClasses = activeClasses.size;
    summary.upcomingLessons = [...activeClasses].reduce(
      (count, classId) => count + (upcomingLessonsByClassId.get(classId) ?? 0),
      0,
    );

    const assignmentIdsForChild = new Set<string>();
    for (const classId of activeClasses) {
      for (const assignmentId of assignmentsByClassId.get(classId) ?? []) {
        assignmentIdsForChild.add(assignmentId);
      }
    }

    const submittedIds = submittedAssignmentIdsByChild.get(childId) ?? new Set<string>();
    summary.pendingAssignments = [...assignmentIdsForChild].filter((assignmentId) => !submittedIds.has(assignmentId)).length;

    if (summary.completionRate === null && assignmentIdsForChild.size > 0) {
      summary.completionRate = Math.round((submittedIds.size / assignmentIdsForChild.size) * 100);
    }
  }

  return childIds.map((childId) => summaryByChildId.get(childId)!);
}
