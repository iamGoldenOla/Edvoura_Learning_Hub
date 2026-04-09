import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { AuthenticatedRequestUser } from './authenticated-user.interface.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedRequestUser | undefined => {
    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedRequestUser }>();
    return request.user;
  },
);
