import { Injectable, Logger } from '@nestjs/common';
import { sql } from 'kysely';
import { DatabaseService } from '../../../api/src/common/database/database.service.js';

@Injectable()
export class LessonReminderProcessor {
  private readonly logger = new Logger(LessonReminderProcessor.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async process(): Promise<void> {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    const now = new Date();

    // Find upcoming lessons scheduled to start in the next 1 hour, that don't already have a reminder sent
    const upcomingLessons = await this.databaseService.db
      .selectFrom('lessons as l')
      .leftJoin('private.lesson_live_sessions as ls', 'ls.lesson_id', 'l.id')
      .select([
        'l.id as lessonId',
        'l.title',
        'l.scheduled_start_at as scheduledStartAt',
        'ls.join_url as joinUrl',
      ])
      .where('l.status', '=', 'scheduled')
      .where('l.scheduled_start_at', '>', now.toISOString())
      .where('l.scheduled_start_at', '<=', oneHourFromNow.toISOString())
      // Check that we haven't already sent a reminder for this lesson
      .where((eb) =>
        eb.not(
          eb.exists(
            eb
              .selectFrom('notifications')
              .select('id')
              .where('kind', '=', 'lesson_reminder')
              .where(sql<string>`data->>'lessonId'`, '=', sql<string>`l.id`)
          )
        )
      )
      .execute();

    if (upcomingLessons.length === 0) return;

    this.logger.log(`Found ${upcomingLessons.length} upcoming lesson(s) to send reminders for`);

    for (const lesson of upcomingLessons) {
      await this.sendRemindersForLesson({
        ...lesson,
        lessonId: lesson.lessonId as string,
      });
    }
  }

  private async sendRemindersForLesson(lesson: {
    lessonId: string;
    title: string;
    scheduledStartAt: string;
    joinUrl: string | null;
  }): Promise<void> {
    // Get all enrolled students and their linked parents
    const enrollmentsRows = await this.databaseService.db
      .selectFrom('class_enrollments as ce')
      .innerJoin('lessons as l', 'l.class_id', 'ce.class_id')
      .innerJoin('parent_student_links as psl', 'psl.student_user_id', 'ce.student_user_id')
      .select([
        'ce.student_user_id as studentId',
        'psl.parent_user_id as parentId',
      ])
      .where('l.id', '=', lesson.lessonId)
      .where('ce.status', '=', 'active')
      .where('psl.is_active', '=', true)
      .execute();

    if (enrollmentsRows.length === 0) return;

    const notificationsToInsert = [];
    const _now = new Date().toISOString();

    const lessonTime = new Date(lesson.scheduledStartAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    const bodyDetails = lesson.joinUrl ? `\nJoin link: ${lesson.joinUrl}` : '';
    const title = `Reminder: ${lesson.title} starts in 1 hour`;
    const body = `Your lesson "${lesson.title}" is scheduled to start at ${lessonTime}.${bodyDetails}`;

    // Collect all unique user IDs to notify (students + parents)
    const userIdsToNotify = new Set<string>();
    for (const row of enrollmentsRows) {
      userIdsToNotify.add(row.studentId);
      userIdsToNotify.add(row.parentId);
    }

    for (const userId of userIdsToNotify) {
      notificationsToInsert.push({
        recipient_user_id: userId,
        actor_user_id: null,
        kind: 'lesson_reminder' as const,
        title,
        body,
        status: 'unread' as const,
        data: { lessonId: lesson.lessonId },
        created_at: _now,
        updated_at: _now,
      });
    }

    if (notificationsToInsert.length > 0) {
      await this.databaseService.db
        .insertInto('notifications')
        .values(notificationsToInsert)
        .execute();

      this.logger.log(`Created ${notificationsToInsert.length} reminders for lesson ${lesson.lessonId}`);
    }
  }
}
