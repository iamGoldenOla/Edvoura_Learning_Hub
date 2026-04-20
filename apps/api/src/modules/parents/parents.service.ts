import {
  completeParentProfileSchema,
  linkExistingChildSchema,
  onboardChildSchema,
  type CompleteParentProfileDto,
  type LinkExistingChildDto,
  type OnboardChildDto,
} from '@edvoura/contracts';
import { Injectable, Logger } from '@nestjs/common';

import { DatabaseService } from '../../common/database/database.service.js';
import { SupabaseService } from '../../common/supabase/supabase.service.js';
import { ApplicationError } from '../../common/errors/application-error.js';
import { BillingService } from '../billing/billing.service.js';

@Injectable()
export class ParentsService {
  private readonly logger = new Logger(ParentsService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly supabaseService: SupabaseService,
    private readonly billingService: BillingService,
  ) {}

  async completeProfile(userId: string, dto: CompleteParentProfileDto): Promise<void> {
    const parsed = completeParentProfileSchema.parse(dto);

    // Update core profile
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

    // Upsert parent_profiles extension
    await this.databaseService.db
      .insertInto('parent_profiles')
      .values({
        user_id: userId,
        preferred_contact_method: parsed.preferredContactMethod ?? null,
        paystack_customer_code: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .onConflict((oc) =>
        oc.column('user_id').doUpdateSet({
          preferred_contact_method: parsed.preferredContactMethod ?? null,
          updated_at: new Date().toISOString(),
        }),
      )
      .execute();

    // Ensure parent role is present
    await this.databaseService.db
      .insertInto('user_roles')
      .values({
        user_id: userId,
        role: 'parent',
        granted_by_user_id: userId,
        granted_at: new Date().toISOString(),
        revoked_at: null,
      })
      .onConflict((oc) => oc.columns(['user_id', 'role']).doNothing())
      .execute();

    // Create Paystack customer (non-blocking — failure does not block profile completion)
    const profile = await this.databaseService.db
      .selectFrom('profiles')
      .select('email')
      .where('id', '=', userId)
      .executeTakeFirst();

    if (profile) {
      const customer = await this.billingService.createPaystackCustomer(
        profile.email,
        parsed.fullName,
        { userId },
      );

      if (customer) {
        await this.databaseService.db
          .updateTable('parent_profiles')
          .set({
            paystack_customer_code: customer.customerCode,
            updated_at: new Date().toISOString(),
          })
          .where('user_id', '=', userId)
          .execute();

        this.logger.log(`Paystack customer ${customer.customerCode} linked to parent ${userId}`);
      }
    }
  }

  async onboardChild(parentUserId: string, dto: OnboardChildDto): Promise<{ studentUserId: string }> {
    const parsed = onboardChildSchema.parse(dto);

    // Verify parent profile exists
    const parentProfile = await this.databaseService.db
      .selectFrom('parent_profiles')
      .select('user_id')
      .where('user_id', '=', parentUserId)
      .executeTakeFirst();

    if (!parentProfile) {
      throw new ApplicationError(
        400,
        'parent_profile_incomplete',
        'Complete your parent profile before adding children.',
      );
    }

    // Resolve grade level
    const gradeLevel = await this.databaseService.db
      .selectFrom('grade_levels')
      .select(['id', 'band_id'])
      .where('code', '=', parsed.gradeLevelCode)
      .executeTakeFirst();

    if (!gradeLevel) {
      throw new ApplicationError(400, 'invalid_grade_level', `Grade level '${parsed.gradeLevelCode}' not found.`);
    }

    // Create child auth user via Supabase Admin API (generates credentials)
    const childEmail =
      parsed.email ??
      `child-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@edvoura.internal`;

    const { data: newUser, error: createError } =
      await this.supabaseService.adminClient.auth.admin.createUser({
        email: childEmail,
        user_metadata: { full_name: parsed.fullName },
        email_confirm: true,
      });

    if (createError || !newUser.user) {
      throw new ApplicationError(500, 'child_creation_failed', 'Failed to create child account.');
    }

    const studentUserId = newUser.user.id;

    // Upsert student profile
    await this.databaseService.db
      .insertInto('student_profiles')
      .values({
        user_id: studentUserId,
        grade_level_id: gradeLevel.id,
        learner_band_id: gradeLevel.band_id,
        school_name: parsed.schoolName ?? null,
        academic_goal_notes: parsed.academicGoalNotes ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .onConflict((oc) => oc.column('user_id').doNothing())
      .execute();

    // Assign student role
    await this.databaseService.db
      .insertInto('user_roles')
      .values({
        user_id: studentUserId,
        role: 'student',
        granted_by_user_id: parentUserId,
        granted_at: new Date().toISOString(),
        revoked_at: null,
      })
      .onConflict((oc) => oc.columns(['user_id', 'role']).doNothing())
      .execute();

    // Link parent to student
    await this.databaseService.db
      .transaction()
      .execute(async (trx) => {
        const existingLink = await trx
          .selectFrom('parent_student_links')
          .select('id')
          .where('parent_user_id', '=', parentUserId)
          .where('student_user_id', '=', studentUserId)
          .executeTakeFirst();

        if (existingLink?.id) {
          await trx
            .updateTable('parent_student_links')
            .set({
              relationship: parsed.relationship,
              is_primary_guardian: parsed.isPrimaryGuardian,
              can_view_billing: true,
              can_view_progress: true,
              is_active: true,
              updated_at: new Date().toISOString(),
            })
            .where('id', '=', existingLink.id)
            .execute();
          return;
        }

        await trx
          .insertInto('parent_student_links')
          .values({
            parent_user_id: parentUserId,
            student_user_id: studentUserId,
            relationship: parsed.relationship,
            is_primary_guardian: parsed.isPrimaryGuardian,
            can_view_billing: true,
            can_view_progress: true,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .execute();
      });

    return { studentUserId };
  }

  async linkExistingChild(parentUserId: string, dto: LinkExistingChildDto): Promise<{ studentUserId: string }> {
    const parsed = linkExistingChildSchema.parse(dto);
    const normalizedEmail = parsed.childEmail.trim().toLowerCase();

    const parentProfile = await this.databaseService.db
      .selectFrom('parent_profiles')
      .select('user_id')
      .where('user_id', '=', parentUserId)
      .executeTakeFirst();

    if (!parentProfile) {
      throw new ApplicationError(
        400,
        'parent_profile_incomplete',
        'Complete your parent profile before linking a child account.',
      );
    }

    const childProfile = await this.databaseService.db
      .selectFrom('profiles as p')
      .leftJoin('student_profiles as sp', 'sp.user_id', 'p.id')
      .select(['p.id as userId', 'sp.user_id as studentProfileUserId'])
      .where('p.email', '=', normalizedEmail)
      .executeTakeFirst();

    if (!childProfile?.userId) {
      throw new ApplicationError(404, 'child_not_found', 'No account found for that child email.');
    }

    if (childProfile.userId === parentUserId) {
      throw new ApplicationError(
        400,
        'cannot_link_self',
        'Use a separate parent account email, then link the child by the child email.',
      );
    }

    if (!childProfile.studentProfileUserId) {
      throw new ApplicationError(
        400,
        'child_not_student',
        'The provided email belongs to an account that is not a student profile.',
      );
    }

    await this.databaseService.db.transaction().execute(async (trx) => {
      const existingLink = await trx
        .selectFrom('parent_student_links')
        .select('id')
        .where('parent_user_id', '=', parentUserId)
        .where('student_user_id', '=', childProfile.userId)
        .executeTakeFirst();

      if (existingLink?.id) {
        await trx
          .updateTable('parent_student_links')
          .set({
            relationship: parsed.relationship,
            is_primary_guardian: parsed.isPrimaryGuardian,
            can_view_billing: true,
            can_view_progress: true,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .where('id', '=', existingLink.id)
          .execute();
        return;
      }

      await trx
        .insertInto('parent_student_links')
        .values({
          parent_user_id: parentUserId,
          student_user_id: childProfile.userId,
          relationship: parsed.relationship,
          is_primary_guardian: parsed.isPrimaryGuardian,
          can_view_billing: true,
          can_view_progress: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .execute();
    });

    return { studentUserId: childProfile.userId };
  }

  async listChildren(parentUserId: string) {
    const links = await this.databaseService.db
      .selectFrom('parent_student_links as psl')
      .innerJoin('profiles as p', 'p.id', 'psl.student_user_id')
      .innerJoin('student_profiles as sp', 'sp.user_id', 'psl.student_user_id')
      .innerJoin('grade_levels as gl', 'gl.id', 'sp.grade_level_id')
      .innerJoin('grade_bands as gb', 'gb.id', 'sp.learner_band_id')
      .select([
        'psl.student_user_id as userId',
        'p.full_name as fullName',
        'p.email',
        'psl.relationship',
        'psl.is_primary_guardian as isPrimaryGuardian',
        'gl.code as gradeLevelCode',
        'gl.display_name as gradeLevelName',
        'gb.code as gradeBandCode',
        'gb.name as gradeBandName',
        'sp.school_name as schoolName',
      ])
      .where('psl.parent_user_id', '=', parentUserId)
      .where('psl.is_active', '=', true)
      .execute();

    return links;
  }
}
