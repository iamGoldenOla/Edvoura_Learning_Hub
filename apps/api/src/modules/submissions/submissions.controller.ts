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
import { submitAssignmentSchema, gradeSubmissionSchema } from '@edvoura/contracts';

import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard.js';
import { Roles } from '../../common/auth/roles.decorator.js';
import { RolesGuard } from '../../common/auth/roles.guard.js';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe.js';
import type { AuthenticatedRequestUser } from '../../common/auth/authenticated-user.interface.js';
import { SubmissionsService } from './submissions.service.js';

@ApiTags('submissions')
@ApiBearerAuth()
@Controller('academics')
@UseGuards(SupabaseJwtGuard, RolesGuard)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('assignments/:assignmentId/submissions')
  @HttpCode(HttpStatus.CREATED)
  @Roles('student')
  @ApiOperation({ summary: 'Submit work for an assignment' })
  async submitAssignment(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('assignmentId') assignmentId: string,
    @Body(new ZodValidationPipe(submitAssignmentSchema)) body: unknown,
  ) {
    return this.submissionsService.submitAssignment(
      assignmentId,
      user.userId,
      submitAssignmentSchema.parse(body),
    );
  }

  @Get('assignments/:assignmentId/submissions')
  @Roles('tutor', 'admin', 'super_admin')
  @ApiOperation({ summary: 'List all submissions for an assignment' })
  async listSubmissions(@Param('assignmentId') assignmentId: string) {
    return this.submissionsService.listSubmissions(assignmentId);
  }

  @Get('assignments/:assignmentId/submissions/me')
  @Roles('student')
  @ApiOperation({ summary: 'Get my submission for an assignment' })
  async getMySubmission(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.submissionsService.getMySubmission(assignmentId, user.userId);
  }

  @Post('submissions/:submissionId/grade')
  @HttpCode(HttpStatus.OK)
  @Roles('tutor', 'admin', 'super_admin')
  @ApiOperation({ summary: 'Grade a submission' })
  async gradeSubmission(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('submissionId') submissionId: string,
    @Body(new ZodValidationPipe(gradeSubmissionSchema)) body: unknown,
  ) {
    return this.submissionsService.gradeSubmission(
      submissionId,
      user.userId,
      gradeSubmissionSchema.parse(body),
    );
  }
}
