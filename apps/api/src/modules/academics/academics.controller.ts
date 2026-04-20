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
  createAssignmentSchema,
  createClassSchema,
  createLessonSchema,
  createQuizSchema,
  recordAttendanceSchema,
} from '@edvoura/contracts';

import type { AuthenticatedRequestUser } from '../../common/auth/authenticated-user.interface.js';
import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { Roles } from '../../common/auth/roles.decorator.js';
import { RolesGuard } from '../../common/auth/roles.guard.js';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard.js';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe.js';
import { AcademicsService } from './academics.service.js';
import { LiveSessionService } from './live-session.service.js';

@ApiTags('academics')
@ApiBearerAuth()
@Controller('academics')
@UseGuards(SupabaseJwtGuard, RolesGuard)
export class AcademicsController {
  constructor(
    private readonly academicsService: AcademicsService,
    private readonly liveSessionService: LiveSessionService,
  ) {}

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

  @Get('student/dashboard')
  @Roles('student')
  @ApiOperation({ summary: 'Get the current student dashboard overview' })
  async getStudentDashboard(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.academicsService.getStudentDashboard(user.userId);
  }

  @Post('classes/:classId/lessons')
  @HttpCode(HttpStatus.CREATED)
  @Roles('tutor', 'admin', 'super_admin')
  @ApiOperation({ summary: 'Create a lesson under a class (provisions live session)' })
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

  @Get('lessons/:lessonId/session')
  @ApiOperation({ summary: 'Get live session details for a lesson' })
  async getLessonSession(@Param('lessonId') lessonId: string) {
    return this.liveSessionService.getSessionForLesson(lessonId);
  }

  @Post('lessons/:lessonId/launch')
  @HttpCode(HttpStatus.OK)
  @Roles('tutor', 'admin', 'super_admin')
  @ApiOperation({ summary: 'Launch lesson live session and notify student/parent/admin audiences' })
  async launchLesson(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('lessonId') lessonId: string,
  ) {
    return this.academicsService.launchLesson(lessonId, user.userId);
  }

  @Post('classes/:classId/assignments')
  @HttpCode(HttpStatus.CREATED)
  @Roles('tutor', 'admin', 'super_admin')
  @ApiOperation({ summary: 'Create an assignment under a class' })
  async createAssignment(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('classId') classId: string,
    @Body(new ZodValidationPipe(createAssignmentSchema)) body: unknown,
  ) {
    return this.academicsService.createAssignment(
      classId,
      user.userId,
      createAssignmentSchema.parse(body),
    );
  }

  @Get('classes/:classId/assignments')
  @ApiOperation({ summary: 'List assignments for a class' })
  async listAssignments(@Param('classId') classId: string) {
    return this.academicsService.listAssignments(classId);
  }

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

  @Post('lessons/:lessonId/attendance')
  @HttpCode(HttpStatus.OK)
  @Roles('tutor', 'admin', 'super_admin')
  @ApiOperation({ summary: 'Record attendance for a lesson' })
  async recordAttendance(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('lessonId') lessonId: string,
    @Body(new ZodValidationPipe(recordAttendanceSchema)) body: unknown,
  ) {
    return this.academicsService.recordAttendance(
      lessonId,
      user.userId,
      recordAttendanceSchema.parse(body),
    );
  }

  @Get('lessons/:lessonId/attendance')
  @ApiOperation({ summary: 'Get attendance records for a lesson' })
  async getAttendance(@Param('lessonId') lessonId: string) {
    return this.academicsService.getAttendance(lessonId);
  }
}
