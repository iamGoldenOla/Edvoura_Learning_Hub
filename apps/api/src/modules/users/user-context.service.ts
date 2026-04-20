import { currentUserSchema, type AppRole, type CurrentUser } from '@edvoura/contracts';
import { Injectable } from '@nestjs/common';
import type { Kysely } from 'kysely';
import { Logger } from '@nestjs/common';

import { DatabaseService } from '../../common/database/database.service.js';
import { ApplicationError } from '../../common/errors/application-error.js';
import { SupabaseService } from '../../common/supabase/supabase.service.js';

@Injectable()
export class UserContextService {
  private readonly logger = new Logger(UserContextService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async getCurrentUser(userId: string): Promise<CurrentUser> {
    const profile = await this.databaseService.db
      .selectFrom('profiles')
      .select(['id', 'email', 'full_name', 'avatar_path'])
      .where('id', '=', userId)
      .executeTakeFirst();

    if (!profile) {
      throw new ApplicationError(404, 'profile_not_found', 'User profile was not found.');
    }

    let roles = await this.databaseService.db
      .selectFrom('user_roles')
      .select('role')
      .where('user_id', '=', userId)
      .where('revoked_at', 'is', null)
      .execute();

    let learnerProfile = await this.databaseService.db
      .selectFrom('student_profiles as sp')
      .innerJoin('grade_levels as gl', 'gl.id', 'sp.grade_level_id')
      .innerJoin('grade_bands as gb', 'gb.id', 'sp.learner_band_id')
      .select([
        'gl.code as gradeLevelCode',
        'gl.display_name as gradeLevelName',
        'gb.code as gradeBandCode',
        'gb.name as gradeBandName',
        'sp.school_name as schoolName',
        'sp.academic_goal_notes as academicGoalNotes',
      ])
      .where('sp.user_id', '=', userId)
      .executeTakeFirst();

    const authMetadata = await this.getAuthUserMetadata(userId);
    const requestedRole = this.getRequestedRoleFromMetadata(authMetadata);
    const shouldBootstrapAdminRole =
      process.env.NODE_ENV !== 'production' &&
      (requestedRole === 'admin' || requestedRole === 'super_admin') &&
      !roles.some((entry) => entry.role === requestedRole);

    if (shouldBootstrapAdminRole) {
      await this.bootstrapDevAdminRole(userId, requestedRole);
      roles = await this.databaseService.db
        .selectFrom('user_roles')
        .select('role')
        .where('user_id', '=', userId)
        .where('revoked_at', 'is', null)
        .execute();
    }

    const parentProfile = await this.databaseService.db
      .selectFrom('parent_profiles')
      .select('user_id')
      .where('user_id', '=', userId)
      .executeTakeFirst();

    const shouldBootstrapParent =
      process.env.NODE_ENV !== 'production' &&
      !parentProfile &&
      (roles.some((entry) => entry.role === 'parent') || requestedRole === 'parent');

    if (shouldBootstrapParent) {
      await this.bootstrapDevParentProfile(userId, authMetadata);
      roles = await this.databaseService.db
        .selectFrom('user_roles')
        .select('role')
        .where('user_id', '=', userId)
        .where('revoked_at', 'is', null)
        .execute();
    }

    const tutorProfile = await this.databaseService.db
      .selectFrom('tutor_profiles')
      .select('user_id')
      .where('user_id', '=', userId)
      .executeTakeFirst();

    const shouldBootstrapTutor =
      process.env.NODE_ENV !== 'production' &&
      !tutorProfile &&
      (roles.some((entry) => entry.role === 'tutor') || requestedRole === 'tutor');

    if (shouldBootstrapTutor) {
      await this.bootstrapDevTutorProfile(userId, authMetadata);
      roles = await this.databaseService.db
        .selectFrom('user_roles')
        .select('role')
        .where('user_id', '=', userId)
        .where('revoked_at', 'is', null)
        .execute();
    }

    const shouldBootstrapStudent =
      process.env.NODE_ENV !== 'production' &&
      !learnerProfile &&
      (roles.some((entry) => entry.role === 'student') ||
        (roles.length === 0 && (requestedRole === 'student' || !requestedRole)));

    if (shouldBootstrapStudent) {
      await this.bootstrapDevStudentProfile(userId, authMetadata);
      roles = await this.databaseService.db
        .selectFrom('user_roles')
        .select('role')
        .where('user_id', '=', userId)
        .where('revoked_at', 'is', null)
        .execute();

      learnerProfile = await this.databaseService.db
        .selectFrom('student_profiles as sp')
        .innerJoin('grade_levels as gl', 'gl.id', 'sp.grade_level_id')
        .innerJoin('grade_bands as gb', 'gb.id', 'sp.learner_band_id')
        .select([
          'gl.code as gradeLevelCode',
          'gl.display_name as gradeLevelName',
          'gb.code as gradeBandCode',
          'gb.name as gradeBandName',
          'sp.school_name as schoolName',
          'sp.academic_goal_notes as academicGoalNotes',
        ])
        .where('sp.user_id', '=', userId)
        .executeTakeFirst();
    }

    const orderedRoles = roles.map((entry) => entry.role as AppRole);
    const rolePrecedence: AppRole[] = ['super_admin', 'admin', 'tutor', 'parent', 'student'];
    const primaryRole = rolePrecedence.find((role) => orderedRoles.includes(role)) ?? 'student';

    return currentUserSchema.parse({
      userId: profile.id,
      email: profile.email,
      roles: orderedRoles,
      primaryRole,
      profile: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        avatarPath: profile.avatar_path,
      },
      learnerProfile: learnerProfile ?? null,
    });
  }

