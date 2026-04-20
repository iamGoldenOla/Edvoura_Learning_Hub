import {
  dashboardChatChannelSchema,
  listDashboardChatMessagesQuerySchema,
  postDashboardChatMessageSchema,
  publishLiveContentSchema,
  type DashboardChatChannel,
  type ListDashboardChatMessagesQueryDto,
  type PostDashboardChatMessageDto,
  type PublishLiveContentDto,
} from '@edvoura/contracts';
import { Injectable } from '@nestjs/common';

import { ApplicationError } from '../../common/errors/application-error.js';
import { DatabaseService } from '../../common/database/database.service.js';

type RoleName = 'student' | 'parent' | 'tutor';

@Injectable()
export class CommunicationsService {
  constructor(private readonly databaseService: DatabaseService) {}

  private async listActiveRoles(userId: string): Promise<RoleName[]> {
    const rows = await this.databaseService.db
      .selectFrom('user_roles')
      .select('role')
      .where('user_id', '=', userId)
      .where('revoked_at', 'is', null)
      .execute();

    return rows
      .map((row) => row.role)
      .filter((role): role is RoleName => role === 'student' || role === 'parent' || role === 'tutor');
  }

  private async ensureAllowedChannelAccess(userId: string, channelId: DashboardChatChannel): Promise<RoleName> {
    const roles = await this.listActiveRoles(userId);
    if (roles.length === 0) {
      throw new ApplicationError(403, 'role_not_allowed', 'You do not have access to dashboard chat.');
    }

    const allowedByChannel: Record<DashboardChatChannel, RoleName[]> = {
      'tutor-parent': ['tutor', 'parent'],
      'tutor-student-7-12': ['tutor', 'student'],
      'parent-student-7-12': ['parent', 'student'],
    };

    const role = roles.find((candidate) => allowedByChannel[channelId].includes(candidate));
    if (!role) {
      throw new ApplicationError(403, 'channel_not_allowed', 'You cannot access this chat channel.');
    }

    if (role === 'student') {
      const learner = await this.databaseService.db
        .selectFrom('student_profiles as sp')
        .innerJoin('grade_bands as gb', 'gb.id', 'sp.learner_band_id')
        .select('gb.code as bandCode')
        .where('sp.user_id', '=', userId)
        .executeTakeFirst();

      if (!learner || learner.bandCode !== 'grades_7_12') {
        throw new ApplicationError(
          403,
          'student_chat_restricted',
          'Direct chat is enabled for Grade 7-12 students only.',
        );
      }
    }

    return role;
  }

  async publishLiveContent(userId: string, dto: PublishLiveContentDto) {
    const roles = await this.listActiveRoles(userId);
    if (!roles.includes('tutor')) {
      throw new ApplicationError(403, 'role_not_allowed', 'Only tutors can publish live content.');
    }

    const parsed = publishLiveContentSchema.parse(dto);
    const now = new Date().toISOString();

    const row = await this.databaseService.db
      .insertInto('tutor_live_content_posts')
      .values({
        tutor_user_id: userId,
        headline: parsed.headline,
        agenda: parsed.agenda,
        explanation: parsed.explanation || null,
        class_task: parsed.classTask,
        homework: parsed.homework || null,
        resource_url: parsed.resourceUrl || null,
        is_active: true,
        created_at: now,
        updated_at: now,
      })
      .returning([
        'id',
        'headline',
        'agenda',
        'explanation',
        'class_task as classTask',
        'homework',
        'resource_url as resourceUrl',
        'created_at as updatedAt',
      ])
      .executeTakeFirstOrThrow();

    return row;
  }

  async clearMyLiveContent(userId: string): Promise<void> {
    const roles = await this.listActiveRoles(userId);
    if (!roles.includes('tutor')) {
      throw new ApplicationError(403, 'role_not_allowed', 'Only tutors can clear live content.');
    }

    await this.databaseService.db
      .updateTable('tutor_live_content_posts')
      .set({ is_active: false, updated_at: new Date().toISOString() })
      .where('tutor_user_id', '=', userId)
      .where('is_active', '=', true)
      .execute();
  }

  async getCurrentLiveContent() {
    const row = await this.databaseService.db
      .selectFrom('tutor_live_content_posts')
      .select([
        'id',
        'headline',
        'agenda',
        'explanation',
        'class_task as classTask',
        'homework',
        'resource_url as resourceUrl',
        'updated_at as updatedAt',
      ])
      .where('is_active', '=', true)
      .orderBy('updated_at', 'desc')
      .executeTakeFirst();

    return row ?? null;
  }

  async listMessages(userId: string, query: ListDashboardChatMessagesQueryDto) {
    const parsed = listDashboardChatMessagesQuerySchema.parse(query);
    const channelId = dashboardChatChannelSchema.parse(parsed.channelId);
    await this.ensureAllowedChannelAccess(userId, channelId);

    const rows = await this.databaseService.db
      .selectFrom('dashboard_chat_messages')
      .select([
        'id',
        'channel_id as channelId',
        'sender_role as senderRole',
        'sender_name as senderName',
        'text',
        'created_at as createdAt',
      ])
      .where('channel_id', '=', channelId)
      .orderBy('created_at', 'desc')
      .limit(parsed.limit)
      .execute();

    return rows.reverse();
  }

  async postMessage(userId: string, dto: PostDashboardChatMessageDto) {
    const parsed = postDashboardChatMessageSchema.parse(dto);
    const senderRole = await this.ensureAllowedChannelAccess(userId, parsed.channelId);
    const profile = await this.databaseService.db
      .selectFrom('profiles')
      .select(['full_name as fullName', 'email'])
      .where('id', '=', userId)
      .executeTakeFirst();
    const senderName = profile?.fullName?.trim() || profile?.email || 'User';

    const row = await this.databaseService.db
      .insertInto('dashboard_chat_messages')
      .values({
        channel_id: parsed.channelId,
        sender_user_id: userId,
        sender_role: senderRole,
        sender_name: senderName,
        text: parsed.text.trim(),
        created_at: new Date().toISOString(),
      })
      .returning([
        'id',
        'channel_id as channelId',
        'sender_role as senderRole',
        'sender_name as senderName',
        'text',
        'created_at as createdAt',
      ])
      .executeTakeFirstOrThrow();

    return row;
  }
}
