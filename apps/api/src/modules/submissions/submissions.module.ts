import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { SubmissionsController } from './submissions.controller.js';
import { SubmissionsService } from './submissions.service.js';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
