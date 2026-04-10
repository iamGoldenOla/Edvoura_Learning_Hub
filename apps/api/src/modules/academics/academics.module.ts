import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module.js';
import { EnvironmentModule } from '../../common/config/environment.module.js';
import { AcademicsController } from './academics.controller.js';
import { AcademicsService } from './academics.service.js';
import { LiveSessionService } from './live-session.service.js';

@Module({
  imports: [DatabaseModule, EnvironmentModule],
  controllers: [AcademicsController],
  providers: [AcademicsService, LiveSessionService],
  exports: [AcademicsService, LiveSessionService],
})
export class AcademicsModule {}
