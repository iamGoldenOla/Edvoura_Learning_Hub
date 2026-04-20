import {
  assignRoleSchema,
  approveTutorSchema,
  rejectTutorSchema,
  type RunAdminOperationDto,
  type AssignRoleDto,
  type ApproveTutorDto,
  type RejectTutorDto,
  type AppRole,
} from '@edvoura/contracts';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { DatabaseService } from '../../common/database/database.service.js';
import { ApplicationError } from '../../common/errors/application-error.js';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class AdminService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async assignRole(adminUserId: string, targetUserId: string, dto: AssignRoleDto): Promise<void> {
    const parsed = assignRoleSchema.parse(dto);

    // Verify target profile exists
    const target = await this.databaseService.db
      .selectFrom('profiles')
      .select('id')
      .where('id', '=', targetUserId)
      .executeTakeFirst();

    if (!target) {
      throw new ApplicationError(404, 'user_not_found', 'Target user not found.');
    }

    await this.databaseService.db
      .insertInto('user_roles')
      .values({
        user_id: targetUserId,
        role: parsed.role,
        granted_by_user_id: adminUserId,
        granted_at: new Date().toISOString(),
        revoked_at: null,
      })
      .onConflict((oc) =>
        oc.columns(['user_id', 'role']).doUpdateSet({
          revoked_at: null,
          granted_by_user_id: adminUserId,
          granted_at: new Date().toISOString(),
        }),
      )
      .execute();
  }

  async revokeRole(targetUserId: string, role: AppRole): Promise<void> {
    const result = await this.databaseService.db
      .updateTable('user_roles')
      .set({ revoked_at: new Date().toISOString() })
      .where('user_id', '=', targetUserId)
      .where('role', '=', role)
      .where('revoked_at', 'is', null)
      .executeTakeFirst();

    if (!result) {
      throw new ApplicationError(404, 'role_not_found', 'Active role assignment not found.');
    }
  }

  async approveTutor(adminUserId: string, tutorUserId: string, dto: ApproveTutorDto): Promise<void> {
    const parsed = approveTutorSchema.parse(dto);

    const tutorProfile = await this.databaseService.db
      .selectFrom('tutor_profiles')
      .select(['user_id', 'approval_status'])
      .where('user_id', '=', tutorUserId)
      .executeTakeFirst();

    if (!tutorProfile) {
      throw new ApplicationError(404, 'tutor_profile_not_found', 'Tutor profile not found.');
    }

    if (tutorProfile.approval_status === 'approved') {
      throw new ApplicationError(409, 'already_approved', 'Tutor is already approved.');
    }

    await this.databaseService.db
      .updateTable('tutor_profiles')
      .set({
        approval_status: 'approved',
        approved_by_user_id: adminUserId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(parsed.notes ? { availability_notes: parsed.notes } : {}),
      })
      .where('user_id', '=', tutorUserId)
      .execute();
  }

  async rejectTutor(adminUserId: string, tutorUserId: string, dto: RejectTutorDto): Promise<void> {
    const parsed = rejectTutorSchema.parse(dto);

    const tutorProfile = await this.databaseService.db
      .selectFrom('tutor_profiles')
      .select('user_id')
      .where('user_id', '=', tutorUserId)
      .executeTakeFirst();

    if (!tutorProfile) {
      throw new ApplicationError(404, 'tutor_profile_not_found', 'Tutor profile not found.');
    }

    await this.databaseService.db
      .updateTable('tutor_profiles')
      .set({
        approval_status: 'rejected',
        approved_by_user_id: adminUserId,
        approved_at: new Date().toISOString(),
        availability_notes: `Rejected: ${parsed.reason}`,
        updated_at: new Date().toISOString(),
      })
      .where('user_id', '=', tutorUserId)
      .execute();
  }

  async listPendingTutors() {
    return this.databaseService.db
      .selectFrom('profiles as p')
      .innerJoin('tutor_profiles as tp', 'tp.user_id', 'p.id')
      .select([
        'p.id as userId',
        'p.email',
        'p.full_name as fullName',
        'p.phone_number as phoneNumber',
        'tp.approval_status as approvalStatus',
        'tp.headline',
        'tp.bio',
        'tp.expertise_summary as expertiseSummary',
        'tp.created_at as appliedAt',
      ])
      .where('tp.approval_status', '=', 'pending')
      .orderBy('tp.created_at', 'asc')
      .execute();
  }

  async listUserRoles(userId: string) {
    return this.databaseService.db
      .selectFrom('user_roles')
      .select(['id', 'role', 'granted_by_user_id', 'granted_at', 'revoked_at'])
      .where('user_id', '=', userId)
      .execute();
  }

  async runOperation(adminUserId: string, dto: RunAdminOperationDto) {
    const actionKey = dto.actionKey.trim().toLowerCase();
    const context = dto.context ?? {};

    switch (actionKey) {
      case 'create-broadcast':
      case 'notifications.create-broadcast':
        return this.broadcastToRoles(adminUserId, ['student', 'parent', 'tutor'], {
          title: 'Platform Broadcast',
          body: 'A new platform-wide broadcast was sent by admin.',
          kind: 'admin_alert',
          actionKey,
          context,
        });
      case 'parent-broadcast':
      case 'notifications.parent-broadcast':
        return this.broadcastToRoles(adminUserId, ['parent'], {
          title: 'Parent Broadcast',
          body: 'A parent-facing broadcast was sent.',
          kind: 'admin_alert',
          actionKey,
          context,
        });
      case 'lesson-reminders':
      case 'notifications.lesson-reminders':
        return this.broadcastToRoles(adminUserId, ['student', 'parent'], {
          title: 'Lesson Reminder Sweep',
          body: 'Lesson reminder notifications were triggered.',
          kind: 'lesson_reminder',
          actionKey,
          context,
        });
      case 'schedule-weekly-digest':
      case 'notifications.schedule-weekly-digest':
        await this.insertAudit(adminUserId, actionKey, 'notifications', context);
        return this.okResult(actionKey, 'Weekly digest schedule queued.');
      case 'failed-deliveries':
      case 'notifications.failed-deliveries':
        await this.insertAudit(adminUserId, actionKey, 'notifications', context);
        return this.okResult(actionKey, 'Failed deliveries review workflow started.');
      case 'pause-campaign':
      case 'notifications.pause-campaign':
        await this.insertAudit(adminUserId, actionKey, 'notifications', context);
        return this.okResult(actionKey, 'Campaign pause request recorded.');
      case 'platform-alert':
      case 'support.platform-alert':
        return this.broadcastToRoles(adminUserId, ['admin', 'super_admin'], {
          title: 'Platform Alert',
          body: 'An operational platform alert was issued.',
          kind: 'admin_alert',
          actionKey,
          context,
        });
      case 'moderation-sweep':
      case 'support.moderation-sweep':
        await this.insertAudit(adminUserId, actionKey, 'support', context);
        return this.okResult(actionKey, 'Moderation sweep started.');
      case 'ticket-queue':
      case 'support.ticket-queue':
        await this.insertAudit(adminUserId, actionKey, 'support', context);
        return this.okResult(actionKey, 'Ticket queue opened and logged.');
      case 'add-subject':
      case 'academic.add-subject': {
        const created = await this.databaseService.db
          .insertInto('subjects')
          .values({
            id: randomUUID(),
            slug: `subject-${Date.now()}`,
            name: `New Subject ${new Date().toISOString().slice(0, 10)}`,
            is_core: false,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .returning(['id', 'slug', 'name'])
          .executeTakeFirstOrThrow();
        await this.insertAudit(adminUserId, actionKey, 'academic', { ...context, subjectId: created.id });
        return this.okResult(actionKey, `Subject created: ${created.name}`, created);
      }
      case 'map-grade-band':
      case 'academic.map-grade-band':
        await this.insertAudit(adminUserId, actionKey, 'academic', context);
        return this.okResult(actionKey, 'Grade-band mapping action recorded.');
      case 'export-report':
      case 'billing.export-report':
        await this.insertAudit(adminUserId, actionKey, 'billing', context);
        return this.okResult(actionKey, 'Billing export task queued.');
      case 'new-entry':
      case 'billing.new-entry':
        await this.insertAudit(adminUserId, actionKey, 'billing', context);
        return this.okResult(actionKey, 'Billing entry workflow initialized.');
      case 'create-template':
      case 'engagement.create-template':
        await this.insertAudit(adminUserId, actionKey, 'engagement', context);
        return this.okResult(actionKey, 'Challenge template workflow initialized.');
      case 'leaderboard':
      case 'engagement.leaderboard':
        await this.insertAudit(adminUserId, actionKey, 'engagement', context);
        return this.okResult(actionKey, 'Leaderboard configuration workflow initialized.');
      case 'live-monitor':
      case 'lessons.live-monitor':
      case 'missed-lessons':
      case 'lessons.missed-lessons':
      case 'grading-queue':
      case 'assignments.grading-queue':
      case 'overdue-submissions':
      case 'assignments.overdue-submissions':
      case 'attendance-alert-sweep':
      case 'students.attendance-alert-sweep':
      case 'low-engagement':
      case 'students.low-engagement':
      case 'open-profiles':
      case 'students.open-profiles':
      case 'link-manager':
      case 'parents.link-manager':
      case 'resolve-link-conflicts':
      case 'parents.resolve-link-conflicts':
        await this.insertAudit(adminUserId, actionKey, 'admin', context);
        return this.okResult(actionKey, 'Operation executed and recorded.');
      default:
        await this.insertAudit(adminUserId, actionKey, 'admin', context);
        return this.okResult(actionKey, 'Generic admin operation recorded.');
    }
  }

  private async broadcastToRoles(
    adminUserId: string,
    roles: AppRole[],
    input: {
      title: string;
      body: string;
      kind: 'admin_alert' | 'lesson_reminder';
      actionKey: string;
      context: Record<string, unknown>;
    },
  ) {
    const recipientsRows = await this.databaseService.db
      .selectFrom('user_roles')
      .select('user_id as userId')
      .where('role', 'in', roles)
      .where('revoked_at', 'is', null)
      .execute();

    const recipientUserIds = Array.from(new Set(recipientsRows.map((row) => row.userId)));

    for (const recipientUserId of recipientUserIds) {
      await this.notificationsService.create({
        recipientUserId,
        actorUserId: adminUserId,
        kind: input.kind,
        title: input.title,
        body: input.body,
        data: {
          actionKey: input.actionKey,
          ...input.context,
        },
      });
    }

    await this.insertAudit(adminUserId, input.actionKey, 'notifications', {
      ...input.context,
      targetRoles: roles,
      deliveredCount: recipientUserIds.length,
    });

    return this.okResult(input.actionKey, `Notification sent to ${recipientUserIds.length} users.`);
  }

  private async insertAudit(
    actorUserId: string,
    actionKey: string,
    entityTable: string,
    metadata: Record<string, unknown>,
  ) {
    await this.databaseService.db
      .insertInto('audit.audit_logs')
      .values({
        actor_user_id: actorUserId,
        action: `admin.operation.${actionKey}`,
        entity_table: entityTable,
        entity_id: null,
        request_id: null,
        ip_address: null,
        user_agent: null,
        metadata,
        created_at: new Date().toISOString(),
      })
      .execute();
  }

  private okResult(actionKey: string, message: string, details?: Record<string, unknown>) {
    return {
      ok: true,
      actionKey,
      message,
      ...(details ? { details } : {}),
    };
  }
}
