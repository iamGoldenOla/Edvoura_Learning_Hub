import {
  assignRoleSchema,
  approveTutorSchema,
  rejectTutorSchema,
  type AssignRoleDto,
  type ApproveTutorDto,
  type RejectTutorDto,
  type AppRole,
} from '@edvoura/contracts';
import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../common/database/database.service.js';
import { ApplicationError } from '../../common/errors/application-error.js';

@Injectable()
export class AdminService {
  constructor(private readonly databaseService: DatabaseService) {}

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
}