  private async bootstrapDevTutorProfile(
    userId: string,
    metadata?: Record<string, unknown> | null,
  ) {
    const headline =
      typeof metadata?.tutor_headline === 'string' && metadata.tutor_headline.trim().length > 0
        ? metadata.tutor_headline.trim()
        : 'Experienced Tutor';
    const bio =
      typeof metadata?.tutor_bio === 'string' && metadata.tutor_bio.trim().length > 0
        ? metadata.tutor_bio.trim()
        : 'Focused on structured lessons, measurable outcomes, and consistent learner progress.';
    const expertiseSummary =
      typeof metadata?.tutor_expertise === 'string' && metadata.tutor_expertise.trim().length > 0
        ? metadata.tutor_expertise.trim()
        : 'Mathematics, Science, and Study Skills';
    const availabilityNotes =
      typeof metadata?.tutor_availability === 'string' && metadata.tutor_availability.trim().length > 0
        ? metadata.tutor_availability.trim()
        : 'Weekdays and weekends available by schedule.';

    const now = new Date().toISOString();

    await this.databaseService.db.transaction().execute(async (trx) => {
      await trx
        .insertInto('tutor_profiles')
        .values({
          user_id: userId,
          approval_status: 'approved',
          headline,
          bio,
          expertise_summary: expertiseSummary,
          availability_notes: availabilityNotes,
          approved_by_user_id: userId,
          approved_at: now,
          created_at: now,
          updated_at: now,
        })
        .onConflict((oc) =>
          oc.column('user_id').doUpdateSet({
            headline,
            bio,
            expertise_summary: expertiseSummary,
            availability_notes: availabilityNotes,
            approval_status: 'approved',
            approved_by_user_id: userId,
            approved_at: now,
            updated_at: now,
          }),
        )
        .execute();

      await trx
        .insertInto('user_roles')
        .values({
          user_id: userId,
          role: 'tutor',
          granted_by_user_id: userId,
          granted_at: now,
          revoked_at: null,
        })
        .onConflict((oc) => oc.columns(['user_id', 'role']).doNothing())
        .execute();
    });
  }

