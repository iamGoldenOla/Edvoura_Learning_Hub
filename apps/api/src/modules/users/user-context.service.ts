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

    const roles = await this.databaseService.db
      .selectFrom('user_roles')
      .select('role')
      .where('user_id', '=', userId)
      .where('revoked_at', 'is', null)
      .execute();

    const learnerProfile = await this.databaseService.db
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
}
