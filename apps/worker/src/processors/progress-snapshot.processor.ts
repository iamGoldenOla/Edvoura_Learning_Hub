import { Injectable, Logger } from '@nestjs/common';

import { DatabaseService } from '../common/database/database.service.js';

@Injectable()
export class ProgressSnapshotProcessor {
  private readonly logger = new Logger(ProgressSnapshotProcessor.name);
  private lastRunDate: string | null = null;

  constructor(private readonly databaseService: DatabaseService) {}

  async process(): Promise<void> {
    // Only run once per day
    const today = new Date().toISOString().slice(0, 10);
    if (this.lastRunDate === today) return;

    this.logger.log('Running daily progress snapshot generation...');

    try {
      // Get all students with active enrollments
      const enrolledStudents = await this.databaseService.db
        .selectFrom('class_enrollments as ce')
        .innerJoin('classes as c', 'c.id', 'ce.class_id')
        .select([
          'ce.student_user_id',
          'c.subject_id',
        ])
        .where('ce.status', '=', 'active')
        .execute();

      // Group by student + subject
      const studentSubjectPairs = new Map<string, Set<string>>();
      for (const row of enrolledStudents) {
        const key = row.student_user_id;
        if (!studentSubjectPairs.has(key)) {
          studentSubjectPairs.set(key, new Set());
        }
        studentSubjectPairs.get(key)!.add(row.subject_id);
      }

      let snapshotCount = 0;

      for (const [studentUserId, subjectIds] of studentSubjectPairs) {
        for (const subjectId of subjectIds) {
          await this.generateSnapshot(studentUserId, subjectId, today);
          snapshotCount++;
        }
      }

      this.lastRunDate = today;
      this.logger.log(`Progress snapshots generated: ${snapshotCount} student-subject pairs`);
    } catch (err) {
      this.logger.error('Progress snapshot generation failed', err);
    }
  }

  private async generateSnapshot(
    studentUserId: string,
    subjectId: string,
    snapshotDate: string,
  ): Promise<void> {
    // 1. Attendance rate (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const attendanceStats = await this.databaseService.db
      .selectFrom('lesson_attendance as la')
      .innerJoin('lessons as l', 'l.id', 'la.lesson_id')
      .innerJoin('classes as c', 'c.id', 'l.class_id')
      .select((eb) => [
        eb.fn.count<number>('la.id').as('totalLessons'),
        eb.fn.count<number>(
          eb.case().when('la.status', '=', 'present').then('la.id').end()
        ).as('presentCount'),
      ])
      .where('la.student_user_id', '=', studentUserId)
      .where('c.subject_id', '=', subjectId)
      .where('la.created_at', '>=', thirtyDaysAgo)
      .executeTakeFirst();

    const totalLessons = Number(attendanceStats?.totalLessons ?? 0);
    const presentCount = Number(attendanceStats?.presentCount ?? 0);
    const attendanceRate = totalLessons > 0 ? (presentCount / totalLessons) * 100 : null;

    // 2. Assignment completion rate
    const assignmentStats = await this.databaseService.db
      .selectFrom('assignments as a')
      .innerJoin('classes as c', 'c.id', 'a.class_id')
      .leftJoin('assignment_submissions as asub', (join) =>
        join
          .onRef('asub.assignment_id', '=', 'a.id')
          .on('asub.student_user_id', '=', studentUserId),
      )
      .select((eb) => [
        eb.fn.count<number>('a.id').as('totalAssignments'),
        eb.fn.count<number>('asub.id').as('submittedCount'),
      ])
      .where('c.subject_id', '=', subjectId)
      .where('a.status', 'in', ['published', 'closed'])
      .executeTakeFirst();

    const totalAssignments = Number(assignmentStats?.totalAssignments ?? 0);
    const submittedCount = Number(assignmentStats?.submittedCount ?? 0);
    const completionRate = totalAssignments > 0 ? (submittedCount / totalAssignments) * 100 : null;

    // 3. Average score
    const scoreStats = await this.databaseService.db
      .selectFrom('submission_grades as sg')
      .innerJoin('assignment_submissions as asub', 'asub.id', 'sg.submission_id')
      .innerJoin('assignments as a', 'a.id', 'asub.assignment_id')
      .innerJoin('classes as c', 'c.id', 'a.class_id')
      .select((eb) => [
        eb.fn.avg<number>('sg.score').as('avgScore'),
      ])
      .where('asub.student_user_id', '=', studentUserId)
      .where('c.subject_id', '=', subjectId)
      .executeTakeFirst();

    const avgScore = scoreStats?.avgScore != null ? Number(scoreStats.avgScore) : null;

    // Upsert progress snapshot
    await this.databaseService.db
      .insertInto('progress_snapshots')
      .values({
        student_user_id: studentUserId,
        subject_id: subjectId,
        snapshot_date: snapshotDate,
        attendance_rate: attendanceRate != null ? String(attendanceRate.toFixed(2)) : null,
        assignment_completion_rate: completionRate != null ? String(completionRate.toFixed(2)) : null,
        average_score: avgScore != null ? String(avgScore.toFixed(2)) : null,
        mastery_notes: null,
        created_at: new Date().toISOString(),
      })
      .execute();
  }
}
