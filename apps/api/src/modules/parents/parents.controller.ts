import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { completeParentProfileSchema, linkExistingChildSchema, onboardChildSchema } from '@edvoura/contracts';

import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard.js';
import { Roles } from '../../common/auth/roles.decorator.js';
import { RolesGuard } from '../../common/auth/roles.guard.js';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe.js';
import type { AuthenticatedRequestUser } from '../../common/auth/authenticated-user.interface.js';
import { ParentsService } from './parents.service.js';

@ApiTags('parents')
@ApiBearerAuth()
@Controller('parents')
@UseGuards(SupabaseJwtGuard, RolesGuard)
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Patch('me/profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Complete or update parent profile' })
  async completeProfile(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body(new ZodValidationPipe(completeParentProfileSchema)) body: unknown,
  ): Promise<void> {
    await this.parentsService.completeProfile(
      user.userId,
      completeParentProfileSchema.parse(body),
    );
  }

  @Post('me/children')
  @HttpCode(HttpStatus.CREATED)
  @Roles('parent')
  @ApiOperation({ summary: 'Onboard a new child student' })
  async onboardChild(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body(new ZodValidationPipe(onboardChildSchema)) body: unknown,
  ) {
    return this.parentsService.onboardChild(user.userId, onboardChildSchema.parse(body));
  }

  @Post('me/children/link')
  @HttpCode(HttpStatus.CREATED)
  @Roles('parent')
  @ApiOperation({ summary: 'Link an existing student account to this parent using child email' })
  async linkExistingChild(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body(new ZodValidationPipe(linkExistingChildSchema)) body: unknown,
  ) {
    return this.parentsService.linkExistingChild(user.userId, linkExistingChildSchema.parse(body));
  }

  @Get('me/children')
  @Roles('parent')
  @ApiOperation({ summary: 'List linked children' })
  async listChildren(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.parentsService.listChildren(user.userId);
  }
}
