import {
  completeStudentProfileSchema,
  type CompleteStudentProfileDto,
} from '@edvoura/contracts';
import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../common/database/database.service.js';
import { ApplicationError } from '../../common/errors/application-error.js';

@Injectable()
export class StudentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async completeProfile(userId: string, dto: CompleteStudentProfileDto): Promise<void> {
    const parsed = completeStudentProfileSchema.parse(dto);

    const gradeLevel = await this.databaseService.db
      .selectFrom('grade_levels')
      .select(['id', 'band_id'])
      .where('code', '=', parsed.gradeLevelCode)
      .executeTakeFirst();

    if (!gradeLevel) {
      throw new ApplicationError(400, 'invalid_grade_level', `Grade level '${parsed.gradeLevelCode}' not found.`);
    }

    await this.databaseService.db
      .updateTable('profiles')
      .set({ timezone: parsed.timezone, updated_at: new Date().toISOString() })
      .where('id', '=', userId)
      .execute();

    await this.databaseService.db
      .insertInto('student_profiles')
      .values({
        user_id: userId,
        grade_level_id: gradeLevel.id,
        learner_band_id: gradeLevel.band_id,
        school_name: parsed.schoolName ?? null,
        academic_goal_notes: parsed.academicGoalNotes ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .onConflict((oc) =>
        oc.column('user_id').doUpdateSet({
          grade_level_id: gradeLevel.id,
          learner_band_id: gradeLevel.band_id,
          school_name: parsed.schoolName ?? null,
          academic_goal_notes: parsed.academicGoalNotes ?? null,
          updated_at: new Date().toISOString(),
        }),
      )
      .execute();

    await this.databaseService.db
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
  }

  async getStudentContext(userId: string) {
    const profile = await this.databaseService.db
      .selectFrom('profiles as p')
      .innerJoin('student_profiles as sp', 'sp.user_id', 'p.id')
      .innerJoin('grade_levels as gl', 'gl.id', 'sp.grade_level_id')
      .innerJoin('grade_bands as gb', 'gb.id', 'sp.learner_band_id')
      .select([
        'p.id as userId',
        'p.email',
        'p.full_name as fullName',
        'p.avatar_path as avatarPath',
        'p.timezone',
        'gl.code as gradeLevelCode',
        'gl.display_name as gradeLevelName',
        'gb.code as gradeBandCode',
        'gb.name as gradeBandName',
        'sp.school_name as schoolName',
        'sp.academic_goal_notes as academicGoalNotes',
      ])
      .where('p.id', '=', userId)
      .executeTakeFirst();

    if (!profile) {
      throw new ApplicationError(404, 'student_profile_not_found', 'Student profile not found. Complete onboarding first.');
    }

    return profile;
  }
}
