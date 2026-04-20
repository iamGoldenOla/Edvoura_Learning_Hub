import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module.js';
import { EnvironmentModule } from '../../common/config/environment.module.js';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';
import { ResendWebhookController } from './resend-webhook.controller.js';

@Module({
  imports: [DatabaseModule, EnvironmentModule],
  controllers: [ResendWebhookController, NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
