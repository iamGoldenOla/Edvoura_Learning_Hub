import { SetMetadata } from '@nestjs/common';
import type { AppRole } from '@edvoura/contracts';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
