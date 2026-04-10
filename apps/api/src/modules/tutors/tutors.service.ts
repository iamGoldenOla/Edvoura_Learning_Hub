import {
  completeTutorProfileSchema,
  type CompleteTutorProfileDto,
} from '@edvoura/contracts';
import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../common/database/database.service.js';
import { ApplicationError } from '../../common/errors/application-error.js';

@Injectable()
export class TutorsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async completeProfile(userId: string, dto: CompleteTutorProfileDto): Promise<void> {
    const parsed = completeTutorProfileSchema.parse(dto);

    await this.databaseService.db
      .updateTable('profiles')
      .set({
        full_name: parsed.fullName,
        phone_number: parsed.phoneNumber ?? null,
        timezone: parsed.timezone,
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', userId)
      .execute();

    await this.databaseService.db
      .insertInto('tutor_profiles')
      .values({
        user_id: userId,
        approval_status: 'pending',
        headline: parsed.headline ?? null,
        bio: parsed.bio ?? null,
        expertise_summary: parsed.expertiseSummary ?? null,
        availability_notes: parsed.availabilityNotes ?? null,
        approved_by_user_id: null,
        approved_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .onConflict((oc) =>
        oc.column('user_id').doUpdateSet({
          headline: parsed.headline ?? null,
          bio: parsed.bio ?? null,
          expertise_summary: parsed.expertiseSummary ?? null,
          availability_notes: parsed.availabilityNotes ?? null,
          updated_at: new Date().toISOString(),
        }),
      )
      .execute();

    await this.databaseService.db
      .insertInto('user_roles')
      .values({
        user_id: userId,
        role: 'tutor',
        granted_by_user_id: userId,
        granted_at: new Date().toISOString(),
        revoked_at: null,
      })
      .onConflict((oc) => oc.columns(['user_id', 'role']).doNothing())
      .execute();
  }

  async getTutorContext(userId: string) {
    const profile = await this.databaseService.db
      .selectFrom('profiles as p')
      .innerJoin('tutor_profiles as tp', 'tp.user_id', 'p.id')
      .select([
        'p.id as userId',
        'p.email',
        'p.full_name as fullName',
        'p.avatar_path as avatarPath',
        'p.phone_number as phoneNumber',
        'p.timezone',
        'tp.approval_status as approvalStatus',
        'tp.headline',
        'tp.bio',
        'tp.expertise_summary as expertiseSummary',
        'tp.availability_notes as availabilityNotes',
        'tp.approved_at as approvedAt',
      ])
      .where('p.id', '=', userId)
      .executeTakeFirst();

    if (!profile) {
      throw new ApplicationError(404, 'tutor_profile_not_found', 'Tutor profile not found. Complete onboarding first.');
    }

    return profile;
  }

  async listPending() {
    return this.databaseService.db
      .selectFrom('profiles as p')
      .innerJoin('tutor_profiles as tp', 'tp.user_id', 'p.id')
      .select([
        'p.id as userId',
        'p.email',
        'p.full_name as fullName',
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
}
