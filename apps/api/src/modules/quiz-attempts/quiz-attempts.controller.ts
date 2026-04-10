import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { addQuizQuestionsSchema, submitQuizAttemptSchema } from '@edvoura/contracts';

import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard.js';
import { Roles } from '../../common/auth/roles.decorator.js';
import { RolesGuard } from '../../common/auth/roles.guard.js';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe.js';
import type { AuthenticatedRequestUser } from '../../common/auth/authenticated-user.interface.js';
import { QuizAttemptsService } from './quiz-attempts.service.js';

@ApiTags('quiz-attempts')
@ApiBearerAuth()
@Controller('academics')
@UseGuards(SupabaseJwtGuard, RolesGuard)
export class QuizAttemptsController {
  constructor(private readonly quizAttemptsService: QuizAttemptsService) {}

  @Post('quizzes/:quizId/questions')
  @HttpCode(HttpStatus.CREATED)
  @Roles('tutor', 'admin', 'super_admin')
  @ApiOperation({ summary: 'Add questions to a quiz' })
  async addQuestions(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('quizId') quizId: string,
    @Body(new ZodValidationPipe(addQuizQuestionsSchema)) body: unknown,
  ) {
    return this.quizAttemptsService.addQuestions(quizId, user.userId, addQuizQuestionsSchema.parse(body));
  }

  @Get('quizzes/:quizId/questions')
  @ApiOperation({ summary: 'List questions for a quiz' })
  async listQuestions(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('quizId') quizId: string,
  ) {
    // TODO: check user role to decide if answers should be included
    // For now, students do not see correct answers
    return this.quizAttemptsService.listQuestions(quizId, false);
  }

  @Post('quizzes/:quizId/attempts')
  @HttpCode(HttpStatus.CREATED)
  @Roles('student')
  @ApiOperation({ summary: 'Start a quiz attempt' })
  async startAttempt(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('quizId') quizId: string,
  ) {
    return this.quizAttemptsService.startAttempt(quizId, user.userId);
  }

  @Post('quiz-attempts/:attemptId/submit')
  @HttpCode(HttpStatus.OK)
  @Roles('student')
  @ApiOperation({ summary: 'Submit a quiz attempt with responses' })
  async submitAttempt(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('attemptId') attemptId: string,
    @Body(new ZodValidationPipe(submitQuizAttemptSchema)) body: unknown,
  ) {
    return this.quizAttemptsService.submitAttempt(
      attemptId,
      user.userId,
      submitQuizAttemptSchema.parse(body),
    );
  }

  @Get('quiz-attempts/:attemptId')
  @Roles('student', 'tutor', 'admin', 'super_admin')
  @ApiOperation({ summary: 'Get quiz attempt result' })
  async getAttemptResult(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('attemptId') attemptId: string,
  ) {
    return this.quizAttemptsService.getAttemptResult(attemptId, user.userId);
  }
}
