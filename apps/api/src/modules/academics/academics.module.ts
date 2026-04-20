import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module.js';
import { EnvironmentModule } from '../../common/config/environment.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { AcademicsController } from './academics.controller.js';
import { AcademicsService } from './academics.service.js';
import { ClassesCompatController } from './classes-compat.controller.js';
import { LearningOrchestrationService } from './learning-orchestration.service.js';
import { LiveSessionService } from './live-session.service.js';

@Module({
  imports: [DatabaseModule, EnvironmentModule, NotificationsModule],
  controllers: [AcademicsController, ClassesCompatController],
  providers: [AcademicsService, LiveSessionService, LearningOrchestrationService],
  exports: [AcademicsService, LiveSessionService],
})
export class AcademicsModule {}
