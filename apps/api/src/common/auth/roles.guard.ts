import {
  ForbiddenException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AppRole } from '@edvoura/contracts';

import type { AuthenticatedRequestUser } from './authenticated-user.interface.js';
import { ROLES_KEY } from './roles.decorator.js';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly databaseService: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles =
      this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedRequestUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Missing authenticated user context.');
    }

    const roles = await this.databaseService.db
      .selectFrom('user_roles')
      .select('role')
      .where('user_id', '=', user.userId)
      .where('revoked_at', 'is', null)
      .execute();

    const roleSet = new Set(roles.map((entry) => entry.role));

    if (!requiredRoles.some((role) => roleSet.has(role))) {
      throw new ForbiddenException('Insufficient role for this resource.');
    }

    return true;
  }
}
