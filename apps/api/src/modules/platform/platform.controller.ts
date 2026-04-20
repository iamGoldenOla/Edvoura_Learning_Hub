import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  listDashboardUiActionsQuerySchema,
  recordDashboardUiActionSchema,
} from '@edvoura/contracts';

import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import type { AuthenticatedRequestUser } from '../../common/auth/authenticated-user.interface.js';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard.js';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe.js';
import { PlatformService } from './platform.service.js';

@ApiTags('platform')
@Controller()
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Get('health')
  getHealth() {
    return this.platformService.getHealth();
  }

  @Get('ready')
  getReady() {
    return this.platformService.getReady();
  }

  @Post('platform/ui-actions')
  @UseGuards(SupabaseJwtGuard)
  recordUiAction(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body(new ZodValidationPipe(recordDashboardUiActionSchema)) body: unknown,
  ) {
    return this.platformService.recordUiAction(user.userId, recordDashboardUiActionSchema.parse(body));
  }

  @Get('platform/ui-actions')
  @UseGuards(SupabaseJwtGuard)
  listUiActions(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query(new ZodValidationPipe(listDashboardUiActionsQuerySchema)) query: unknown,
  ) {
    return this.platformService.listUiActions(user.userId, listDashboardUiActionsQuerySchema.parse(query));
  }
}
