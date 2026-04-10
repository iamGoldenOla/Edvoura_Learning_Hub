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
import { completeStudentProfileSchema } from '@edvoura/contracts';

import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard.js';
import { Roles } from '../../common/auth/roles.decorator.js';
import { RolesGuard } from '../../common/auth/roles.guard.js';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe.js';
import type { AuthenticatedRequestUser } from '../../common/auth/authenticated-user.interface.js';
import { StudentsService } from './students.service.js';

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
@UseGuards(SupabaseJwtGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Patch('me/profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Complete or update student onboarding profile' })
  async completeProfile(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body(new ZodValidationPipe(completeStudentProfileSchema)) body: unknown,
  ): Promise<void> {
    await this.studentsService.completeProfile(user.userId, completeStudentProfileSchema.parse(body));
  }

  @Get('me')
  @Roles('student')
  @ApiOperation({ summary: 'Get current student context' })
  async getMe(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.studentsService.getStudentContext(user.userId);
  }
}
