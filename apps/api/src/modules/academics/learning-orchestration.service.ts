import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../common/database/database.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

type ClassAudience = {
  studentUserIds: string[];
  parentUserIds: string[];
  adminUserIds: string[];
};

@Injectable()
export class LearningOrchestrationService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async onLessonScheduled(input: {
    actorUserId: string;
    classId: string;
    lessonId: string;
    lessonTitle: string;
    startsAt: string;
  }) {
    const audience = await this.getClassAudience(input.classId);
    const lessonTime = new Date(input.startsAt).toLocaleString();

    await this.recordEvent({
      eventType: 'lesson.scheduled',
      actorUserId: input.actorUserId,
      classId: input.classId,
      lessonId: input.lessonId,
      payload: {
        lessonTitle: input.lessonTitle,
        startsAt: input.startsAt,
      },
    });

    for (const studentUserId of audience.studentUserIds) {
      await this.notificationsService.create({
        recipientUserId: studentUserId,
        actorUserId: input.actorUserId,
        kind: 'lesson_reminder',
        title: 'New Lesson Scheduled',
        body: `${input.lessonTitle} is scheduled for ${lessonTime}.`,
        data: {
          classId: input.classId,
          lessonId: input.lessonId,
          startsAt: input.startsAt,
        },
      });
    }

    for (const parentUserId of audience.parentUserIds) {
      await this.notificationsService.create({
        recipientUserId: parentUserId,
        actorUserId: input.actorUserId,
        kind: 'lesson_reminder',
        title: 'Child Lesson Scheduled',
        body: `A lesson (${input.lessonTitle}) has been scheduled for your child at ${lessonTime}.`,
        data: {
          classId: input.classId,
          lessonId: input.lessonId,
          startsAt: input.startsAt,
        },
      });
    }

    await this.notifyAdmins({
      adminUserIds: audience.adminUserIds,
      actorUserId: input.actorUserId,
      title: 'Lesson Scheduled',
      body: `${input.lessonTitle} was scheduled for class ${input.classId}.`,
      data: {
        classId: input.classId,
        lessonId: input.lessonId,
        startsAt: input.startsAt,
      },
    });
  }

  async onLessonLaunched(input: {
    actorUserId: string;
    classId: string;
    lessonId: string;
    lessonTitle: string;
    joinUrl: string | null;
    launchedAt: string;
  }) {
    const audience = await this.getClassAudience(input.classId);

    await this.recordEvent({
      eventType: 'lesson.live_started',
      actorUserId: input.actorUserId,
      classId: input.classId,
      lessonId: input.lessonId,
      payload: {
        lessonTitle: input.lessonTitle,
        joinUrl: input.joinUrl,
        launchedAt: input.launchedAt,
      },
    });

    for (const studentUserId of audience.studentUserIds) {
      await this.notificationsService.create({
        recipientUserId: studentUserId,
        actorUserId: input.actorUserId,
        kind: 'lesson_reminder',
        title: 'Lesson Is Live Now',
        body: input.joinUrl
          ? `${input.lessonTitle} is live now. Join from your dashboard.`
          : `${input.lessonTitle} is live now.`,
        data: {
          classId: input.classId,
          lessonId: input.lessonId,
          joinUrl: input.joinUrl,
          launchedAt: input.launchedAt,
        },
      });
    }

    for (const parentUserId of audience.parentUserIds) {
      await this.notificationsService.create({
        recipientUserId: parentUserId,
        actorUserId: input.actorUserId,
        kind: 'lesson_reminder',
        title: 'Child Lesson Went Live',
        body: `${input.lessonTitle} is live now for your child.`,
        data: {
          classId: input.classId,
          lessonId: input.lessonId,
          launchedAt: input.launchedAt,
        },
      });
    }

    await this.notifyAdmins({
      adminUserIds: audience.adminUserIds,
      actorUserId: input.actorUserId,
      title: 'Lesson Live Started',
      body: `${input.lessonTitle} was launched for class ${input.classId}.`,
      data: {
        classId: input.classId,
        lessonId: input.lessonId,
        launchedAt: input.launchedAt,
      },
    });
  }

  async onAssignmentPublished(input: {
    actorUserId: string;
    classId: string;
    assignmentId: string;
    assignmentTitle: string;
    dueAt: string | null;
  }) {
    const audience = await this.getClassAudience(input.classId);
    const dueText = input.dueAt ? new Date(input.dueAt).toLocaleString() : 'No due date';

    await this.recordEvent({
      eventType: 'assignment.published',
      actorUserId: input.actorUserId,
      classId: input.classId,
      assignmentId: input.assignmentId,
      payload: {
        assignmentTitle: input.assignmentTitle,
        dueAt: input.dueAt,
      },
    });

    for (const studentUserId of audience.studentUserIds) {
      await this.notificationsService.create({
        recipientUserId: studentUserId,
        actorUserId: input.actorUserId,
        kind: 'assignment_due',
        title: 'New Assignment Published',
        body: `${input.assignmentTitle} is available. Due: ${dueText}.`,
        data: {
          classId: input.classId,
          assignmentId: input.assignmentId,
          dueAt: input.dueAt,
        },
      });
    }

    for (const parentUserId of audience.parentUserIds) {
      await this.notificationsService.create({
        recipientUserId: parentUserId,
        actorUserId: input.actorUserId,
        kind: 'assignment_due',
        title: 'Child Assignment Published',
        body: `${input.assignmentTitle} was published for your child. Due: ${dueText}.`,
        data: {
          classId: input.classId,
          assignmentId: input.assignmentId,
          dueAt: input.dueAt,
        },
      });
    }

    await this.notifyAdmins({
      adminUserIds: audience.adminUserIds,
      actorUserId: input.actorUserId,
      title: 'Assignment Published',
      body: `${input.assignmentTitle} was published for class ${input.classId}.`,
      data: {
        classId: input.classId,
        assignmentId: input.assignmentId,
        dueAt: input.dueAt,
      },
    });
  }

  private async notifyAdmins(input: {
    adminUserIds: string[];
    actorUserId: string;
    title: string;
    body: string;
    data: Record<string, unknown>;
  }) {
    for (const adminUserId of input.adminUserIds) {
      await this.notificationsService.create({
        recipientUserId: adminUserId,
        actorUserId: input.actorUserId,
        kind: 'admin_alert',
        title: input.title,
        body: input.body,
        data: input.data,
      });
    }
  }

  private async recordEvent(input: {
    eventType: string;
    actorUserId: string;
    classId?: string;
    lessonId?: string;
    assignmentId?: string;
    payload: Record<string, unknown>;
  }) {
    await this.databaseService.db
      .insertInto('learning_activity_events')
      .values({
        event_type: input.eventType,
        actor_user_id: input.actorUserId,
        class_id: input.classId ?? null,
        lesson_id: input.lessonId ?? null,
        assignment_id: input.assignmentId ?? null,
        payload: input.payload,
        created_at: new Date().toISOString(),
      })
      .execute();
  }

  private async getClassAudience(classId: string): Promise<ClassAudience> {
    const enrollments = await this.databaseService.db
      .selectFrom('class_enrollments')
      .select('student_user_id as studentUserId')
      .where('class_id', '=', classId)
      .where('status', '=', 'active')
      .execute();
    const studentUserIds = Array.from(new Set(enrollments.map((row) => row.studentUserId)));

    const parentLinks =
      studentUserIds.length > 0
        ? await this.databaseService.db
            .selectFrom('parent_student_links')
            .select('parent_user_id as parentUserId')
            .where('student_user_id', 'in', studentUserIds)
            .where('is_active', '=', true)
            .execute()
        : [];
    const parentUserIds = Array.from(new Set(parentLinks.map((row) => row.parentUserId)));

    const admins = await this.databaseService.db
      .selectFrom('user_roles')
      .select('user_id as userId')
      .where('role', 'in', ['admin', 'super_admin'])
      .where('revoked_at', 'is', null)
      .execute();
    const adminUserIds = Array.from(new Set(admins.map((row) => row.userId)));

    return { studentUserIds, parentUserIds, adminUserIds };
  }
}
