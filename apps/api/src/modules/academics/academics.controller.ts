import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  createClassSchema,
  createLessonSchema,
  createAssignmentSchema,
  createQuizSchema,
} from '@edvoura/contracts';

import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard.js';
import { Roles } from '../../common/auth/roles.decorator.js';
import { RolesGuard } from '../../common/auth/roles.guard.js';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe.js';
import type { AuthenticatedRequestUser } from '../../common/auth/authenticated-user.interface.js';
import { AcademicsService } from './academics.service.js';

@ApiTags('academics')
@ApiBearerAuth()
@Controller('academics')
@UseGuards(SupabaseJwtGuard, RolesGuard)
export class AcademicsController {
  constructor(private readonly academicsService: AcademicsService) {}

  // ─── Classes ─────────────────────────────────────────────────────────────

  @Post('classes')
  @HttpCode(HttpStatus.CREATED)
  @Roles('tutor', 'admin', 'super_admin')
  @ApiOperation({ summary: 'Create a new class' })
  async createClass(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body(new ZodValidationPipe(createClassSchema)) body: unknown,
  ) {
    return this.academicsService.createClass(user.userId, createClassSchema.parse(body));
  }

  @Get('classes')
  @ApiOperation({ summary: 'List classes (role-scoped)' })
  @ApiQuery({ name: 'role', required: false, description: 'Override perspective (admin only)' })
  async listClasses(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query('role') roleOverride?: string,
  ) {
    return this.academicsService.listClasses({ userId: user.userId, role: roleOverride ?? 'admin' });
  }

  // ─── Lessons ─────────────────────────────────────────────────────────────

  @Post('classes/:classId/lessons')
  @HttpCode(HttpStatus.CREATED)
  @Roles('tutor', 'admin', 'super_admin')
  @ApiOperation({ summary: 'Create a lesson under a class' })
  async createLesson(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('classId') classId: string,
    @Body(new ZodValidationPipe(createLessonSchema)) body: unknown,
  ) {
    return this.academicsService.createLesson(classId, user.userId, createLessonSchema.parse(body));
  }

  @Get('classes/:classId/lessons')
  @ApiOperation({ summary: 'List lessons for a class' })
  async listLessons(@Param('classId') classId: string) {
    return this.academicsService.listLessons(classId);
  }

  // ─── Assignments ──────────────────────────────────────────────────────────

  @Post('classes/:classId/assignments')
  @HttpCode(HttpStatus.CREATED)
  @Roles('tutor', 'admin', 'super_admin')
  @ApiOperation({ summary: 'Create an assignment under a class' })
  async createAssignment(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('classId') classId: string,
    @Body(new ZodValidationPipe(createAssignmentSchema)) body: unknown,
  ) {
    return this.academicsService.createAssignment(classId, user.userId, createAssignmentSchema.parse(body));
  }

  // ─── Quizzes ──────────────────────────────────────────────────────────────

  @Post('classes/:classId/quizzes')
  @HttpCode(HttpStatus.CREATED)
  @Roles('tutor', 'admin', 'super_admin')
  @ApiOperation({ summary: 'Create a quiz under a class' })
  async createQuiz(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('classId') classId: string,
    @Body(new ZodValidationPipe(createQuizSchema)) body: unknown,
  ) {
    return this.academicsService.createQuiz(classId, user.userId, createQuizSchema.parse(body));
  }
}