  private async bootstrapDevAdminRole(userId: string, role: 'admin' | 'super_admin') {
    const now = new Date().toISOString();
    await this.databaseService.db
      .insertInto('user_roles')
      .values({
        user_id: userId,
        role,
        granted_by_user_id: userId,
        granted_at: now,
        revoked_at: null,
      })
      .onConflict((oc) => oc.columns(['user_id', 'role']).doNothing())
      .execute();
  }

  private async bootstrapDevStudentProfile(
    userId: string,
    metadata?: Record<string, unknown> | null,
  ) {
    const preferredGradeLevelCode = this.getPreferredGradeLevelCodeFromMetadata(metadata ?? null);
    const preferredGradeNumber = preferredGradeLevelCode
      ? Number.parseInt(preferredGradeLevelCode.replace('grade_', ''), 10)
      : NaN;
    const gradeLevel = await this.databaseService.db
      .selectFrom('grade_levels')
      .select(['id', 'band_id'])
      .where('code', '=', preferredGradeLevelCode ?? 'grade_4')
      .executeTakeFirst();

    if (!gradeLevel) {
      return;
    }

    const gradeBandId = gradeLevel.band_id;
    if (!gradeBandId) {
      return;
    }

    await this.databaseService.db.transaction().execute(async (trx) => {
      await trx
        .insertInto('student_profiles')
        .values({
          user_id: userId,
          grade_level_id: gradeLevel.id,
          learner_band_id: gradeBandId,
          school_name: 'Edvoura Demo Academy',
          academic_goal_notes:
            Number.isFinite(preferredGradeNumber) && preferredGradeNumber <= 3
              ? 'Build confidence with guided lessons and playful routines.'
              : Number.isFinite(preferredGradeNumber) && preferredGradeNumber <= 6
                ? 'Grow consistency with weekly goals, challenges, and timely submissions.'
                : 'Build strong independent study habits and exam readiness.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .onConflict((oc) =>
          oc.column('user_id').doUpdateSet({
            grade_level_id: gradeLevel.id,
            learner_band_id: gradeBandId,
            updated_at: new Date().toISOString(),
          }),
        )
        .execute();

      await trx
        .insertInto('user_roles')
        .values({
          user_id: userId,
          role: 'student',
          granted_by_user_id: userId,
          granted_at: new Date().toISOString(),
          revoked_at: null,
        })
        .onConflict((oc) => oc.columns(['user_id', 'role']).doNothing())
        .execute();

      const enrollment = await trx
        .selectFrom('class_enrollments')
        .select('id')
        .where('student_user_id', '=', userId)
        .executeTakeFirst();

      if (enrollment) {
        return;
      }

      const subject = await trx
        .selectFrom('subjects')
        .select(['id', 'name'])
        .where('slug', '=', 'mathematics')
        .executeTakeFirst();

      if (!subject) {
        return;
      }

      const now = new Date();
      const classRow = await trx
        .insertInto('classes')
        .values({
          subject_id: subject.id,
          grade_band_id: gradeBandId,
          title: 'Mathematics Foundations',
          description: 'Core numeracy, problem solving, and weekly practice.',
          status: 'active',
          primary_tutor_user_id: null,
          max_students: 20,
          starts_on: now.toISOString().slice(0, 10),
          ends_on: null,
          created_by_user_id: userId,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .returning(['id'])
        .executeTakeFirstOrThrow();
      if (!classRow.id) {
        return;
      }

      await trx
        .insertInto('class_enrollments')
        .values({
          class_id: classRow.id,
          student_user_id: userId,
          status: 'active',
          enrolled_at: now.toISOString(),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .onConflict((oc) => oc.columns(['class_id', 'student_user_id']).doNothing())
        .execute();

      const lessonStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const lessonEnd = new Date(lessonStart.getTime() + 60 * 60 * 1000);

      const lesson = await trx
        .insertInto('lessons')
        .values({
          class_id: classRow.id,
          tutor_user_id: null,
          title: 'Live Review Session',
          description: 'A guided recap with practice questions.',
          provider: 'google_meet',
          status: 'scheduled',
          scheduled_start_at: lessonStart.toISOString(),
          scheduled_end_at: lessonEnd.toISOString(),
          created_by_user_id: userId,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .returning(['id'])
        .executeTakeFirstOrThrow();
      if (!lesson.id) {
        return;
      }

      await trx
        .insertInto('private.lesson_live_sessions')
        .values({
          lesson_id: lesson.id,
          provider: 'google_meet',
          external_meeting_id: 'demo-session',
          join_url: 'https://meet.google.com/abc-defg-hij',
          host_url: null,
          passcode: null,
          raw_payload: {},
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .onConflict((oc) => oc.column('lesson_id').doNothing())
        .execute();

      await trx
        .insertInto('assignments')
        .values({
          class_id: classRow.id,
          lesson_id: lesson.id,
          title: 'Weekly Practice Set',
          instructions: 'Complete 10 practice problems before the next session.',
          status: 'published',
          due_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          points_possible: '100',
          created_by_user_id: userId,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .execute();

      await trx
        .insertInto('progress_snapshots')
        .values({
          student_user_id: userId,
          subject_id: subject.id,
          snapshot_date: now.toISOString().slice(0, 10),
          attendance_rate: '96',
          assignment_completion_rate: '88',
          average_score: '92',
          mastery_notes: 'Strong week. Keep the momentum going.',
          created_at: now.toISOString(),
        })
        .execute();
    });
  }

  private async bootstrapDevParentProfile(
    parentUserId: string,
    metadata: Record<string, unknown> | null,
  ) {
    await this.databaseService.db.transaction().execute(async (trx) => {
      await trx
        .insertInto('parent_profiles')
        .values({
          user_id: parentUserId,
          preferred_contact_method: 'email',
          paystack_customer_code: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .onConflict((oc) =>
          oc.column('user_id').doUpdateSet({
            updated_at: new Date().toISOString(),
          }),
        )
        .execute();

      await trx
        .insertInto('user_roles')
        .values({
          user_id: parentUserId,
          role: 'parent',
          granted_by_user_id: parentUserId,
          granted_at: new Date().toISOString(),
          revoked_at: null,
        })
        .onConflict((oc) => oc.columns(['user_id', 'role']).doNothing())
        .execute();
    });

    if (!metadata) {
      return;
    }

    const existingChildLink = await this.databaseService.db
      .selectFrom('parent_student_links')
      .select('id')
      .where('parent_user_id', '=', parentUserId)
      .where('is_active', '=', true)
      .executeTakeFirst();

    if (existingChildLink) {
      return;
    }

    const childrenFromMetadata = this.getParentChildrenFromMetadata(metadata);
    const existingChildEmails = this.getParentExistingChildEmailsFromMetadata(metadata);
    if (childrenFromMetadata.length === 0) {
      if (existingChildEmails.length === 0) {
        return;
      }
    }

    for (const child of childrenFromMetadata) {
      try {
        await this.bootstrapSingleParentChild(parentUserId, child);
      } catch (error) {
        this.logger.warn(
          `Parent child auto-bootstrap failed for ${parentUserId}: ${
            error instanceof Error ? error.message : 'unknown error'
          }`,
        );
      }
    }

    for (const childEmail of existingChildEmails) {
      try {
        await this.bootstrapParentChildLinkByEmail(parentUserId, childEmail);
      } catch (error) {
        this.logger.warn(
          `Parent child email-link bootstrap failed for ${parentUserId}: ${
            error instanceof Error ? error.message : 'unknown error'
          }`,
        );
      }
    }
  }

  private async bootstrapSingleParentChild(
    parentUserId: string,
    child: { fullName: string; gradeLevelCode: string; email: string | null },
  ) {
    const gradeLevel = await this.databaseService.db
      .selectFrom('grade_levels')
      .select(['id', 'band_id'])
      .where('code', '=', child.gradeLevelCode)
      .executeTakeFirst();

    if (!gradeLevel) {
      return;
    }

    const existingByEmail =
      child.email
        ? await this.databaseService.db
            .selectFrom('profiles')
            .select('id')
            .where('email', '=', child.email)
            .executeTakeFirst()
        : null;

    let childUserId = existingByEmail?.id ?? null;

    if (!childUserId) {
      const generatedEmail =
        child.email ?? `child-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@edvoura.internal`;
      const childCreate = await this.supabaseService.adminClient.auth.admin.createUser({
        email: generatedEmail,
        user_metadata: { full_name: child.fullName },
        email_confirm: true,
      });

      if (childCreate.error || !childCreate.data.user) {
        throw new Error(childCreate.error?.message ?? 'Unable to create child account');
      }

      childUserId = childCreate.data.user.id;
    }

    const now = new Date().toISOString();

    await this.databaseService.db.transaction().execute(async (trx) => {
      await trx
        .insertInto('student_profiles')
        .values({
          user_id: childUserId!,
          grade_level_id: gradeLevel.id,
          learner_band_id: gradeLevel.band_id,
          school_name: null,
          academic_goal_notes: 'Auto-created from parent onboarding metadata.',
          created_at: now,
          updated_at: now,
        })
        .onConflict((oc) => oc.column('user_id').doNothing())
        .execute();

      await trx
        .insertInto('user_roles')
        .values({
          user_id: childUserId!,
          role: 'student',
          granted_by_user_id: parentUserId,
          granted_at: now,
          revoked_at: null,
        })
        .onConflict((oc) => oc.columns(['user_id', 'role']).doNothing())
        .execute();

      const existingLink = await trx
        .selectFrom('parent_student_links')
        .select('id')
        .where('parent_user_id', '=', parentUserId)
        .where('student_user_id', '=', childUserId!)
        .executeTakeFirst();

      if (existingLink?.id) {
        await trx
          .updateTable('parent_student_links')
          .set({
            relationship: 'guardian',
            is_primary_guardian: false,
            can_view_billing: true,
            can_view_progress: true,
            is_active: true,
            updated_at: now,
          })
          .where('id', '=', existingLink.id)
          .execute();
        return;
      }

      await trx
        .insertInto('parent_student_links')
        .values({
          parent_user_id: parentUserId,
          student_user_id: childUserId!,
          relationship: 'guardian',
          is_primary_guardian: false,
          can_view_billing: true,
          can_view_progress: true,
          is_active: true,
          created_at: now,
          updated_at: now,
        })
        .execute();
    });
  }

  private async bootstrapParentChildLinkByEmail(parentUserId: string, childEmail: string) {
    const child = await this.databaseService.db
      .selectFrom('profiles as p')
      .leftJoin('student_profiles as sp', 'sp.user_id', 'p.id')
      .select(['p.id as userId', 'sp.user_id as studentProfileUserId'])
      .where('p.email', '=', childEmail)
      .executeTakeFirst();

    if (!child?.userId || !child.studentProfileUserId) {
      return;
    }

    await this.databaseService.db.transaction().execute(async (trx) => {
      const existingLink = await trx
        .selectFrom('parent_student_links')
        .select('id')
        .where('parent_user_id', '=', parentUserId)
        .where('student_user_id', '=', child.userId)
        .executeTakeFirst();

      if (existingLink?.id) {
        await trx
          .updateTable('parent_student_links')
          .set({
            relationship: 'guardian',
            is_primary_guardian: false,
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
          student_user_id: child.userId,
          relationship: 'guardian',
          is_primary_guardian: false,
          can_view_billing: true,
          can_view_progress: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .execute();
    });
  }

  private async getAuthUserMetadata(userId: string): Promise<Record<string, unknown> | null> {
    type AuthUsersDatabase = {
      'auth.users': {
        id: string;
        raw_user_meta_data: unknown | null;
      };
    };

    const authDb = this.databaseService.db as unknown as Kysely<AuthUsersDatabase>;
    const metadataRow = await authDb
      .selectFrom('auth.users')
      .select(['raw_user_meta_data'])
      .where('id', '=', userId)
      .executeTakeFirst();

    const metadata = metadataRow?.raw_user_meta_data;
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return null;
    }

    return metadata as Record<string, unknown>;
  }

  private getRequestedRoleFromMetadata(metadata: Record<string, unknown> | null): AppRole | null {
    const value = metadata?.role;
    if (
      value === 'student' ||
      value === 'parent' ||
      value === 'tutor' ||
      value === 'admin' ||
      value === 'super_admin'
    ) {
      return value;
    }
    return null;
  }

  private getPreferredGradeLevelCodeFromMetadata(metadata: Record<string, unknown> | null): string | null {
    if (!metadata) {
      return null;
    }

    const meta = metadata;

    const directCode = meta.grade_level_code;
    if (typeof directCode === 'string' && /^grade_(?:[1-9]|1[0-2])$/.test(directCode)) {
      return directCode;
    }

    const selectedGrade = meta.selected_grade;
    const numericGrade =
      typeof selectedGrade === 'number'
        ? selectedGrade
        : typeof selectedGrade === 'string'
          ? Number.parseInt(selectedGrade, 10)
          : NaN;

    if (Number.isFinite(numericGrade) && numericGrade >= 1 && numericGrade <= 12) {
      return `grade_${numericGrade}`;
    }

    return null;
  }

  private getParentChildGradeLevelCode(metadata: Record<string, unknown> | null): string | null {
    if (!metadata) {
      return null;
    }

    const directCode = metadata.parent_child_grade_level_code;
    if (typeof directCode === 'string' && /^grade_(?:[1-9]|1[0-2])$/.test(directCode)) {
      return directCode;
    }

    const selectedGrade = metadata.parent_child_grade;
    const numericGrade =
      typeof selectedGrade === 'number'
        ? selectedGrade
        : typeof selectedGrade === 'string'
          ? Number.parseInt(selectedGrade, 10)
          : NaN;

    if (Number.isFinite(numericGrade) && numericGrade >= 1 && numericGrade <= 12) {
      return `grade_${numericGrade}`;
    }

    return null;
  }

  private getParentChildrenFromMetadata(
    metadata: Record<string, unknown> | null,
  ): Array<{ fullName: string; gradeLevelCode: string; email: string | null }> {
    if (!metadata) {
      return [];
    }

    const childrenRaw = metadata.parent_children;
    if (Array.isArray(childrenRaw)) {
      const parsed = childrenRaw
        .map((entry) => {
          if (!entry || typeof entry !== 'object') {
            return null;
          }

          const candidate = entry as Record<string, unknown>;
          const fullName = typeof candidate.fullName === 'string' ? candidate.fullName.trim() : '';
          const grade =
            typeof candidate.grade === 'number'
              ? candidate.grade
              : typeof candidate.grade === 'string'
                ? Number.parseInt(candidate.grade, 10)
                : NaN;
          const email = typeof candidate.email === 'string' ? candidate.email.trim().toLowerCase() : '';
          if (!fullName || !Number.isFinite(grade) || grade < 1 || grade > 12) {
            return null;
          }
          return {
            fullName,
            gradeLevelCode: `grade_${grade}`,
            email: email || null,
          };
        })
        .filter((entry): entry is { fullName: string; gradeLevelCode: string; email: string | null } => Boolean(entry));

      if (parsed.length > 0) {
        return parsed.slice(0, 4);
      }
    }

    const singleName =
      typeof metadata.parent_child_name === 'string' ? metadata.parent_child_name.trim() : '';
    const singleGradeCode = this.getParentChildGradeLevelCode(metadata);
    if (!singleName || !singleGradeCode) {
      return [];
    }

    return [{ fullName: singleName, gradeLevelCode: singleGradeCode, email: null }];
  }

  private getParentExistingChildEmailsFromMetadata(metadata: Record<string, unknown> | null): string[] {
    if (!metadata) {
      return [];
    }

    const raw = metadata.parent_existing_child_emails;
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .map((value) => (typeof value === 'string' ? value.trim().toLowerCase() : ''))
      .filter((value) => value.length > 0)
      .slice(0, 4);
  }
}
