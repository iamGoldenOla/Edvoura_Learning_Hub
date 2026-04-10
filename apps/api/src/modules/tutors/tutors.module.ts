import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module.js';
import { TutorsController } from './tutors.controller.js';
import { TutorsService } from './tutors.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [TutorsController],
  providers: [TutorsService],
  exports: [TutorsService],
})
export class TutorsModule {}
