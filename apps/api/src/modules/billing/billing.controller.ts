import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  createBillingPlanSchema,
  createSubscriptionSchema,
  updateBillingPlanSchema,
} from '@edvoura/contracts';

import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import type { AuthenticatedRequestUser } from '../../common/auth/authenticated-user.interface.js';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard.js';
import { Roles } from '../../common/auth/roles.decorator.js';
import { RolesGuard } from '../../common/auth/roles.guard.js';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe.js';
import { UserContextService } from '../users/user-context.service.js';
import { BillingService } from './billing.service.js';

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
@UseGuards(SupabaseJwtGuard, RolesGuard)
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly userContextService: UserContextService,
  ) {}

  @Get('plans')
  @ApiOperation({ summary: 'List active billing plans' })
  listPlans() {
    return this.billingService.listPlans();
  }

  @Get('me/summary')
  @ApiOperation({ summary: 'Get billing summary and entitlement for the current user' })
  async getMyBillingSummary(@CurrentUser() user: AuthenticatedRequestUser) {
    const currentUser = await this.userContextService.getCurrentUser(user.userId);
    return this.billingService.getBillingSummary(user.userId, currentUser.roles);
  }

  @Post('plans')
  @HttpCode(HttpStatus.CREATED)
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create a billing plan' })
  createPlan(@Body(new ZodValidationPipe(createBillingPlanSchema)) body: unknown) {
    return this.billingService.createPlan(createBillingPlanSchema.parse(body));
  }

  @Patch('plans/:planId')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update a billing plan' })
  updatePlan(
    @Param('planId') planId: string,
    @Body(new ZodValidationPipe(updateBillingPlanSchema)) body: unknown,
  ) {
    return this.billingService.updatePlan(planId, updateBillingPlanSchema.parse(body));
  }

  @Post('subscriptions')
  @HttpCode(HttpStatus.CREATED)
  @Roles('parent', 'admin', 'super_admin')
  @ApiOperation({ summary: 'Create a local subscription and invoice for checkout' })
  async createSubscription(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body(new ZodValidationPipe(createSubscriptionSchema)) body: unknown,
  ) {
    const currentUser = await this.userContextService.getCurrentUser(user.userId);
    return this.billingService.createSubscription(
      user.userId,
      currentUser.roles,
      createSubscriptionSchema.parse(body),
    );
  }
}
