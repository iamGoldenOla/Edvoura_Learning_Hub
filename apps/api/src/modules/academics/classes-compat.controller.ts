import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { AuthenticatedRequestUser } from '../../common/auth/authenticated-user.interface.js';
import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { Roles } from '../../common/auth/roles.decorator.js';
import { RolesGuard } from '../../common/auth/roles.guard.js';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard.js';
import { AcademicsService } from './academics.service.js';

@ApiTags('academics')
@ApiBearerAuth()
@Controller('classes')
@UseGuards(SupabaseJwtGuard, RolesGuard)
export class ClassesCompatController {
  constructor(private readonly academicsService: AcademicsService) {}

  @Get('my-enrollments')
  @Roles('student')
  @ApiOperation({ summary: 'Compatibility route for student class enrollments' })
  async getMyEnrollments(@CurrentUser() user: AuthenticatedRequestUser) {
    const classes = await this.academicsService.listClasses({
      userId: user.userId,
      role: 'student',
    });

    return classes.map((entry) => ({
      id: entry.id,
      title: entry.title,
      subject: entry.subjectName,
      status: entry.status,
      startsOn: entry.startsOn,
      endsOn: entry.endsOn,
    }));
  }
}
