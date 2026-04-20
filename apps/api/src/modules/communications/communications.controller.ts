import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  listDashboardChatMessagesQuerySchema,
  postDashboardChatMessageSchema,
  publishLiveContentSchema,
} from '@edvoura/contracts';

import type { AuthenticatedRequestUser } from '../../common/auth/authenticated-user.interface.js';
import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard.js';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe.js';
import { CommunicationsService } from './communications.service.js';

@ApiTags('communications')
@ApiBearerAuth()
@Controller('communications')
@UseGuards(SupabaseJwtGuard)
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Get('live-content/current')
  @ApiOperation({ summary: 'Get latest live teaching content published by a tutor' })
  async getCurrentLiveContent() {
    return this.communicationsService.getCurrentLiveContent();
  }

  @Post('live-content')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Publish live teaching content (tutor only)' })
  async publishLiveContent(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body(new ZodValidationPipe(publishLiveContentSchema)) body: unknown,
  ) {
    return this.communicationsService.publishLiveContent(
      user.userId,
      publishLiveContentSchema.parse(body),
    );
  }

  @Delete('live-content/current')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear active live content for current tutor' })
  async clearMyLiveContent(@CurrentUser() user: AuthenticatedRequestUser) {
    await this.communicationsService.clearMyLiveContent(user.userId);
  }

  @Get('messages')
  @ApiOperation({ summary: 'List dashboard chat messages by channel' })
  async listMessages(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query(new ZodValidationPipe(listDashboardChatMessagesQuerySchema)) query: unknown,
  ) {
    return this.communicationsService.listMessages(
      user.userId,
      listDashboardChatMessagesQuerySchema.parse(query),
    );
  }

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Post a dashboard chat message' })
  async postMessage(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body(new ZodValidationPipe(postDashboardChatMessageSchema)) body: unknown,
  ) {
    return this.communicationsService.postMessage(user.userId, postDashboardChatMessageSchema.parse(body));
  }
}
