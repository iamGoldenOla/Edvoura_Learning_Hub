import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { completeTutorProfileSchema } from '@edvoura/contracts';

import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard.js';
import { Roles } from '../../common/auth/roles.decorator.js';
import { RolesGuard } from '../../common/auth/roles.guard.js';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe.js';
import type { AuthenticatedRequestUser } from '../../common/auth/authenticated-user.interface.js';
import { TutorsService } from './tutors.service.js';

@ApiTags('tutors')
@ApiBearerAuth()
@Controller('tutors')
@UseGuards(SupabaseJwtGuard, RolesGuard)
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  @Patch('me/profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Complete or update tutor onboarding profile' })
  async completeProfile(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body(new ZodValidationPipe(completeTutorProfileSchema)) body: unknown,
  ): Promise<void> {
    await this.tutorsService.completeProfile(user.userId, completeTutorProfileSchema.parse(body));
  }

  @Get('me')
  @Roles('tutor')
  @ApiOperation({ summary: 'Get current tutor profile and approval status' })
  async getMe(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.tutorsService.getTutorContext(user.userId);
  }
}
