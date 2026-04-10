import { Injectable, Logger } from '@nestjs/common';
import { sql } from 'kysely';
import { DatabaseService } from '../../../api/src/common/database/database.service.js';

@Injectable()
export class ParentAlertProcessor {
  private readonly logger = new Logger(ParentAlertProcessor.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async process(): Promise<void> {
    await this.processLateAssignments();
  }

  private async processLateAssignments(): Promise<void> {
    const now = new Date();

    // Find assignments that are past due,
    // where the enrolled student has not submitted,
    // and we haven't sent an 'assignment_overdue' notification yet.
    const overdueData = await this.databaseService.db
      .selectFrom('class_enrollments as ce')
      .innerJoin('assignments as a', 'a.class_id', 'ce.class_id')
      .innerJoin('parent_student_links as psl', 'psl.student_user_id', 'ce.student_user_id')
      .innerJoin('profiles as pt', 'pt.id', 'ce.student_user_id')
      .select([
        'a.id as assignmentId',
        'a.title as assignmentTitle',
        'a.due_at as dueAt',
        'ce.student_user_id as studentId',
        'pt.full_name as studentName',
        'psl.parent_user_id as parentId',
      ])
      .where('ce.status', '=', 'active')
      .where('psl.is_active', '=', true)
      .where('a.status', '=', 'published')
      .where('a.due_at', '<', now.toISOString())
      // Ensure student hasn't submitted
      .where((eb) =>
        eb.not(
          eb.exists(
            eb
              .selectFrom('assignment_submissions as subs')
              .select('subs.id')
              .whereRef('subs.assignment_id', '=', 'a.id')
              .whereRef('subs.student_user_id', '=', 'ce.student_user_id')
          )
        )
      )
      // Ensure we haven't sent the overdue alert to the parent for this assignment + student combo
      .where((eb) =>
        eb.not(
          eb.exists(
            eb
              .selectFrom('notifications as n')
              .select('n.id')
              .where('n.kind', '=', 'assignment_overdue')
              .where(sql<string>`n.data->>'assignmentId'`, '=', sql<string>`a.id`)
              .where(sql<string>`n.data->>'studentId'`, '=', sql<string>`ce.student_user_id`)
              .whereRef('n.recipient_user_id', '=', 'psl.parent_user_id')
          )
        )
      )
      .execute();

    if (overdueData.length === 0) return;

    this.logger.log(`Found ${overdueData.length} late assignments to alert parents about`);

    const notificationsToInsert = [];
    const _now = new Date().toISOString();

    for (const data of overdueData) {
      const studentFirstName = data.studentName?.split(' ')[0] || 'your child';
      const dueDate = new Date(data.dueAt!).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      notificationsToInsert.push({
        recipient_user_id: data.parentId,
        actor_user_id: null,
        kind: 'assignment_overdue' as const,
        title: `Overdue Assignment: ${data.assignmentTitle}`,
        body: `${studentFirstName} has not submitted "${data.assignmentTitle}" which was due on ${dueDate}. Please check in with them.`,
        status: 'unread' as const,
        data: {
          assignmentId: data.assignmentId,
          studentId: data.studentId,
        },
        created_at: _now,
        updated_at: _now,
      });
    }

    if (notificationsToInsert.length > 0) {
      await this.databaseService.db
        .insertInto('notifications')
        .values(notificationsToInsert)
        .execute();
      this.logger.log(`Created ${notificationsToInsert.length} late assignment alerts`);
    }
  }
}
