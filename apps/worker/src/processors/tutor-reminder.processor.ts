import { Injectable, Logger } from '@nestjs/common';
import { sql } from 'kysely';
import { DatabaseService } from '../common/database/database.service.js';

@Injectable()
export class TutorReminderProcessor {
  private readonly logger = new Logger(TutorReminderProcessor.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async process(): Promise<void> {
    await this.processUngradedSubmissions();
    await this.processUpcomingClasses();
  }

  private async processUngradedSubmissions(): Promise<void> {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    // Find graded assignments that are older than 48 hours and have no grade
    // Group by tutor to send 1 aggregated notification
    const ungradedCounts = await this.databaseService.db
      .selectFrom('assignment_submissions as subs')
      .innerJoin('assignments as a', 'a.id', 'subs.assignment_id')
      .innerJoin('classes as c', 'c.id', 'a.class_id')
      // Only care about submissions that were actually submitted
      .where('subs.status', 'in', ['submitted', 'late'])
      .where('subs.submitted_at', '<', fortyEightHoursAgo.toISOString())
      // Only for classes that have a primary tutor
      .where('c.primary_tutor_user_id', 'is not', null)
      .select([
        'c.primary_tutor_user_id as tutorId',
        this.databaseService.db.fn.count<string>(sql`subs.id`).as('ungradedCount'),
      ])
      .groupBy('c.primary_tutor_user_id')
      .execute();

    if (ungradedCounts.length === 0) return;

    const notificationsToInsert = [];
    const _now = new Date().toISOString();

    for (const countData of ungradedCounts) {
      if (!countData.tutorId) continue;

      const tutorId = countData.tutorId;
      const count = parseInt(countData.ungradedCount, 10);

      // Check if we already sent a reminder to this tutor today
      const alreadySent = await this.databaseService.db
        .selectFrom('notifications')
        .select('id')
        .where('kind', '=', 'tutor_ungraded_reminder')
        .where('recipient_user_id', '=', tutorId)
        .where('created_at', '>', startOfDay.toISOString())
        .executeTakeFirst();

      if (alreadySent) continue;

      notificationsToInsert.push({
        recipient_user_id: tutorId,
        actor_user_id: null,
        kind: 'tutor_ungraded_reminder' as const,
        title: 'Action Needed: Ungraded Submissions',
        body: `You have ${count} ungraded submission(s) that are over 48 hours old.`,
        status: 'unread' as const,
        data: {},
        created_at: _now,
        updated_at: _now,
      });
    }

    if (notificationsToInsert.length > 0) {
      await this.databaseService.db
        .insertInto('notifications')
        .values(notificationsToInsert)
        .execute();
      this.logger.log(`Created ${notificationsToInsert.length} tutor ungraded reminders`);
    }
  }

  private async processUpcomingClasses(): Promise<void> {
    const thirtyMinsFromNow = new Date(Date.now() + 30 * 60 * 1000);
    const now = new Date();

    const upcomingLessons = await this.databaseService.db
      .selectFrom('lessons as l')
      .leftJoin('private.lesson_live_sessions as ls', 'ls.lesson_id', 'l.id')
      .innerJoin('classes as c', 'c.id', 'l.class_id')
      .select([
        'l.id as lessonId',
        'l.title',
        'l.scheduled_start_at as scheduledStartAt',
        'ls.host_url as hostUrl',
        'l.tutor_user_id as specificTutorId',
        'c.primary_tutor_user_id as fallbackTutorId',
      ])
      .where('l.status', '=', 'scheduled')
      .where('l.scheduled_start_at', '>', now.toISOString())
      .where('l.scheduled_start_at', '<=', thirtyMinsFromNow.toISOString())
      .where((eb) =>
        eb.not(
          eb.exists(
            eb
              .selectFrom('notifications')
              .select('id')
              .where('kind', '=', 'lesson_upcoming_tutor')
              .where(sql<string>`data->>'lessonId'`, '=', sql<string>`l.id`)
          )
        )
      )
      .execute();

    if (upcomingLessons.length === 0) return;

    const notificationsToInsert = [];
    const _now = new Date().toISOString();

    for (const lesson of upcomingLessons) {
      const tutorId = lesson.specificTutorId ?? lesson.fallbackTutorId;
      if (!tutorId) continue;

      const lessonTime = new Date(lesson.scheduledStartAt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });

      const bodyDetails = lesson.hostUrl ? `\nHost link: ${lesson.hostUrl}` : '';
      
      notificationsToInsert.push({
        recipient_user_id: tutorId,
        actor_user_id: null,
        kind: 'lesson_upcoming_tutor' as const,
        title: `Your class starts in 30 mins: ${lesson.title}`,
        body: `You are scheduled to teach "${lesson.title}" at ${lessonTime}.${bodyDetails}`,
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
      this.logger.log(`Created ${notificationsToInsert.length} tutor class reminders`);
    }
  }
}
