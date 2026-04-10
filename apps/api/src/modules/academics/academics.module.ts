import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module.js';
import { AcademicsController } from './academics.controller.js';
import { AcademicsService } from './academics.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [AcademicsController],
  providers: [AcademicsService],
  exports: [AcademicsService],
})
export class AcademicsModule {}
