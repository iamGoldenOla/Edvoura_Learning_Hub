import { currentUserSchema, type CurrentUser } from '@edvoura/contracts';
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

    return currentUserSchema.parse({
      userId: profile.id,
      email: profile.email,
      roles: roles.map((entry) => entry.role),
      profile: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        avatarPath: profile.avatar_path,
      },
    });
  }
}
