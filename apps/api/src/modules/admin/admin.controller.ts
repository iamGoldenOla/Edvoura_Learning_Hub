import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  assignRoleSchema,
  approveTutorSchema,
  rejectTutorSchema,
  runAdminOperationSchema,
  type AppRole,
} from '@edvoura/contracts';

import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard.js';
import { Roles } from '../../common/auth/roles.decorator.js';
import { RolesGuard } from '../../common/auth/roles.guard.js';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe.js';
import type { AuthenticatedRequestUser } from '../../common/auth/authenticated-user.interface.js';
import { AdminService } from './admin.service.js';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(SupabaseJwtGuard, RolesGuard)
@Roles('admin', 'super_admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('users/:userId/roles')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('super_admin')
  @ApiOperation({ summary: 'Assign a role to a user' })
  async assignRole(
    @CurrentUser() admin: AuthenticatedRequestUser,
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(assignRoleSchema)) body: unknown,
  ): Promise<void> {
    await this.adminService.assignRole(admin.userId, userId, assignRoleSchema.parse(body));
  }

  @Delete('users/:userId/roles/:role')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('super_admin')
  @ApiOperation({ summary: 'Revoke a role from a user' })
  async revokeRole(
    @Param('userId') userId: string,
    @Param('role') role: string,
  ): Promise<void> {
    await this.adminService.revokeRole(userId, role as AppRole);
  }

  @Get('users/:userId/roles')
  @Roles('super_admin')
  @ApiOperation({ summary: 'List all role assignments for a user' })
  async listUserRoles(@Param('userId') userId: string) {
    return this.adminService.listUserRoles(userId);
  }

  @Post('operations/run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run an admin dashboard operation' })
  async runOperation(
    @CurrentUser() admin: AuthenticatedRequestUser,
    @Body(new ZodValidationPipe(runAdminOperationSchema)) body: unknown,
  ) {
    return this.adminService.runOperation(admin.userId, runAdminOperationSchema.parse(body));
  }

  @Get('tutors/pending')
  @ApiOperation({ summary: 'List tutors awaiting approval' })
  async listPendingTutors() {
    return this.adminService.listPendingTutors();
  }

  @Post('tutors/:userId/approve')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Approve a tutor application' })
  async approveTutor(
    @CurrentUser() admin: AuthenticatedRequestUser,
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(approveTutorSchema)) body: unknown,
  ): Promise<void> {
    await this.adminService.approveTutor(admin.userId, userId, approveTutorSchema.parse(body));
  }

  @Post('tutors/:userId/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reject a tutor application' })
  async rejectTutor(
    @CurrentUser() admin: AuthenticatedRequestUser,
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(rejectTutorSchema)) body: unknown,
  ): Promise<void> {
    await this.adminService.rejectTutor(admin.userId, userId, rejectTutorSchema.parse(body));
  }
}
