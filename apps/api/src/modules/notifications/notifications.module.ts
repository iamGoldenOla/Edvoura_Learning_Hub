import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module.js';
import { EnvironmentModule } from '../../common/config/environment.module.js';
import { NotificationsService } from './notifications.service.js';

@Module({
  imports: [DatabaseModule, EnvironmentModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
