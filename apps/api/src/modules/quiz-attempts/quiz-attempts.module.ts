import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module.js';
import { QuizAttemptsController } from './quiz-attempts.controller.js';
import { QuizAttemptsService } from './quiz-attempts.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [QuizAttemptsController],
  providers: [QuizAttemptsService],
  exports: [QuizAttemptsService],
})
export class QuizAttemptsModule {}
