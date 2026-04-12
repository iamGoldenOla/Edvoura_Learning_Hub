import { currentUserSchema, type AppRole, type CurrentUser } from '@edvoura/contracts';
import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../common/database/database.service.js';
import { ApplicationError } from '../../common/errors/application-error.js';

@Injectable()
export class UserContextService {
  constructor(private readonly databaseService: DatabaseService) {}

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

    const shouldBootstrapStudent =
      process.env.NODE_ENV !== 'production' &&
      !learnerProfile &&
      (roles.length === 0 || roles.some((entry) => entry.role === 'student'));

    if (shouldBootstrapStudent) {
      await this.bootstrapDevStudentProfile(userId);
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

  private async bootstrapDevStudentProfile(userId: string) {
    const gradeLevel = await this.databaseService.db
      .selectFrom('grade_levels')
      .select(['id', 'band_id'])
      .where('code', '=', 'grade_4')
      .executeTakeFirst();

    if (!gradeLevel) {
      return;
    }

    await this.databaseService.db.transaction().execute(async (trx) => {
      await trx
        .insertInto('student_profiles')
        .values({
          user_id: userId,
          grade_level_id: gradeLevel.id,
          learner_band_id: gradeLevel.band_id,
          school_name: 'Edvoura Demo Academy',
          academic_goal_notes: 'Build steady momentum with weekly live sessions.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .onConflict((oc) =>
          oc.column('user_id').doUpdateSet({
            grade_level_id: gradeLevel.id,
            learner_band_id: gradeLevel.band_id,
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
          grade_band_id: gradeLevel.band_id,
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
}
