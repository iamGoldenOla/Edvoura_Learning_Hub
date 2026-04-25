import ParentReportsClient, { type ParentChildReport } from '@/components/dashboards/ParentReportsClient';
import { getParentDashboardData, requireAppViewer } from '@/lib/app-context';
import { createClient } from '@/utils/supabase/server';

export default async function ReportsPage() {
  await requireAppViewer();
  const parentData = await getParentDashboardData();
  const supabase = await createClient();
  const childIds = parentData.children.map((child) => child.userId);
  const emptyReports: ParentChildReport[] = parentData.children.map((child) => ({
    childUserId: child.userId,
    averageScore: null,
    totalAssignmentsDue: 0,
    totalAssignmentsSubmitted: 0,
    completionRate: null,
    activeClasses: 0,
    gradedSubmissions: 0,
    snapshotCount: 0,
    latestAssignmentCompletionRate: null,
    subjectReports: [],
  }));

  if (childIds.length === 0) {
    return <ParentReportsClient linkedChildren={parentData.children} childReports={emptyReports} />;
  }

  const { data: enrollmentsData = [] } = await supabase
    .from('class_enrollments')
    .select('class_id, student_user_id')
    .in('student_user_id', childIds)
    .eq('status', 'active');

  const classIds = [...new Set((enrollmentsData ?? []).map((entry) => entry.class_id))];
  const { data: classesData = [] } = classIds.length
    ? await supabase
        .from('classes')
        .select('id, subject_id')
        .in('id', classIds)
    : { data: [] as Array<{ id: string; subject_id: string }> };

  const subjectIds = [...new Set((classesData ?? []).map((entry) => entry.subject_id).filter(Boolean))];
  const { data: subjectsData = [] } = subjectIds.length
    ? await supabase
        .from('subjects')
        .select('id, name')
        .in('id', subjectIds)
    : { data: [] as Array<{ id: string; name: string }> };

  const { data: assignmentsData = [] } = classIds.length
    ? await supabase
        .from('assignments')
        .select('id, class_id, status')
        .in('class_id', classIds)
        .in('status', ['published', 'closed'])
    : { data: [] as Array<{ id: string; class_id: string; status: string }> };

  const assignmentIds = (assignmentsData ?? []).map((entry) => entry.id);
  const { data: submissionsData = [] } = assignmentIds.length
    ? await supabase
        .from('assignment_submissions')
        .select('id, assignment_id, student_user_id, status')
        .in('assignment_id', assignmentIds)
        .in('student_user_id', childIds)
    : { data: [] as Array<{ id: string; assignment_id: string; student_user_id: string; status: string }> };

  const submissionIds = (submissionsData ?? []).map((entry) => entry.id);
  const { data: gradesData = [] } = submissionIds.length
    ? await supabase
        .from('submission_grades')
        .select('submission_id, score, feedback_text, graded_at')
        .in('submission_id', submissionIds)
    : { data: [] as Array<{ submission_id: string; score: number | null; feedback_text: string | null; graded_at: string | null }> };

  const { data: snapshotsData = [] } = await supabase
    .from('progress_snapshots')
    .select('student_user_id, assignment_completion_rate, average_score, snapshot_date')
    .in('student_user_id', childIds)
    .order('snapshot_date', { ascending: false });

  const classById = new Map((classesData ?? []).map((entry) => [entry.id, entry]));
  const subjectById = new Map((subjectsData ?? []).map((entry) => [entry.id, entry.name]));
  const assignmentById = new Map((assignmentsData ?? []).map((entry) => [entry.id, entry]));
  const gradeBySubmissionId = new Map((gradesData ?? []).map((entry) => [entry.submission_id, entry]));
  const latestSnapshotByChildId = new Map<string, { assignment_completion_rate: number | null; average_score: number | null }>();
  const snapshotCountByChildId = new Map<string, number>();

  for (const snapshot of snapshotsData ?? []) {
    snapshotCountByChildId.set(
      snapshot.student_user_id,
      (snapshotCountByChildId.get(snapshot.student_user_id) ?? 0) + 1,
    );

    if (!latestSnapshotByChildId.has(snapshot.student_user_id)) {
      latestSnapshotByChildId.set(snapshot.student_user_id, {
        assignment_completion_rate:
          snapshot.assignment_completion_rate != null ? Number(snapshot.assignment_completion_rate) : null,
        average_score: snapshot.average_score != null ? Number(snapshot.average_score) : null,
      });
    }
  }

  const reportsByChildId = new Map<string, ParentChildReport>();

  for (const child of parentData.children) {
    const activeClasses = new Set(
      (enrollmentsData ?? [])
        .filter((entry) => entry.student_user_id === child.userId)
        .map((entry) => entry.class_id),
    ).size;

    reportsByChildId.set(child.userId, {
      childUserId: child.userId,
      averageScore: latestSnapshotByChildId.get(child.userId)?.average_score ?? null,
      totalAssignmentsDue: 0,
      totalAssignmentsSubmitted: 0,
      completionRate: null,
      activeClasses,
      gradedSubmissions: 0,
      snapshotCount: snapshotCountByChildId.get(child.userId) ?? 0,
      latestAssignmentCompletionRate:
        latestSnapshotByChildId.get(child.userId)?.assignment_completion_rate ?? null,
      subjectReports: [],
    });
  }

  const subjectAggregateByKey = new Map<
    string,
    {
      childUserId: string;
      subject: string;
      assignmentIds: Set<string>;
      submittedAssignmentIds: Set<string>;
      scores: number[];
      latestFeedback: string | null;
      latestFeedbackAt: string | null;
    }
  >();

  for (const submission of submissionsData ?? []) {
    const assignment = assignmentById.get(submission.assignment_id);
    if (!assignment) continue;

    const relatedClass = classById.get(assignment.class_id);
    const subjectName = relatedClass ? subjectById.get(relatedClass.subject_id) ?? 'General Studies' : 'General Studies';
    const aggregateKey = `${submission.student_user_id}:${subjectName}`;
    const grade = gradeBySubmissionId.get(submission.id);

    if (!subjectAggregateByKey.has(aggregateKey)) {
      subjectAggregateByKey.set(aggregateKey, {
        childUserId: submission.student_user_id,
        subject: subjectName,
        assignmentIds: new Set(),
        submittedAssignmentIds: new Set(),
        scores: [],
        latestFeedback: null,
        latestFeedbackAt: null,
      });
    }

    const aggregate = subjectAggregateByKey.get(aggregateKey)!;
    aggregate.assignmentIds.add(submission.assignment_id);

    if (submission.status && submission.status !== 'draft') {
      aggregate.submittedAssignmentIds.add(submission.assignment_id);
    }

    if (grade?.score != null) {
      aggregate.scores.push(Number(grade.score));
      const gradedAt = grade.graded_at ?? '';
      if (grade.feedback_text && (!aggregate.latestFeedbackAt || gradedAt >= aggregate.latestFeedbackAt)) {
        aggregate.latestFeedback = grade.feedback_text;
        aggregate.latestFeedbackAt = gradedAt;
      }
    }
  }

  for (const assignment of assignmentsData ?? []) {
    const relatedClass = classById.get(assignment.class_id);
    const subjectName = relatedClass ? subjectById.get(relatedClass.subject_id) ?? 'General Studies' : 'General Studies';
    const enrolledChildren = (enrollmentsData ?? []).filter((entry) => entry.class_id === assignment.class_id);

    for (const enrollment of enrolledChildren) {
      const aggregateKey = `${enrollment.student_user_id}:${subjectName}`;
      if (!subjectAggregateByKey.has(aggregateKey)) {
        subjectAggregateByKey.set(aggregateKey, {
          childUserId: enrollment.student_user_id,
          subject: subjectName,
          assignmentIds: new Set(),
          submittedAssignmentIds: new Set(),
          scores: [],
          latestFeedback: null,
          latestFeedbackAt: null,
        });
      }

      subjectAggregateByKey.get(aggregateKey)!.assignmentIds.add(assignment.id);
    }
  }

  for (const aggregate of subjectAggregateByKey.values()) {
    const childReport = reportsByChildId.get(aggregate.childUserId);
    if (!childReport) continue;

    const assignmentsDue = aggregate.assignmentIds.size;
    const assignmentsSubmitted = aggregate.submittedAssignmentIds.size;
    const score =
      aggregate.scores.length > 0
        ? Math.round(aggregate.scores.reduce((sum, value) => sum + value, 0) / aggregate.scores.length)
        : null;

    childReport.totalAssignmentsDue += assignmentsDue;
    childReport.totalAssignmentsSubmitted += assignmentsSubmitted;
    childReport.gradedSubmissions += aggregate.scores.length;
    childReport.subjectReports.push({
      subject: aggregate.subject,
      score,
      tutorFeedback: aggregate.latestFeedback,
      assignmentsDue,
      assignmentsSubmitted,
    });
  }

  const childReports = parentData.children.map((child) => {
    const childReport = reportsByChildId.get(child.userId)!;
    const fallbackAverage =
      childReport.subjectReports.length > 0
        ? Math.round(
            childReport.subjectReports
              .filter((entry) => entry.score != null)
              .reduce((sum, entry, _, list) => sum + Number(entry.score ?? 0) / Math.max(list.length, 1), 0),
          )
        : null;

    return {
      ...childReport,
      averageScore: childReport.averageScore ?? fallbackAverage,
      completionRate:
        childReport.totalAssignmentsDue > 0
          ? Math.round((childReport.totalAssignmentsSubmitted / childReport.totalAssignmentsDue) * 100)
          : childReport.latestAssignmentCompletionRate != null
            ? Math.round(childReport.latestAssignmentCompletionRate)
            : null,
      subjectReports: childReport.subjectReports.sort((a, b) => a.subject.localeCompare(b.subject)),
    };
  });

  return <ParentReportsClient linkedChildren={parentData.children} childReports={childReports} />;
}
