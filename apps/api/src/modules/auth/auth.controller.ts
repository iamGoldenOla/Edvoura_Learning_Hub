import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard.js';
import type { AuthenticatedRequestUser } from '../../common/auth/authenticated-user.interface.js';
import { UserContextService } from '../users/user-context.service.js';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly userContextService: UserContextService) {}

  @Get('me')
  @UseGuards(SupabaseJwtGuard)
  getMe(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.userContextService.getCurrentUser(user.userId);
  }
}
